<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCateringItem extends Model
{
    protected $fillable = ['menu_id', 'name'];

    public function menu() { return $this->belongsTo(ServiceCateringMenu::class, 'menu_id'); }
}
