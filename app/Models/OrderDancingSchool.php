<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDancingSchool extends Model
{
    protected $fillable = [
        'order_id', 'start_date', 'start_time', 'people', 'package', 'dance_type', 'dance_style',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'package'    => 'array',
        ];
    }

    public function order() { return $this->belongsTo(Order::class); }
}
