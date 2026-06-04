<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBrideDress extends Model
{
    protected $fillable = ['service_id', 'price_rent', 'price_buy', 'available_sizes'];
    protected function casts(): array { return ['available_sizes' => 'array']; }

    public function service() { return $this->belongsTo(Service::class); }
    public function extras() { return $this->hasMany(ServiceBrideDressExtra::class); }
}
