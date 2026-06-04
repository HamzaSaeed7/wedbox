<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBarMenuItem extends Model
{
    protected $fillable = ['menu_id', 'name'];

    public function menu() { return $this->belongsTo(ServiceBarMenu::class, 'menu_id'); }
}
