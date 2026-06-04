<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCarHire extends Model
{
    protected $fillable = ['service_id', 'addon_options'];
    protected function casts(): array { return ['addon_options' => 'array']; }

    public function service() { return $this->belongsTo(Service::class); }
    public function hours() { return $this->hasMany(ServiceCarHireHour::class); }
    public function addons() { return $this->hasMany(ServiceCarHireAddon::class); }
}
