<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCarHireHour extends Model
{
    protected $fillable = ['service_car_hire_id', 'label', 'price'];

    public function carHire() { return $this->belongsTo(ServiceCarHire::class, 'service_car_hire_id'); }
}
