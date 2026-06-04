<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceVenue extends Model
{
    protected $fillable = [
        'service_id', 'min_people', 'max_people', 'price_per_person', 'min_cost', 'location',
    ];

    public function service() { return $this->belongsTo(Service::class); }
}
