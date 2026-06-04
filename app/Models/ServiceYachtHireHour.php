<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceYachtHireHour extends Model
{
    protected $fillable = ['service_yacht_hire_id', 'label', 'price'];

    public function yachtHire() { return $this->belongsTo(ServiceYachtHire::class, 'service_yacht_hire_id'); }
}
