<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderYachtHire extends Model
{
    protected $fillable = ['order_id', 'hire_hour_id'];
    public function order() { return $this->belongsTo(Order::class); }
}
