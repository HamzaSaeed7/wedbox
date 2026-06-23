<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceInvitationType extends Model
{
    protected $fillable = ['service_invitation_id', 'name', 'price'];

    public function invitation() { return $this->belongsTo(ServiceInvitation::class, 'service_invitation_id'); }
}
