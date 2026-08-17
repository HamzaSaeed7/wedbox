<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    private function transform(BlogPost $p): array
    {
        $bodyText = strip_tags($p->body ?? '');
        $excerpt  = mb_strlen($bodyText) > 180
            ? mb_substr($bodyText, 0, 180) . '…'
            : $bodyText;

        return [
            'id'       => $p->id,
            'slug'     => $p->slug,
            'title'    => $p->title,
            'excerpt'  => $excerpt,
            'cover'    => $p->cover_image_url ?? '',
            'author'   => $p->author ?? 'WedBox Editorial',
            'readTime' => $p->read_time_minutes ?? 5,
            'date'     => $p->published_at?->format('d M Y') ?? '',
            'category' => $p->category ?? 'Editorial',
            'body'     => $p->body ?? '',
        ];
    }

    public function index()
    {
        $posts = BlogPost::whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json($posts->map(fn ($p) => $this->transform($p))->values());
    }

    /**
     * Admin listing — returns raw model rows (not the public DTO) and includes
     * unpublished drafts, which the admin needs in order to edit them.
     */
    public function adminIndex()
    {
        $posts = BlogPost::orderByRaw('published_at IS NULL DESC')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    public function show(string $slug)
    {
        $post = BlogPost::where('slug', $slug)->whereNotNull('published_at')->firstOrFail();
        return response()->json($this->transform($post));
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
            'author'            => 'nullable|string',
            'category'          => 'nullable|string',
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
            'author'            => 'nullable|string',
            'category'          => 'nullable|string',
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
