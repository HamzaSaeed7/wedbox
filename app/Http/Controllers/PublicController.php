<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\ContactMessage;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function categories()
    {
        return response()->json(Category::orderBy('order')->get());
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
