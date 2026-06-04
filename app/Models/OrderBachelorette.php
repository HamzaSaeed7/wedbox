<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBachelorette extends Model
{
    protected $fillable = ['order_id', 'num_girls', 'hours', 'includes', 'includes_price', 'total_price'];
    protected function casts(): array { return ['includes' => 'array']; }
    public function order() { return $this->belongsTo(Order::class); }
}
