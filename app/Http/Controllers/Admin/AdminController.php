<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
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
