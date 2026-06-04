<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = ['name', 'country', 'bar_price', 'show_in_footer'];

    protected function casts(): array
    {
        return ['show_in_footer' => 'boolean', 'bar_price' => 'decimal:2'];
    }
}
