<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceYachtHire extends Model
{
    protected $fillable = [
        'service_id', 'min_people', 'max_people', 'speed', 'length',
        'cabin_crew', 'washroom', 'shower', 'chef_included',
    ];
    protected function casts(): array { return ['chef_included' => 'boolean']; }

    public function service() { return $this->belongsTo(Service::class); }
    public function hours() { return $this->hasMany(ServiceYachtHireHour::class); }
}
