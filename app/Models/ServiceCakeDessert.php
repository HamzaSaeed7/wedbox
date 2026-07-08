<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCakeDessert extends Model
{
    protected $fillable = [
        'service_id', 'flavors', 'max_layers',
        'cake_base_price', 'cake_layer_price',
        'desserts', 'addons', 'tasting_boxes',
    ];

    protected function casts(): array
    {
        return [
            'flavors'       => 'array',
            'desserts'      => 'array',
            'addons'        => 'array',
            'tasting_boxes' => 'array',
        ];
    }

    public function service() { return $this->belongsTo(Service::class); }
}
