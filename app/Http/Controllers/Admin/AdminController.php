<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function users(Request $request)
    {
        $query = User::with('profile');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->role) {
            $query->where('role', $request->role);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function ban(User $user)
    {
        $user->banned_at = now();
        $user->save();
        return response()->json(['message' => 'User banned.']);
    }

    public function unban(User $user)
    {
        $user->banned_at = null;
        $user->save();
        return response()->json(['message' => 'User unbanned.']);
    }

    public function services(Request $request)
    {
        $query = Service::with('category', 'vendor.vendorProfile')->latest();

        if ($request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('location', 'like', $search)
                  ->orWhereHas('vendor', fn ($v) => $v->where('name', 'like', $search))
                  ->orWhereHas('vendor.vendorProfile', fn ($v) => $v->where('business_name', 'like', $search));
            });
        }

        $perPage = min((int) ($request->per_page ?? 15), 100);
        return response()->json($query->paginate($perPage));
    }

    public function deleteService(Service $service)
    {
        $service->delete();
        return response()->json(null, 204);
    }

    public function toggleFeatured(Service $service)
    {
        $service->is_featured = !$service->is_featured;
        $service->save();
        return response()->json(['is_featured' => $service->is_featured]);
    }

    public function deleteUser(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }
        $user->delete();
        return response()->json(null, 204);
    }

    public function vendors(Request $request)
    {
        $query = User::with('vendorProfile.category')
            ->where('role', 'vendor')
            ->leftJoin(DB::raw('(SELECT vendor_id, COUNT(*) as total_orders, COALESCE(SUM(price), 0) as total_earning FROM orders GROUP BY vendor_id) as order_stats'), 'users.id', '=', 'order_stats.vendor_id')
            ->select('users.*', DB::raw('COALESCE(order_stats.total_orders, 0) as total_orders'), DB::raw('COALESCE(order_stats.total_earning, 0) as total_earning'));

        if ($request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('users.email', 'like', $search)
                  ->orWhereHas('vendorProfile', fn ($v) => $v->where('business_name', 'like', $search));
            });
        }

        $vendors = $query->latest('users.created_at')->paginate(15);

        $vendors->getCollection()->transform(function ($user) {
            $profile = $user->vendorProfile;
            $status = $user->banned_at
                ? 'Banned'
                : (($profile && $profile->onboarding_completed) ? 'Approved' : 'Onboarding');

            return [
                'id'             => $user->id,
                'email'          => $user->email,
                'avatar_url'     => $profile?->avatar_url,
                'business_name'  => $profile?->business_name ?? '—',
                'category'       => $profile?->category?->name ?? '—',
                'total_orders'   => (int) $user->total_orders,
                'total_earning'  => (float) $user->total_earning,
                'status'         => $status,
            ];
        });

        return response()->json($vendors);
    }

    public function orders(Request $request)
    {
        $query = Order::with('user', 'vendor', 'service')->latest();

        if ($request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->whereHas('user',   fn ($u) => $u->where('email', 'like', $search))
                  ->orWhereHas('vendor', fn ($v) => $v->where('email', 'like', $search));
            });
        }

        $orders = $query->paginate(15);

        $orders->getCollection()->transform(fn ($order) => [
            'id'            => $order->id,
            'customer_email'=> $order->user?->email ?? '—',
            'vendor_email'  => $order->vendor?->email ?? '—',
            'service'       => $order->order_type,
            'price'         => (float) $order->price,
            'received_date' => $order->created_at?->format('M d, Y'),
            'deliver_date'  => $order->deliver_date?->format('M d, Y'),
            'status'        => $order->status,
        ]);

        return response()->json($orders);
    }

    public function adminFeedback(Request $request)
    {
        $feedbacks = Feedback::with('user')
            ->latest()
            ->paginate(20);

        $feedbacks->getCollection()->transform(fn ($fb) => [
            'id'            => $fb->id,
            'feedback_text' => $fb->feedback_text,
            'user_email'    => $fb->user?->email ?? 'Guest',
            'user_role'     => $fb->user?->role ?? '—',
            'date'          => $fb->created_at->format('M d, Y'),
            'experience'    => $fb->experience,
        ]);

        return response()->json($feedbacks);
    }

    public function stats()
    {
        $totalEarning     = Order::where('status', 'approved')->sum('price');
        $thisWeekUsers    = User::where('created_at', '>=', now()->startOfWeek())->count();
        $completedOrders  = Order::where('status', 'approved')->count();
        $declinedOrders   = Order::where('status', 'rejected')->count();
        $totalVendors     = User::where('role', 'vendor')->count();
        $totalServices    = Service::count();

        $newUsers = User::with('profile')->latest()->take(5)->get()->map(fn ($u) => [
            'id'        => $u->id,
            'name'      => $u->profile?->first_name
                ? trim($u->profile->first_name . ' ' . ($u->profile->last_name ?? ''))
                : ($u->name ?? $u->email),
            'avatar_url'=> $u->profile?->avatar_url ?? null,
            'joined'    => $u->created_at->format('n/j/y'),
        ]);

        $pendingVendors = User::with('vendorProfile')
            ->where('role', 'vendor')
            ->whereHas('vendorProfile', fn ($q) => $q->where('onboarding_completed', false))
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($u) => [
                'id'           => $u->id,
                'business_name'=> $u->vendorProfile?->business_name ?? $u->name,
                'avatar_url'   => $u->vendorProfile?->avatar_url ?? null,
            ]);

        $todaysOrders = Order::with('service')->whereDate('created_at', today())->latest()->take(4)->get()
            ->map(fn ($o) => [
                'id'            => $o->id,
                'service_title' => $o->service?->title ?? $o->order_type,
                'image'         => $o->service?->images[0] ?? null,
                'date'          => $o->created_at->format('n/j/y'),
            ]);

        return response()->json([
            'total_earning'    => (float) $totalEarning,
            'this_week_users'  => (int)   $thisWeekUsers,
            'completed_orders' => (int)   $completedOrders,
            'declined_orders'  => (int)   $declinedOrders,
            'total_vendors'    => (int)   $totalVendors,
            'total_services'   => (int)   $totalServices,
            'new_users'        => $newUsers,
            'pending_vendors'  => $pendingVendors,
            'todays_orders'    => $todaysOrders,
        ]);
    }

    public function invite(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:customer,vendor,admin',
        ]);

        $tempPassword = Str::random(12);
        $user = User::create([
            'name'               => $request->name,
            'email'              => $request->email,
            'role'               => $request->role,
            'password'           => Hash::make($tempPassword),
            'email_verified_at'  => now(),
        ]);

        return response()->json([
            'user'               => $user,
            'temporary_password' => $tempPassword,
        ], 201);
    }
}
