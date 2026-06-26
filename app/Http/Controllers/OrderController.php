<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('service.category')
            ->where('user_id', $request->user()->id)
            ->where('status', '!=', 'in_cart');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)->where('status', '!=', 'in_cart');

        return response()->json([
            'total_spent'       => (clone $orders)->whereIn('status', ['pending', 'approved', 'completed'])->sum('price'),
            'counts_by_status'  => (clone $orders)->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
        ]);
    }

    /**
     * Cancel a booking. Buyers may only cancel their own orders, and only while
     * they are still pending — once a vendor has approved, cancellation is blocked.
     */
    public function cancel(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending bookings can be cancelled.'], 422);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json($order->fresh()->load('service.category'));
    }
}
