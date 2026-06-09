<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with('category', 'vendor.vendorProfile')
            ->where('status', 'active');

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }
        if ($request->location) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }
        if ($request->min_price) {
            $query->where('minimum_price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('minimum_price', '<=', $request->max_price);
        }
        if ($request->rating_min) {
            $query->where('rating', '>=', $request->rating_min);
        }

        $sort = $request->sort ?? 'created_at';
        $dir  = $request->get('sort_dir', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy(in_array($sort, ['rating', 'minimum_price', 'created_at']) ? $sort : 'created_at', $dir);

        return response()->json($query->paginate(12));
    }

    public function featured()
    {
        $services = Service::with('category', 'vendor.vendorProfile')
            ->where('status', 'active')
            ->where('is_featured', true)
            ->orderBy('rating', 'desc')
            ->limit(8)
            ->get();

        return response()->json($services);
    }

    public function show(Service $service)
    {
        $service->load('category', 'vendor.vendorProfile', 'reviews.user.profile');
        $this->loadSubData($service);
        return response()->json($service);
    }

    private function loadSubData(Service $service): void
    {
        $slug = $service->category->slug ?? '';

        match ($slug) {
            'venue'         => $service->load('venue'),
            'catering'      => $service->load('catering.cuisines.menus.items'),
            'florist'       => $service->load('florist.packages', 'florist.colors', 'florist.designs', 'florist.addons'),
            'car-hire'      => $service->load('carHire.hours', 'carHire.addons'),
            'photography'   => $service->load('photography.packages.addons'),
            'music'         => $service->load('music'),
            'bride-dress'   => $service->load('brideDress.extras'),
            'groom-suite'   => $service->load('groomSuite'),
            'best-man-suit' => $service->load('bestManSuit'),
            'bridesmaids'   => $service->load('bridesmaidDress'),
            'flower-girl'   => $service->load('flowerGirlDress'),
            'yacht-hire'    => $service->load('yachtHire.hours'),
            'bachelor'      => $service->load('bachelor'),
            'bachelorette'  => $service->load('bachelorette'),
            'hotel'         => $service->load('accommodation.rooms', 'accommodation.facilities'),
            'bar'           => $service->load('bar.menus.items'),
            'makeup'        => $service->load('makeup'),
            'hair'          => $service->load('hair'),
            default         => null,
        };
    }
}
