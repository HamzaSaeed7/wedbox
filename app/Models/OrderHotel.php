<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderHotel extends Model
{
    protected $fillable = ['order_id', 'room_id', 'room_type', 'arrival_date', 'departure_date', 'facilities'];
    protected function casts(): array { return ['arrival_date' => 'date', 'departure_date' => 'date', 'facilities' => 'array']; }
    public function order() { return $this->belongsTo(Order::class); }
}
