<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCarHire extends Model
{
    protected $fillable = [
        'order_id', 'hire_hour_id', 'pickup_location', 'pickup_time',
        'dropoff_location', 'dropoff_time', 'selected_addons',
    ];
    protected function casts(): array { return ['selected_addons' => 'array']; }
    public function order() { return $this->belongsTo(Order::class); }
}
