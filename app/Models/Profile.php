<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'avatar_url',
        'address1', 'address2', 'city', 'country', 'postal_code', 'phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
