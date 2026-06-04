<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBar extends Model
{
    protected $fillable = ['service_id', 'description'];

    public function service() { return $this->belongsTo(Service::class); }
    public function menus() { return $this->hasMany(ServiceBarMenu::class); }
}
