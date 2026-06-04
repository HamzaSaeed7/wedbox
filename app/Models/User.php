<?php

namespace App\Models;

use Database\Factories\UserFactory;
use App\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'stripe_customer_id',
        'vendor_plan', 'vendor_subscription_status', 'stripe_checkout_session_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'banned_at' => 'datetime',
        ];
    }

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }

    public function sendEmailVerificationNotification(): void
    {
        $hash = sha1($this->getEmailForVerification());
        $url  = config('app.url') . '/email/verify/' . $this->id . '/' . $hash;
        $this->notify(new VerifyEmail($url));
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function vendorProfile()
    {
        return $this->hasOne(VendorProfile::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'vendor_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(Service::class, 'favorites');
    }
}
