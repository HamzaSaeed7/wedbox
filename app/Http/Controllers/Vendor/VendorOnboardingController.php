<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StripeController;
use App\Models\Category;
use App\Models\City;
use App\Models\VendorProfile;
use Illuminate\Http\Request;

class VendorOnboardingController extends Controller
{
    /**
     * Render the onboarding Inertia page.
     * GET /vendor/onboarding
     */
    public function page(Request $request)
    {
        $user = $request->user();

        // If not a vendor, send home
        if ($user->role !== 'vendor') {
            return redirect('/');
        }

        // If coming back from Stripe with session_id — verify and activate
        $sessionId = $request->get('session_id');
        if ($sessionId && $user->vendor_subscription_status !== 'active') {
            StripeController::verifyAndActivate($user, $sessionId);
            $user->refresh();
        }

        // No active subscription → go to pricing
        if ($user->vendor_subscription_status !== 'active') {
            return redirect('/vendor/pricing');
        }

        // Already completed onboarding → go to dashboard
        if ($user->vendorProfile?->onboarding_completed) {
            return redirect('/dashboard/vendor');
        }

        return inertia('Vendor/Onboarding', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'cities'     => City::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Save onboarding data.
     * POST /api/vendor/onboarding
     */
    public function complete(Request $request)
    {
        $data = $request->validate([
            'business_name'        => 'required|string|max:255',
            'business_description' => 'nullable|string|max:2000',
            'category_id'          => 'required|integer|exists:categories,id',
            'address1'             => 'nullable|string|max:255',
            'address2'             => 'nullable|string|max:255',
            'country'              => 'nullable|string|max:100',
            'city'                 => 'nullable|string|max:100',
            'phone'                => 'nullable|string|max:50',
            'avatar_url'           => 'nullable|string',
        ]);

        $user = $request->user();

        // Can't complete onboarding without an active subscription
        if ($user->vendor_subscription_status !== 'active') {
            return response()->json(['message' => 'No active subscription.'], 403);
        }

        // Create or update vendor profile
        $vendorProfile = $user->vendorProfile ?? new VendorProfile(['user_id' => $user->id]);
        $vendorProfile->fill(array_merge($data, [
            'contact_first_name'   => $user->profile?->first_name ?? '',
            'contact_last_name'    => $user->profile?->last_name  ?? '',
            'onboarding_completed' => true,
        ]))->save();

        return response()->json([
            'message' => 'Onboarding complete.',
            'user'    => $user->fresh()->load('profile', 'vendorProfile'),
        ]);
    }
}
