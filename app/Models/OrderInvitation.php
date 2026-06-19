<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderInvitation extends Model
{
    protected $fillable = [
        'order_id', 'quantity', 'needed_by', 'event_date', 'selected_types',
        'design_id', 'selected_addons', 'invitation_text', 'custom_design_url',
    ];

    protected function casts(): array
    {
        return [
            'selected_types'  => 'array',
            'selected_addons' => 'array',
            'needed_by'       => 'date',
            'event_date'      => 'date',
        ];
    }

    public function order() { return $this->belongsTo(Order::class); }
}
