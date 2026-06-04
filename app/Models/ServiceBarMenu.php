<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBarMenu extends Model
{
    protected $fillable = ['service_bar_id', 'name', 'price'];

    public function bar() { return $this->belongsTo(ServiceBar::class, 'service_bar_id'); }
    public function items() { return $this->hasMany(ServiceBarMenuItem::class, 'menu_id'); }
}
