<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorProfile extends Model
{
    protected $fillable = [
        'user_id', 'category_id',
        'business_name', 'business_description',
        'contact_first_name', 'contact_last_name', 'contact_title',
        'location', 'address1', 'address2', 'country', 'city', 'phone',
        'avatar_url', 'onboarding_completed',
    ];

    protected $casts = [
        'onboarding_completed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
