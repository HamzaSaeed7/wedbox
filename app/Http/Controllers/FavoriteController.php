<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->favorites()->with('category')->get()
        );
    }

    public function store(Request $request, Service $service)
    {
        $request->user()->favorites()->syncWithoutDetaching([$service->id]);
        return response()->json(['message' => 'Added to favorites.']);
    }

    public function destroy(Request $request, Service $service)
    {
        $request->user()->favorites()->detach($service->id);
        return response()->json(null, 204);
    }
}
