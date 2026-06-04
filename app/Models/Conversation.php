<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['customer_id', 'vendor_id', 'service_id', 'last_message_at'];
    protected function casts(): array { return ['last_message_at' => 'datetime']; }

    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function vendor() { return $this->belongsTo(User::class, 'vendor_id'); }
    public function service() { return $this->belongsTo(Service::class); }
    public function messages() { return $this->hasMany(Message::class); }
}
