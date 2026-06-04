<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'first_name'  => 'sometimes|string',
            'last_name'   => 'sometimes|string',
            'phone'       => 'nullable|string',
            'address1'    => 'nullable|string',
            'address2'    => 'nullable|string',
            'city'        => 'nullable|string',
            'country'     => 'nullable|string',
            'postal_code' => 'nullable|string',
        ]);

        $profile = $request->user()->profile ?? new Profile(['user_id' => $request->user()->id]);
        $profile->fill($data)->save();

        return response()->json($request->user()->fresh()->load('profile'));
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $request->user()->update(['password' => $data['password']]);
        return response()->json(['message' => 'Password updated.']);
    }
}
