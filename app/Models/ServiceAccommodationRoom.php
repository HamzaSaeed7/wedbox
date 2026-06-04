<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceAccommodationRoom extends Model
{
    protected $fillable = ['accommodation_id', 'room_type', 'price_per_night', 'max_adults', 'max_kids', 'images'];
    protected function casts(): array { return ['images' => 'array']; }

    public function accommodation() { return $this->belongsTo(ServiceAccommodation::class, 'accommodation_id'); }
}
