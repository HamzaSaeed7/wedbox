<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBridesmaidsDress extends Model
{
    protected $fillable = ['service_id', 'price', 'available_sizes'];
    protected function casts(): array { return ['available_sizes' => 'array']; }

    public function service() { return $this->belongsTo(Service::class); }
}
