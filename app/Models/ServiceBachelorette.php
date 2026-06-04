<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBachelorette extends Model
{
    protected $fillable = [
        'service_id', 'price_per_hour', 'price_per_person',
        'catamaran_price', 'excursion_price', 'bar_crawl_price', 'night_out_price', 'spa_day_price',
    ];

    public function service() { return $this->belongsTo(Service::class); }
}
