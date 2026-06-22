<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesServiceSubdata;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Http\Request;

/**
 * Lets an admin complete a vendor's onboarding profile and build out their
 * service + per-category details on the vendor's behalf — bypassing the
 * subscription gate. Reuses HandlesServiceSubdata so the heavy per-category
 * save/load logic stays a single source of truth with the vendor flow.
 */
class AdminVendorSetupController extends Controller
{
    use HandlesServiceSubdata;

    public function show(User $vendor)
    {
        abort_unless($vendor->role === 'vendor', 404);

        $vendor->load('vendorProfile.category');
        $profile = $vendor->vendorProfile;

        // If onboarding's done with a category, make sure a draft service exists
        if ($profile && $profile->onboarding_completed && $profile->category_id) {
            $this->ensureServiceForVendor($vendor);
        }

        $services = Service::with('category')
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->get()
            ->map(function (Service $service) {
                $this->loadSubData($service);
                return $service;
            });

        return response()->json([
            'profile'    => $profile,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'cities'     => City::orderBy('name')->get(['id', 'name']),
            'services'   => $services,
        ]);
    }

    public function saveOnboarding(Request $request, User $vendor)
    {
        abort_unless($vendor->role === 'vendor', 404);

        $data = $request->validate([
            'business_name'        => 'required|string|max:255',
            'business_description' => 'nullable|string|max:2000',
            'category_id'          => 'required|integer|exists:categories,id',
            'address1'             => 'nullable|string|max:255',
            'address2'             => 'nullable|string|max:255',
            'country'              => 'nullable|string|max:100',
            'city'                 => 'nullable|string|max:100',
            'phone'                => 'nullable|string|max:50',
            'avatar_url'           => 'nullable|string',
        ]);

        $profile = $vendor->vendorProfile ?? new VendorProfile(['user_id' => $vendor->id]);

        // Category is set once during onboarding and immutable thereafter —
        // ignore changes if a service already exists for this vendor.
        if (Service::where('vendor_id', $vendor->id)->exists() && $profile->category_id) {
            unset($data['category_id']);
        }

        $profile->fill(array_merge($data, [
            'contact_first_name'   => $vendor->profile?->first_name ?? '',
            'contact_last_name'    => $vendor->profile?->last_name  ?? '',
            'onboarding_completed' => true,
        ]))->save();

        return response()->json([
            'message' => 'Onboarding saved.',
            'profile' => $profile->fresh()->load('category'),
        ]);
    }

    public function createService(Request $request, User $vendor)
    {
        abort_unless($vendor->role === 'vendor', 404);

        $data = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'title'         => 'required|string',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string',
            'minimum_price' => 'nullable|numeric|min:0',
            'images'        => 'nullable|array',
        ]);

        $service = Service::create([
            'vendor_id'     => $vendor->id,
            'category_id'   => $data['category_id'],
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'location'      => $data['location'] ?? null,
            'minimum_price' => $data['minimum_price'] ?? 0,
            'images'        => $data['images'] ?? [],
            'status'        => 'draft',
        ]);

        return response()->json($service->load('category'), 201);
    }

    public function updateService(Request $request, Service $service)
    {
        $data = $request->validate([
            'title'         => 'sometimes|string',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string',
            'minimum_price' => 'nullable|numeric|min:0',
            'images'        => 'nullable|array',
            'status'        => 'in:active,inactive,draft',
        ]);

        $service->update($data);
        return response()->json($service->load('category'));
    }

    public function updateSubdata(Request $request, Service $service)
    {
        $service->load('category');
        $this->saveServiceSubdata($service, $request->input('data', []));

        $fresh = $service->fresh()->load('category');
        $this->loadSubData($fresh);
        return response()->json($fresh);
    }
}
