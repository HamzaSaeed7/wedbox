<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\ContactMessage;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function categories()
    {
        return response()->json(Category::orderBy('order')->get());
    }

    /**
     * Live active-service counts for the homepage destination cards, keyed by
     * location name. Mirrors the search filter (location LIKE %name%) so a card's
     * count matches what clicking through to /search?location=… actually shows.
     */
    public function destinations()
    {
        $names = ['Ayia Napa', 'Paphos', 'Limassol', 'Protaras'];

        $counts = collect($names)->mapWithKeys(fn ($name) => [
            $name => Service::where('status', 'active')
                ->where('location', 'like', '%' . $name . '%')
                ->count(),
        ]);

        return response()->json($counts);
    }

    public function cities()
    {
        return response()->json(City::orderBy('name')->get());
    }

    public function testimonials()
    {
        return response()->json(Testimonial::latest()->get());
    }

    public function contact(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string',
            'email'   => 'required|email',
            'phone'   => 'nullable|string',
            'service' => 'nullable|string',
            'message' => 'required|string',
        ]);

        ContactMessage::create($data);

        return response()->json(['message' => 'Message received.'], 201);
    }
}
