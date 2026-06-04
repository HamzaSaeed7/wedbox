<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCarHireAddon extends Model
{
    protected $fillable = ['service_car_hire_id', 'name', 'image_url'];

    public function carHire() { return $this->belongsTo(ServiceCarHire::class, 'service_car_hire_id'); }
}
