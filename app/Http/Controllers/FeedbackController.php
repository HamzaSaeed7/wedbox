<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'feedback_text' => 'required|string|max:2000',
            'experience'    => 'required|in:happy,sad,angry',
        ]);

        $user = $request->user();

        $feedback = Feedback::create([
            'user_id'       => $user->id,
            'feedback_text' => $data['feedback_text'],
            'experience'    => $data['experience'],
        ]);

        // Notify the team by email. Don't fail the request if mail delivery is
        // down — the feedback is already saved and visible in the admin panel.
        try {
            $body = "New feedback was submitted on Wedbi.\n\n"
                . 'Experience: ' . ucfirst($data['experience']) . "\n"
                . "From: {$user->name} <{$user->email}> (role: {$user->role})\n"
                . "User ID: {$user->id}\n\n"
                . "Comments:\n{$data['feedback_text']}\n";

            Mail::raw($body, function ($message) use ($user) {
                $message->to('info@wedbi.io')
                    ->subject('New Wedbi feedback (' . $user->email . ')')
                    ->replyTo($user->email, $user->name);
            });
        } catch (\Throwable $e) {
            Log::error('Failed to email feedback to info@wedbi.io', [
                'feedback_id' => $feedback->id,
                'error'       => $e->getMessage(),
            ]);
        }

        return response()->json($feedback, 201);
    }
}
