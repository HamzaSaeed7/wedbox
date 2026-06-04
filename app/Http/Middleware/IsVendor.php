<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsVendor
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'vendor') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($request->user()->isBanned()) {
            return response()->json(['message' => 'Account suspended.'], 403);
        }

        return $next($request);
    }
}
