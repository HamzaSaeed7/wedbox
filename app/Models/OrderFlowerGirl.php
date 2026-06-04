<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderFlowerGirl extends Model
{
    protected $fillable = ['order_id', 'dress_size', 'quantity'];
    public function order() { return $this->belongsTo(Order::class); }
}
