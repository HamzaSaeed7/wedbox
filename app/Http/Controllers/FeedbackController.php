<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'feedback_text' => 'required|string|max:2000',
            'experience'    => 'required|in:happy,sad,neutral',
        ]);

        $feedback = Feedback::create([
            'user_id'       => $request->user()->id,
            'feedback_text' => $request->feedback_text,
            'experience'    => $request->experience,
        ]);

        return response()->json($feedback, 201);
    }
}
