<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceInvitation extends Model
{
    protected $fillable = ['service_id'];

    public function service() { return $this->belongsTo(Service::class); }
    public function types()   { return $this->hasMany(ServiceInvitationType::class); }
    public function designs() { return $this->hasMany(ServiceInvitationDesign::class); }
    public function addons()  { return $this->hasMany(ServiceInvitationAddon::class); }
}
