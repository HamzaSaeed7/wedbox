<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCatering extends Model
{
    protected $fillable = ['service_id'];

    public function service() { return $this->belongsTo(Service::class); }
    public function cuisines() { return $this->hasMany(ServiceCateringCuisine::class); }
}
