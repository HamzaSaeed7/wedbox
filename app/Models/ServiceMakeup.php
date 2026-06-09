<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceMakeup extends Model
{
    protected $fillable = [
        'service_id', 'pricing_mode', 'packages',
        'price_bridal', 'price_after_wedding', 'price_party', 'price_trial_1', 'price_trial_2',
        'available_date_trial_1', 'available_date_trial_2',
    ];
    protected function casts(): array
    {
        return [
            'available_date_trial_1' => 'date',
            'available_date_trial_2' => 'date',
            'packages'               => 'array',
        ];
    }

    public function service() { return $this->belongsTo(Service::class); }
}
