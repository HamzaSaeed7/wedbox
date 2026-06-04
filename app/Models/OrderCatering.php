<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCatering extends Model
{
    protected $fillable = ['order_id', 'adults', 'kids'];
    public function order() { return $this->belongsTo(Order::class); }
    public function items() { return $this->hasMany(OrderCateringItem::class); }
}
