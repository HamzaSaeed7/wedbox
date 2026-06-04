<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\Vendor\VendorOnboardingController;
use App\Http\Controllers\Vendor\VendorOrderController;
use App\Http\Controllers\Vendor\VendorProfileController;
use App\Http\Controllers\Vendor\VendorServiceController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/featured', [ServiceController::class, 'featured']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);
Route::get('/testimonials', [PublicController::class, 'testimonials']);
Route::get('/categories', [PublicController::class, 'categories']);
Route::get('/cities', [PublicController::class, 'cities']);
Route::post('/contact', [PublicController::class, 'contact']);

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/email/resend', [\App\Http\Controllers\EmailVerificationController::class, 'resend']);

// TODO: remove before production — instant verify for local dev while IP is not whitelisted
if (app()->environment('local')) {
    Route::post('/auth/dev-verify', function (\Illuminate\Http\Request $request) {
        $request->validate(['email' => 'required|email']);
        $user = \App\Models\User::where('email', $request->email)->firstOrFail();
        $user->markEmailAsVerified();
        return response()->json(['message' => 'Email verified.']);
    });
}

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    // File uploads
    Route::post('/upload/avatar', [FileUploadController::class, 'avatar']);
    Route::post('/upload/service-image', [FileUploadController::class, 'serviceImage']);

    // Vendor onboarding save
    Route::post('/vendor/onboarding', [VendorOnboardingController::class, 'complete']);

    // Stripe checkout (vendor only — checked inside controller)
    Route::post('/vendor/checkout', [StripeController::class, 'createCheckout']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::post('/cart/confirm', [CartController::class, 'confirm']);
    Route::delete('/cart/{order}', [CartController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/summary', [OrderController::class, 'summary']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{service}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{service}', [FavoriteController::class, 'destroy']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);

    Route::post('/reviews', [ReviewController::class, 'store']);

    // Vendor
    Route::middleware('vendor')->prefix('vendor')->group(function () {
        Route::get('/services', [VendorServiceController::class, 'index']);
        Route::post('/services', [VendorServiceController::class, 'store']);
        Route::get('/services/{service}', [VendorServiceController::class, 'show']);
        Route::put('/services/{service}', [VendorServiceController::class, 'update']);
        Route::put('/services/{service}/subdata', [VendorServiceController::class, 'updateSubdata']);
        Route::delete('/services/{service}', [VendorServiceController::class, 'destroy']);

        Route::get('/orders', [VendorOrderController::class, 'index']);
        Route::get('/orders/{order}', [VendorOrderController::class, 'show']);
        Route::put('/orders/{order}/approve', [VendorOrderController::class, 'approve']);
        Route::put('/orders/{order}/reject', [VendorOrderController::class, 'reject']);

        Route::get('/profile', [VendorProfileController::class, 'show']);
        Route::put('/profile', [VendorProfileController::class, 'update']);
        Route::put('/password', [VendorProfileController::class, 'updatePassword']);
        Route::delete('/account', [VendorProfileController::class, 'deleteAccount']);
    });

    // Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users/invite', [AdminController::class, 'invite']);
        Route::post('/users/{user}/ban', [AdminController::class, 'ban']);
        Route::post('/users/{user}/unban', [AdminController::class, 'unban']);
        Route::get('/services', [AdminController::class, 'services']);
        Route::delete('/services/{service}', [AdminController::class, 'deleteService']);
        Route::get('/blog', [BlogController::class, 'index']);
        Route::post('/blog', [BlogController::class, 'store']);
        Route::put('/blog/{blogPost}', [BlogController::class, 'update']);
        Route::delete('/blog/{blogPost}', [BlogController::class, 'destroy']);
    });
});
