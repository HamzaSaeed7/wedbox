<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceInvitationDesign extends Model
{
    protected $fillable = ['service_invitation_id', 'name', 'image', 'price'];

    public function invitation() { return $this->belongsTo(ServiceInvitation::class, 'service_invitation_id'); }
}
