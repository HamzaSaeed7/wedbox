<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicePhotographyAddon extends Model
{
    protected $fillable = ['package_id', 'name', 'price'];

    public function package() { return $this->belongsTo(ServicePhotographyPackage::class, 'package_id'); }
}
