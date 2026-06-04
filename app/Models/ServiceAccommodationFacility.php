<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceAccommodationFacility extends Model
{
    protected $fillable = ['accommodation_id', 'name', 'price'];

    public function accommodation() { return $this->belongsTo(ServiceAccommodation::class, 'accommodation_id'); }
}
