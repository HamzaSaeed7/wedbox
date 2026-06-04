<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceGroomSuite extends Model
{
    protected $fillable = [
        'service_id', 'price_rent', 'price_buy',
        'jacket_sizes', 'vest_sizes', 'shirt_sizes', 'bottom_sizes',
    ];
    protected function casts(): array
    {
        return ['jacket_sizes' => 'array', 'vest_sizes' => 'array', 'shirt_sizes' => 'array', 'bottom_sizes' => 'array'];
    }

    public function service() { return $this->belongsTo(Service::class); }
}
