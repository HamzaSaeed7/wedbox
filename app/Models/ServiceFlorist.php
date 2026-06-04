<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFlorist extends Model
{
    protected $fillable = ['service_id', 'fresh_flower_price', 'fake_flower_price'];

    public function service() { return $this->belongsTo(Service::class); }
    public function packages() { return $this->hasMany(ServiceFloristPackage::class); }
    public function colors() { return $this->hasMany(ServiceFloristColor::class); }
    public function designs() { return $this->hasMany(ServiceFloristDesign::class); }
    public function addons() { return $this->hasMany(ServiceFloristAddon::class); }
}
