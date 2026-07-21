<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceNailSalon extends Model
{
    protected $fillable = [
        'service_id', 'bridal_package_price', 'trial_price', 'max_group_size',
        'nail_styles', 'location_prices', 'addons',
    ];

    protected function casts(): array
    {
        return [
            'nail_styles'     => 'array',
            'location_prices' => 'array',
            'addons'          => 'array',
        ];
    }

    public function service() { return $this->belongsTo(Service::class); }
}
