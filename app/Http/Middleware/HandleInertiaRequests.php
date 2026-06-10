<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        try {
            $user = $request->user();
        } catch (\Exception $e) {
            $user = null;
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'                         => $user->id,
                    'name'                       => $user->name,
                    'email'                      => $user->email,
                    'role'                       => $user->role,
                    'profile'                    => $user->profile,
                    'vendor_subscription_status' => $user->vendor_subscription_status,
                    'vendor_plan'                => $user->vendor_plan,
                    'vendorProfile'              => $user->vendorProfile,
                ] : null,
            ],
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }
}
