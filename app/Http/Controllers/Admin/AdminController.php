<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

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
        $user->update(['banned_at' => now()]);
        return response()->json(['message' => 'User banned.']);
    }

    public function unban(User $user)
    {
        $user->update(['banned_at' => null]);
        return response()->json(['message' => 'User unbanned.']);
    }

    public function services()
    {
        return response()->json(
            Service::with('category', 'vendor.vendorProfile')->latest()->paginate(20)
        );
    }

    public function deleteService(Service $service)
    {
        $service->delete();
        return response()->json(null, 204);
    }
}
