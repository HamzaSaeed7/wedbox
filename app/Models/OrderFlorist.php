<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderFlorist extends Model
{
    protected $fillable = [
        'order_id', 'type', 'package_id', 'selected_colors', 'selected_designs',
        'selected_addons', 'inspiration_image_url', 'fake_price', 'real_price',
    ];
    protected function casts(): array
    {
        return ['selected_colors' => 'array', 'selected_designs' => 'array', 'selected_addons' => 'array'];
    }
    public function order() { return $this->belongsTo(Order::class); }
}
