<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusNotification;
use Illuminate\Http\Request;

class VendorOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('service.category', 'user.profile')
            ->where('vendor_id', $request->user()->id)
            ->where('status', '!=', 'in_cart');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function show(Request $request, Order $order)
    {
        if ($order->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $order->load('service.category', 'user.profile');

        $detailRelation = $order->detail();
        $detail = $detailRelation ? $detailRelation->first() : null;

        return response()->json(array_merge($order->toArray(), ['detail' => $detail]));
    }

    public function approve(Request $request, Order $order)
    {
        if ($order->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $order->update(['status' => 'approved']);

        // Notify the customer
        try {
            $order->load('service', 'user', 'vendor.vendorProfile');
            $order->user?->notify(new OrderStatusNotification($order));
        } catch (\Throwable) {}

        return response()->json($order);
    }

    public function reject(Request $request, Order $order)
    {
        if ($order->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $order->update(['status' => 'rejected']);

        // Notify the customer
        try {
            $order->load('service', 'user', 'vendor.vendorProfile');
            $order->user?->notify(new OrderStatusNotification($order));
        } catch (\Throwable) {}

        return response()->json($order);
    }
}
