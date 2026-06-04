<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBridesmaid extends Model
{
    protected $fillable = ['order_id', 'sizes'];
    protected function casts(): array { return ['sizes' => 'array']; }
    public function order() { return $this->belongsTo(Order::class); }
}
