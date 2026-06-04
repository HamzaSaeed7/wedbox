<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFloristPackage extends Model
{
    protected $fillable = ['service_florist_id', 'name', 'price', 'type', 'features', 'images'];
    protected function casts(): array { return ['features' => 'array', 'images' => 'array']; }

    public function florist() { return $this->belongsTo(ServiceFlorist::class, 'service_florist_id'); }
}
