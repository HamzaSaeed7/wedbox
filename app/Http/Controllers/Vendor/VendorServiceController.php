<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Concerns\HandlesServiceSubdata;
use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class VendorServiceController extends Controller
{
    use HandlesServiceSubdata;

    public function index(Request $request)
    {
        $user = $request->user();

        // Auto-create the service from onboarding data on first visit
        $this->ensureServiceForVendor($user);

        $services = Service::with('category')
            ->where('vendor_id', $user->id)
            ->latest()
            ->get();

        return response()->json($services);
    }

    // ── Update sub-table data for a service ───────────────────────────────
    public function updateSubdata(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $service->load('category');
        $this->saveServiceSubdata($service, $request->input('data', []));

        $fresh = $service->fresh()->load('category');
        $this->loadSubData($fresh);
        return response()->json($fresh);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'title'         => 'required|string',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string',
            'minimum_price' => 'nullable|numeric|min:0',
            'images'        => 'nullable|array|min:2',
            'sub_data'      => 'nullable|array',
        ]);

        $service = Service::create([
            'vendor_id'     => $request->user()->id,
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

    public function show(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        $service->load('category', 'reviews.user.profile');
        $this->loadSubData($service);
        return response()->json($service);
    }

    public function update(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validate([
            'title'           => 'sometimes|string',
            'description'     => 'nullable|string',
            'location'        => 'nullable|string',
            'minimum_price'   => 'nullable|numeric|min:0',
            'images'          => 'nullable|array',
            'blocked_dates'   => 'nullable|array',
            'blocked_dates.*' => 'date_format:Y-m-d',
            'status'          => 'in:active,inactive,draft',
        ]);

        $service->update($data);
        return response()->json($service);
    }

    public function destroy(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $service->delete();
        return response()->json(null, 204);
    }
}
