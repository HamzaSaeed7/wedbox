<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\Vendor\VendorOnboardingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ─── Public pages (served via Inertia) ───────────────────────────────────────

Route::get('/',              fn ()              => inertia('Home'));
Route::get('/search',        fn (Request $req)  => inertia('Search', [
    'initialCategory' => $req->get('category', ''),
    'initialLocation' => $req->get('location', ''),
]));
Route::get('/service/{id}',  fn (int $id)       => inertia('Service', ['serviceId' => $id]));
Route::get('/about',         fn ()              => inertia('About'));
Route::get('/contact',       fn ()              => inertia('Contact'));
Route::get('/faq',           fn ()              => inertia('Faq'));
Route::get('/cart',          fn ()              => inertia('Cart'));
Route::get('/blog',          fn ()              => inertia('Blog/Index'));
Route::get('/blog/{slug}',   fn (string $slug)  => inertia('Blog/Show', ['slug' => $slug]));

// ─── Auth pages ───────────────────────────────────────────────────────────────

Route::get('/auth',         fn () => inertia('Auth'));
Route::get('/login',        fn () => inertia('Auth'))->name('login');
Route::get('/login_signup', fn () => inertia('Auth'));

// ─── Session auth (web-middleware — CSRF protected) ───────────────────────────

Route::post('/auth/login',    [AuthController::class, 'webLogin']);
Route::post('/auth/register', [AuthController::class, 'webRegister']);
Route::post('/auth/logout',   [AuthController::class, 'webLogout'])->middleware('auth');

// ─── Vendor onboarding & pricing (auth protected) ────────────────────────────

Route::middleware('auth')->group(function () {
    // Pricing — must be logged in as vendor; redirects away if already subscribed
    Route::get('/vendor/pricing', function () {
        $user = auth()->user();
        if ($user->role !== 'vendor') return redirect('/');
        if ($user->vendor_subscription_status === 'active' && $user->vendorProfile?->onboarding_completed) {
            return redirect('/dashboard/vendor');
        }
        return inertia('Vendor/Pricing');
    });

    // Onboarding — verifies Stripe session, then shows form
    Route::get('/vendor/onboarding', [VendorOnboardingController::class, 'page']);
});

// ─── Dashboards (protected) ───────────────────────────────────────────────────

Route::middleware('auth')->group(function () {
    Route::get('/dashboard/buyer/{sub?}',  fn (string $sub = '')  => inertia('Dashboard/Customer', ['sub' => $sub]));

    // Vendor dashboard — gate: must have active subscription + completed onboarding
    Route::get('/dashboard/vendor/{sub?}', function (string $sub = '') {
        $user = auth()->user();
        if ($user->role !== 'vendor') return redirect('/');
        if ($user->vendor_subscription_status !== 'active') return redirect('/vendor/pricing');
        if (!$user->vendorProfile?->onboarding_completed) return redirect('/vendor/onboarding');
        return inertia('Dashboard/Vendor', ['sub' => $sub]);
    });

    Route::get('/dashboard/admin/{sub?}',  fn (string $sub = '')  => inertia('Dashboard/Admin',    ['sub' => $sub]))->middleware('admin');
});

// ─── Stripe webhook (no CSRF — excluded via VerifyCsrfToken) ─────────────────

Route::post('/stripe/webhook', [StripeController::class, 'webhook'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

// ─── Email verification ───────────────────────────────────────────────────────

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

// ─── Fallback ─────────────────────────────────────────────────────────────────

Route::fallback(fn () => inertia('NotFound'));
