<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'service_id' => 'required|exists:services,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string',
        ]);

        $hasApprovedOrder = Order::where('user_id', $request->user()->id)
            ->where('service_id', $data['service_id'])
            ->where('status', 'approved')
            ->exists();

        if (!$hasApprovedOrder) {
            return response()->json(['message' => 'You must have an approved booking to leave a review.'], 403);
        }

        $review = Review::updateOrCreate(
            ['service_id' => $data['service_id'], 'user_id' => $request->user()->id],
            ['rating' => $data['rating'], 'comment' => $data['comment'] ?? null]
        );

        return response()->json($review->load('user'), 201);
    }
}
