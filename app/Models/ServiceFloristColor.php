<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFloristColor extends Model
{
    protected $fillable = ['service_florist_id', 'hex_color', 'price'];

    public function florist() { return $this->belongsTo(ServiceFlorist::class, 'service_florist_id'); }
}
