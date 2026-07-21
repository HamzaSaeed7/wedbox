<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceDancingSchool extends Model
{
    protected $fillable = [
        'service_id', 'studio_address', 'packages', 'dance_types', 'dance_styles',
    ];

    protected function casts(): array
    {
        return [
            'packages'     => 'array',
            'dance_types'  => 'array',
            'dance_styles' => 'array',
        ];
    }

    public function service() { return $this->belongsTo(Service::class); }
}
