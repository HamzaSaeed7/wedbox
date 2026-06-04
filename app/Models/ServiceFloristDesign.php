<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFloristDesign extends Model
{
    protected $fillable = ['service_florist_id', 'name', 'price', 'images'];
    protected function casts(): array { return ['images' => 'array']; }

    public function florist() { return $this->belongsTo(ServiceFlorist::class, 'service_florist_id'); }
}
