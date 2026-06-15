<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBrideDressExtra extends Model
{
    protected $fillable = ['service_bride_dress_id', 'name', 'price', 'image'];

    public function brideDress() { return $this->belongsTo(ServiceBrideDress::class, 'service_bride_dress_id'); }
}
