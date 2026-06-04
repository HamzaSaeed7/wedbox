<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFloristAddon extends Model
{
    protected $fillable = ['service_florist_id', 'name', 'price_per_unit', 'unit'];

    public function florist() { return $this->belongsTo(ServiceFlorist::class, 'service_florist_id'); }
}
