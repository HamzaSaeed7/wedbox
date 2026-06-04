<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFlowerGirlDress extends Model
{
    protected $fillable = ['service_id', 'price', 'age_groups'];
    protected function casts(): array { return ['age_groups' => 'array']; }

    public function service() { return $this->belongsTo(Service::class); }
}
