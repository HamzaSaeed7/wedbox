<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCateringMenu extends Model
{
    protected $fillable = ['cuisine_id', 'name', 'max_choices', 'price'];

    public function cuisine() { return $this->belongsTo(ServiceCateringCuisine::class, 'cuisine_id'); }
    public function items() { return $this->hasMany(ServiceCateringItem::class, 'menu_id'); }
}
