<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Customer as StripeCustomer;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeController extends Controller
{
    /**
     * Create a Stripe Checkout session for vendor subscription.
     * POST /api/vendor/checkout
     */
    public function createCheckout(Request $request)
    {
        $request->validate(['plan' => 'required|in:3month,12month']);

        $user = $request->user();
        Stripe::setApiKey(config('services.stripe.secret'));

        // Create or reuse Stripe customer
        if (!$user->stripe_customer_id) {
            $customer = StripeCustomer::create([
                'email' => $user->email,
                'name'  => $user->name,
                'metadata' => ['user_id' => $user->id],
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        $priceId = $request->plan === '12month'
            ? config('services.stripe.price_12month')
            : config('services.stripe.price_3month');

        $appUrl = config('app.url');

        $session = StripeSession::create([
            'customer'            => $user->stripe_customer_id,
            'mode'                => 'subscription',
            'line_items'          => [['price' => $priceId, 'quantity' => 1]],
            'success_url'         => $appUrl . '/vendor/onboarding?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'          => $appUrl . '/vendor/pricing',
            'metadata'            => [
                'user_id' => $user->id,
                'plan'    => $request->plan,
            ],
            'subscription_data'   => [
                'metadata' => [
                    'user_id' => $user->id,
                    'plan'    => $request->plan,
                ],
            ],
        ]);

        // Mark as pending with the session ID so we can verify on redirect
        $user->update([
            'vendor_plan'                 => $request->plan,
            'vendor_subscription_status'  => 'pending',
            'stripe_checkout_session_id'  => $session->id,
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }

    /**
     * Handle Stripe webhooks.
     * POST /stripe/webhook  (unprotected — verified via signature)
     */
    public function webhook(Request $request)
    {
        $payload       = $request->getContent();
        $sigHeader     = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            if ($webhookSecret) {
                $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
            } else {
                // No webhook secret configured — decode raw payload (dev only)
                $event = json_decode($payload, true);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        $type = is_array($event) ? $event['type'] : $event->type;

        if ($type === 'checkout.session.completed') {
            $session = is_array($event) ? $event['data']['object'] : $event->data->object;
            $userId  = is_array($session)
                ? ($session['metadata']['user_id'] ?? null)
                : ($session->metadata->user_id ?? null);

            if ($userId) {
                $user = User::find($userId);
                $user?->update(['vendor_subscription_status' => 'active']);
            }
        }

        return response()->json(['received' => true]);
    }

    /**
     * Verify a checkout session and mark subscription active.
     * Called by the onboarding page on success redirect.
     * GET /vendor/onboarding handles this inline — this helper is for the web controller.
     */
    public static function verifyAndActivate(User $user, string $sessionId): bool
    {
        if ($user->stripe_checkout_session_id !== $sessionId) {
            return false;
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = StripeSession::retrieve($sessionId);

            // status === 'complete' covers both payment and subscription modes
            if ($session->status === 'complete') {
                $user->update(['vendor_subscription_status' => 'active']);
                return true;
            }
        } catch (\Exception $e) {
            // Session not found or API error — ignore
        }

        return false;
    }
}
