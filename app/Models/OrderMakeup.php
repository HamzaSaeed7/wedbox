<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderMakeup extends Model
{
    protected $fillable = [
        'order_id',
        'date_bridal', 'date_after_wedding', 'date_party', 'date_trial_1', 'date_trial_2',
        'price_bridal', 'price_after_wedding', 'price_party', 'price_trial_1', 'price_trial_2',
    ];
    protected function casts(): array
    {
        return [
            'date_bridal' => 'datetime', 'date_after_wedding' => 'datetime',
            'date_party' => 'datetime', 'date_trial_1' => 'datetime', 'date_trial_2' => 'datetime',
        ];
    }
    public function order() { return $this->belongsTo(Order::class); }
}
