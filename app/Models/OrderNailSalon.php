<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderNailSalon extends Model
{
    protected $fillable = [
        'order_id', 'people', 'event_date', 'event_time', 'location', 'location_fee',
        'nail_style', 'bridal_package', 'trial', 'selected_addons',
    ];

    protected function casts(): array
    {
        return [
            'event_date'      => 'date',
            'bridal_package'  => 'boolean',
            'trial'           => 'boolean',
            'selected_addons' => 'array',
        ];
    }

    public function order() { return $this->belongsTo(Order::class); }
}
