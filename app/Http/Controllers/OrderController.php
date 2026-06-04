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
}
