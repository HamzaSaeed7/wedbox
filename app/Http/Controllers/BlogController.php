<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        return response()->json(
            BlogPost::whereNotNull('published_at')
                ->orderBy('published_at', 'desc')
                ->paginate(10)
        );
    }

    public function show(string $slug)
    {
        $post = BlogPost::where('slug', $slug)->whereNotNull('published_at')->firstOrFail();
        return response()->json($post);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'slug'              => 'required|string|unique:blog_posts,slug',
            'title'             => 'required|string',
            'body'              => 'required|string',
            'cover_image_url'   => 'nullable|string',
            'read_time_minutes' => 'nullable|integer',
            'published_at'      => 'nullable|date',
        ]);

        return response()->json(BlogPost::create($data), 201);
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        $data = $request->validate([
            'slug'              => 'sometimes|string|unique:blog_posts,slug,' . $blogPost->id,
            'title'             => 'sometimes|string',
            'body'              => 'sometimes|string',
            'cover_image_url'   => 'nullable|string',
            'read_time_minutes' => 'nullable|integer',
            'published_at'      => 'nullable|date',
        ]);

        $blogPost->update($data);
        return response()->json($blogPost);
    }

    public function destroy(BlogPost $blogPost)
    {
        $blogPost->delete();
        return response()->json(null, 204);
    }
}
