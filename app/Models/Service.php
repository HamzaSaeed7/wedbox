<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'vendor_id', 'category_id', 'title', 'description', 'location',
        'images', 'blocked_dates', 'minimum_price', 'rating', 'review_count', 'is_featured', 'status',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'blocked_dates' => 'array',
            'is_featured' => 'boolean',
            'rating' => 'decimal:2',
            'minimum_price' => 'decimal:2',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    // Category-specific sub-model relationships
    public function venue()      { return $this->hasOne(ServiceVenue::class); }
    public function catering()   { return $this->hasOne(ServiceCatering::class); }
    public function florist()    { return $this->hasOne(ServiceFlorist::class); }
    public function carHire()    { return $this->hasOne(ServiceCarHire::class); }
    public function photography(){ return $this->hasOne(ServicePhotography::class); }
    public function music()      { return $this->hasOne(ServiceMusic::class); }
    public function brideDress() { return $this->hasOne(ServiceBrideDress::class); }
    public function groomSuite() { return $this->hasOne(ServiceGroomSuite::class); }
    public function bestManSuit(){ return $this->hasOne(ServiceBestManSuit::class); }
    public function bridesmaidDress() { return $this->hasOne(ServiceBridesmaidsDress::class); }
    public function flowerGirlDress() { return $this->hasOne(ServiceFlowerGirlDress::class); }
    public function yachtHire()  { return $this->hasOne(ServiceYachtHire::class); }
    public function bachelor()   { return $this->hasOne(ServiceBachelor::class); }
    public function bachelorette(){ return $this->hasOne(ServiceBachelorette::class); }
    public function accommodation(){ return $this->hasOne(ServiceAccommodation::class); }
    public function bar()        { return $this->hasOne(ServiceBar::class); }
    public function makeup()     { return $this->hasOne(ServiceMakeup::class); }
    public function hair()       { return $this->hasOne(ServiceHair::class); }
    public function invitation() { return $this->hasOne(ServiceInvitation::class); }
    public function cakeDessert(){ return $this->hasOne(ServiceCakeDessert::class); }
    public function nailSalon()  { return $this->hasOne(ServiceNailSalon::class); }
    public function dancingSchool(){ return $this->hasOne(ServiceDancingSchool::class); }
}
