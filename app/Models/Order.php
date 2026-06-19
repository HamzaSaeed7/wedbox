<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'service_id', 'vendor_id', 'price', 'deliver_date',
        'note', 'status', 'stripe_session_id', 'order_type',
    ];

    protected function casts(): array
    {
        return ['deliver_date' => 'date', 'price' => 'decimal:2'];
    }

    public function user()    { return $this->belongsTo(User::class); }
    public function service() { return $this->belongsTo(Service::class); }
    public function vendor()  { return $this->belongsTo(User::class, 'vendor_id'); }

    public function detail()
    {
        // order_type matches the category slug (hyphens, e.g. 'car-hire')
        return match ($this->order_type) {
            'venue'        => $this->hasOne(OrderVenue::class),
            'catering'     => $this->hasOne(OrderCatering::class),
            'florist'      => $this->hasOne(OrderFlorist::class),
            'car-hire'     => $this->hasOne(OrderCarHire::class),
            'photography'  => $this->hasOne(OrderPhotography::class),
            'music'        => $this->hasOne(OrderMusic::class),
            'bride-dress'  => $this->hasOne(OrderBrideDress::class),
            'groom-suite'  => $this->hasOne(OrderGroomSuite::class),
            'best-man'     => $this->hasOne(OrderBestManSuit::class),
            'bridesmaid'   => $this->hasOne(OrderBridesmaid::class),
            'flower-girl'  => $this->hasOne(OrderFlowerGirl::class),
            'yacht'        => $this->hasOne(OrderYachtHire::class),
            'bachelor'     => $this->hasOne(OrderBachelor::class),
            'bachelorette' => $this->hasOne(OrderBachelorette::class),
            'hotel'        => $this->hasOne(OrderHotel::class),
            'bar'          => $this->hasOne(OrderBar::class),
            'makeup'       => $this->hasOne(OrderMakeup::class),
            'hair'         => $this->hasOne(OrderHair::class),
            'invitation'   => $this->hasOne(OrderInvitation::class),
            default        => null,
        };
    }
}
