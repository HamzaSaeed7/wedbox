<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderBestManSuit extends Model
{
    protected $fillable = ['order_id', 'type', 'jacket_size', 'vest_size', 'shirt_size', 'bottom_size', 'fitting_1', 'fitting_2'];
    protected function casts(): array { return ['fitting_1' => 'datetime', 'fitting_2' => 'datetime']; }
    public function order() { return $this->belongsTo(Order::class); }
}
