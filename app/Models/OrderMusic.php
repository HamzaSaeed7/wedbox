<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderMusic extends Model
{
    protected $fillable = ['order_id', 'hours', 'entrance_song', 'first_dance_song', 'cutting_cake_song', 'songs_list', 'further_details'];
    public function order() { return $this->belongsTo(Order::class); }
}
