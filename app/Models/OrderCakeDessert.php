<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCakeDessert extends Model
{
    protected $fillable = [
        'order_id', 'people', 'event_date', 'location', 'event_time',
        'cake_flavor', 'cake_layers', 'cake_quantity', 'inspo_image_url',
        'selected_desserts', 'selected_addons', 'tasting_box',
    ];

    protected function casts(): array
    {
        return [
            'event_date'        => 'date',
            'selected_desserts' => 'array',
            'selected_addons'   => 'array',
            'tasting_box'       => 'array',
        ];
    }

    public function order() { return $this->belongsTo(Order::class); }
}
