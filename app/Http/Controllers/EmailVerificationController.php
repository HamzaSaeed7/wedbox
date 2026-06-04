<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Verify the email address via the link sent in the email.
     * This is a web route (no auth needed) — browser lands here from email.
     */
    public function verify($id, $hash)
    {
        $appUrl = config('app.url', 'http://localhost:8000');
        $user = User::find($id);

        if (!$user) {
            return redirect($appUrl . '/auth?verified=0&reason=invalid');
        }

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect($appUrl . '/auth?verified=0&reason=invalid');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($appUrl . '/auth?verified=1&already=1');
        }

        $user->markEmailAsVerified();

        return redirect($appUrl . '/auth?verified=1');
    }

    /**
     * Resend the verification email.
     * Public API — user has no token yet.
     */
    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Don't leak whether the account exists
        if (!$user) {
            return response()->json(['message' => 'If that address is registered, we\'ve sent a new verification email.']);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.'], 422);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email resent.']);
    }
}
