<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─── Web / Inertia session-based auth ─────────────────────────────────────

    /**
     * Session login — called from the Inertia frontend via Axios.
     * Starts a Laravel session; no token returned.
     */
    public function webLogin(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        if ($user->isBanned()) {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'needs_verification' => true,
                'email'              => $user->email,
                'message'            => 'Please verify your email address before signing in.',
            ], 403);
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        $user->load('profile', 'vendorProfile');

        // Determine where to send the user after login
        $redirect = match ($user->role) {
            'admin'  => '/dashboard/admin',
            'vendor' => $this->vendorRedirect($user),
            default  => '/dashboard/buyer',
        };

        return response()->json([
            'user'     => $user,
            'redirect' => $redirect,
        ]);
    }

    /** Determine the correct post-login destination for a vendor. */
    private function vendorRedirect(\App\Models\User $user): string
    {
        if ($user->vendor_subscription_status !== 'active') {
            return '/vendor/pricing';
        }
        if (!$user->vendorProfile?->onboarding_completed) {
            return '/vendor/onboarding';
        }
        return '/dashboard/vendor';
    }

    /**
     * Session register — creates account, sends verification email.
     */
    public function webRegister(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => 'in:customer,vendor',
        ]);

        $user = User::create([
            'name'     => $data['first_name'] . ' ' . $data['last_name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => $data['role'] ?? 'customer',
        ]);

        Profile::create([
            'user_id'    => $user->id,
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
        ]);

        // Don't let a mail-provider failure (e.g. Brevo IP not whitelisted)
        // crash registration after the account has already been created.
        // The user still reaches the "check your inbox" step and can resend.
        $emailSent = true;
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            $emailSent = false;
            \Log::error('Verification email failed to send during registration', [
                'user_id' => $user->id,
                'email'   => $user->email,
                'error'   => $e->getMessage(),
            ]);
        }

        return response()->json([
            'needs_verification' => true,
            'email'              => $user->email,
            'email_sent'         => $emailSent,
            'message'            => $emailSent
                ? 'Account created. Please check your email to verify your address.'
                : 'Account created, but we could not send the verification email right now. Please use “Resend” shortly.',
        ], 201);
    }

    /**
     * Session logout.
     */
    public function webLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out.']);
    }

    // ─── Legacy API token auth (kept for backwards compatibility) ─────────────

    public function register(Request $request)
    {
        return $this->webRegister($request);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        if ($user->isBanned()) {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'needs_verification' => true,
                'email'              => $user->email,
                'message'            => 'Please verify your email address before signing in.',
            ], 403);
        }

        // For session support (Sanctum stateful), also start a session
        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return response()->json(['user' => $user->load('profile')]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out.']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('profile', 'vendorProfile'));
    }
}
