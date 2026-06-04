<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCateringItem extends Model
{
    protected $fillable = ['order_catering_id', 'cuisine_id', 'menu_id', 'item_id', 'price'];
    public function orderCatering() { return $this->belongsTo(OrderCatering::class); }
}
