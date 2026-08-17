<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Upload an avatar image.
     * POST /api/upload/avatar
     */
    public function avatar(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:5120', // 5 MB max
        ]);

        $file      = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename  = 'avatars/' . Str::uuid() . '.' . $extension;

        Storage::disk('s3')->put($filename, file_get_contents($file->getRealPath()));

        return response()->json(['url' => Storage::disk('s3')->url($filename)]);
    }

    /**
     * Upload a service image.
     * POST /api/upload/service-image
     */
    public function serviceImage(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:10240', // 10 MB max
        ]);

        $file      = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename  = 'services/' . Str::uuid() . '.' . $extension;

        Storage::disk('s3')->put($filename, file_get_contents($file->getRealPath()));

        return response()->json(['url' => Storage::disk('s3')->url($filename)]);
    }

    /**
     * Upload a blog post cover image.
     * POST /api/admin/upload/blog-cover
     */
    public function blogCover(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:10240', // 10 MB max
        ]);

        $file      = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename  = 'blog/' . Str::uuid() . '.' . $extension;

        Storage::disk('s3')->put($filename, file_get_contents($file->getRealPath()));

        return response()->json(['url' => Storage::disk('s3')->url($filename)]);
    }
}
