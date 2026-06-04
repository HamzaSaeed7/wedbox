<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCateringCuisine extends Model
{
    protected $fillable = ['service_catering_id', 'cuisine_name'];

    public function catering() { return $this->belongsTo(ServiceCatering::class, 'service_catering_id'); }
    public function menus() { return $this->hasMany(ServiceCateringMenu::class, 'cuisine_id'); }
}
