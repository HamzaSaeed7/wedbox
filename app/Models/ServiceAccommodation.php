<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceAccommodation extends Model
{
    protected $fillable = ['service_id', 'location', 'images'];
    protected function casts(): array { return ['images' => 'array']; }

    public function service() { return $this->belongsTo(Service::class); }
    public function rooms() { return $this->hasMany(ServiceAccommodationRoom::class, 'accommodation_id'); }
    public function facilities() { return $this->hasMany(ServiceAccommodationFacility::class, 'accommodation_id'); }
}
