<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderPhotography extends Model
{
    protected $fillable = ['order_id', 'package_id', 'selected_addons'];
    protected function casts(): array { return ['selected_addons' => 'array']; }
    public function order() { return $this->belongsTo(Order::class); }
}
