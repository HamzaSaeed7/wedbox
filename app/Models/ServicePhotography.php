<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicePhotography extends Model
{
    protected $fillable = ['service_id'];

    public function service() { return $this->belongsTo(Service::class); }
    public function packages() { return $this->hasMany(ServicePhotographyPackage::class); }
}
