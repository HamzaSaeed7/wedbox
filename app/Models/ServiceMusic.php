<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceMusic extends Model
{
    protected $fillable = ['service_id', 'price_per_hour', 'video_url'];

    public function service() { return $this->belongsTo(Service::class); }
}
