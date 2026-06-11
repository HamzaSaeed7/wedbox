<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailVerificationController extends Controller
{
    /**
     * Verify the email address via the link sent in the email.
     * Auto-logs the user in after verification and redirects to the right destination.
     */
    public function verify(Request $request, $id, $hash)
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
            // Already verified — just log them in and send to dashboard
            Auth::login($user, remember: true);
            $request->session()->regenerate();
            return redirect($appUrl . $this->redirectAfterVerify($user));
        }

        $user->markEmailAsVerified();
        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect($appUrl . $this->redirectAfterVerify($user));
    }

    private function redirectAfterVerify(User $user): string
    {
        return match ($user->role) {
            'vendor'  => '/vendor/pricing',
            'admin'   => '/dashboard/admin',
            default   => '/dashboard/buyer',
        };
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
