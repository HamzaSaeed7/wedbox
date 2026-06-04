<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicePhotographyPackage extends Model
{
    protected $fillable = ['service_photography_id', 'package_name', 'price', 'includes'];
    protected function casts(): array { return ['includes' => 'array']; }

    public function photography() { return $this->belongsTo(ServicePhotography::class, 'service_photography_id'); }
    public function addons() { return $this->hasMany(ServicePhotographyAddon::class, 'package_id'); }
}
