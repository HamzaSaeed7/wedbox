<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class VendorProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('vendorProfile'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'business_name'        => 'sometimes|string',
            'business_description' => 'nullable|string',
            'contact_first_name'   => 'sometimes|string',
            'contact_last_name'    => 'sometimes|string',
            'contact_title'        => 'nullable|string',
            'location'             => 'nullable|string',
        ]);

        $profile = $request->user()->vendorProfile ?? new VendorProfile(['user_id' => $request->user()->id]);
        $profile->fill($data)->save();

        return response()->json($profile);
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

    public function deleteAccount(Request $request)
    {
        $request->user()->delete();
        return response()->json(null, 204);
    }
}
