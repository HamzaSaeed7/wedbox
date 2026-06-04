<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBrideDress extends Model
{
    protected $fillable = ['order_id', 'type', 'sizes', 'extras', 'fitting_1', 'fitting_2'];
    protected function casts(): array { return ['sizes' => 'array', 'extras' => 'array', 'fitting_1' => 'datetime', 'fitting_2' => 'datetime']; }
    public function order() { return $this->belongsTo(Order::class); }
}
