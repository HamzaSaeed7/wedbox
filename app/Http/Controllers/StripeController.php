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
     * Return the vendor's current subscription and recent invoices.
     * GET /api/vendor/billing-info
     */
    public function billingInfo(Request $request)
    {
        $user = $request->user();

        $info = [
            'plan'   => $user->vendor_plan,
            'status' => $user->vendor_subscription_status,
            'subscription' => null,
            'invoices'     => [],
        ];

        if (!$user->stripe_customer_id) {
            return response()->json($info);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $subs = \Stripe\Subscription::all([
                'customer' => $user->stripe_customer_id,
                'limit'    => 1,
                'expand'   => ['data.items.data.price'],
            ]);

            if (!empty($subs->data)) {
                $sub = $subs->data[0];
                $price = $sub->items->data[0]->price ?? null;
                $info['subscription'] = [
                    'id'             => $sub->id,
                    'status'         => $sub->status,
                    'current_period_end' => $sub->current_period_end,
                    'cancel_at_period_end' => $sub->cancel_at_period_end,
                    'amount'         => $price ? $price->unit_amount / 100 : null,
                    'currency'       => $price ? strtoupper($price->currency) : 'EUR',
                    'interval'       => $price?->recurring?->interval ?? null,
                ];

                // Sync DB status if Stripe shows the subscription is no longer active
                if ($sub->status === 'canceled' && $user->vendor_subscription_status !== 'cancelled') {
                    $user->update(['vendor_subscription_status' => 'cancelled']);
                    $info['status'] = 'cancelled';
                }
            }

            $invoices = \Stripe\Invoice::all([
                'customer' => $user->stripe_customer_id,
                'limit'    => 5,
            ]);

            $info['invoices'] = array_map(fn($inv) => [
                'id'     => $inv->id,
                'number' => $inv->number,
                'date'   => $inv->created,
                'amount' => $inv->amount_paid / 100,
                'currency' => strtoupper($inv->currency),
                'status' => $inv->status,
                'pdf'    => $inv->invoice_pdf,
            ], $invoices->data);

        } catch (\Exception $e) {
            // Stripe unavailable — return what we have from DB
        }

        return response()->json($info);
    }

    /**
     * Create a Stripe billing portal session so the vendor can manage their subscription.
     * POST /api/vendor/billing-portal
     */
    public function billingPortal(Request $request)
    {
        $user = $request->user();

        if (!$user->stripe_customer_id) {
            return response()->json(['message' => 'No billing account found.'], 422);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $session = \Stripe\BillingPortal\Session::create([
            'customer'   => $user->stripe_customer_id,
            'return_url' => config('app.url') . '/dashboard/vendor?sub=billing',
        ]);

        return response()->json(['url' => $session->url]);
    }

    /**
     * Cancel the vendor's active Stripe subscription immediately.
     * POST /api/vendor/cancel-subscription
     */
    public function cancelSubscription(Request $request)
    {
        $user = $request->user();

        if (!$user->stripe_customer_id) {
            return response()->json(['message' => 'No billing account found.'], 422);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        // Find the active subscription for this customer
        $subscriptions = \Stripe\Subscription::all([
            'customer' => $user->stripe_customer_id,
            'status'   => 'active',
            'limit'    => 1,
        ]);

        if ($subscriptions->data) {
            $subscriptions->data[0]->cancel();
        }

        $user->update(['vendor_subscription_status' => 'cancelled']);

        return response()->json(['message' => 'Subscription cancelled.']);
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
