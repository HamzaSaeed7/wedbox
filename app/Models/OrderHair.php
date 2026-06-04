<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderHair extends Model
{
    protected $table = 'order_hair';
    protected $fillable = ['order_id', 'style', 'people', 'note'];
    public function order() { return $this->belongsTo(Order::class); }
}
