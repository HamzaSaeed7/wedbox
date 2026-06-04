<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderVenue extends Model
{
    protected $fillable = ['order_id', 'no_of_people'];
    public function order() { return $this->belongsTo(Order::class); }
}
