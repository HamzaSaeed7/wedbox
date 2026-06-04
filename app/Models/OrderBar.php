<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBar extends Model
{
    protected $fillable = ['order_id', 'people', 'hours', 'city_id', 'address', 'selected_menus', 'price'];
    protected function casts(): array { return ['selected_menus' => 'array']; }
    public function order() { return $this->belongsTo(Order::class); }
}
