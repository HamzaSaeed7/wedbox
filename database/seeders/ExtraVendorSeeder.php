<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds 4 additional vendors with their own services and sub-table data,
 * making the marketplace feel populated with real competition.
 */
class ExtraVendorSeeder extends Seeder
{
    private function img(string $id, int $w = 800, int $h = 600): string
    {
        return "https://images.unsplash.com/photo-{$id}?w={$w}&h={$h}&fit=crop&auto=format&q=70";
    }

    private function makeVendor(string $email, string $name, string $bizName, string $desc, string $location): User
    {
        $user = User::firstOrCreate(['email' => $email], [
            'name'     => $name,
            'password' => Hash::make('password123'),
            'role'     => 'vendor',
        ]);
        Profile::firstOrCreate(['user_id' => $user->id], [
            'first_name' => explode(' ', $name)[0],
            'last_name'  => explode(' ', $name)[1] ?? '',
        ]);
        VendorProfile::firstOrCreate(['user_id' => $user->id], [
            'business_name'        => $bizName,
            'business_description' => $desc,
            'contact_first_name'   => explode(' ', $name)[0],
            'contact_last_name'    => explode(' ', $name)[1] ?? '',
            'location'             => $location,
        ]);
        return $user;
    }

    private function makeService(int $vendorId, int $catId, array $data): ?int
    {
        $existing = DB::table('services')
            ->where('vendor_id', $vendorId)
            ->where('category_id', $catId)
            ->value('id');
        if ($existing) return $existing;

        return DB::table('services')->insertGetId([
            'vendor_id'     => $vendorId,
            'category_id'   => $catId,
            'title'         => $data['title'],
            'description'   => $data['description'],
            'location'      => $data['location'],
            'images'        => json_encode($data['images']),
            'minimum_price' => $data['price'],
            'rating'        => $data['rating'],
            'review_count'  => $data['reviews'],
            'is_featured'   => $data['featured'],
            'status'        => 'active',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    public function run(): void
    {
        $cats = DB::table('categories')->pluck('id', 'slug');

        // ─────────────────────────────────────────────────────────────────────
        // Vendor 2 – Aphrodite Events (Venue + Catering)
        // ─────────────────────────────────────────────────────────────────────
        $v2 = $this->makeVendor(
            'aphrodite@wedbox.com', 'Eleni Papadopoulos',
            'Aphrodite Events', 'Full-service wedding venue and catering specialists in Larnaca.',
            'Larnaca, Cyprus'
        );

        // Venue
        $svcId = $this->makeService($v2->id, $cats['venue'], [
            'title'       => 'Sunset Terrace Larnaca',
            'description' => 'Waterfront venue with panoramic sea views. Elegant covered terrace for 50–200 guests with dedicated wedding planner.',
            'location'    => 'Larnaca, Cyprus',
            'images'      => [$this->img('1464366400600-ac2db963f8c0'), $this->img('1537633552985-df8429e8048b'), $this->img('1519225421980-8f41e4890a6e')],
            'price'       => 3800, 'rating' => 4.75, 'reviews' => 68, 'featured' => true,
        ]);
        if ($svcId && !DB::table('service_venues')->where('service_id', $svcId)->exists()) {
            DB::table('service_venues')->insert([
                'service_id' => $svcId, 'min_people' => 50, 'max_people' => 200,
                'price_per_person' => 72, 'min_cost' => 3800, 'location' => 'Finikoudes Promenade, Larnaca',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        // Catering
        $svcId = $this->makeService($v2->id, $cats['catering'], [
            'title'       => 'Citrus Kitchen Catering',
            'description' => 'Farm-to-table wedding catering celebrating Cyprus seasonal produce. Vegan, halal and gluten-free options available.',
            'location'    => 'Larnaca, Cyprus',
            'images'      => [$this->img('1414235077428-338989a2e8c0'), $this->img('1567620905732-2d1ec7ab7445'), $this->img('1555244162-d45-a0-a3')],
            'price'       => 55, 'rating' => 4.65, 'reviews' => 44, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_caterings')->where('service_id', $svcId)->exists()) {
            $cid = DB::table('service_caterings')->insertGetId(['service_id' => $svcId, 'created_at' => now(), 'updated_at' => now()]);
            $cuisineId = DB::table('service_catering_cuisines')->insertGetId([
                'service_catering_id' => $cid, 'cuisine_name' => 'Farm-to-Table',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            foreach ([['Starter', 0, 2, ['Heirloom tomato salad', 'Hummus board', 'Seasonal soup']], ['Main', 55, 1, ['Free-range chicken', 'Slow-roast lamb', 'Butternut risotto']], ['Dessert', 0, 2, ['Sticky toffee pudding', 'Seasonal sorbet', 'Fruit tart']]] as [$mname, $mprice, $mmax, $mitems]) {
                $mid2 = DB::table('service_catering_menus')->insertGetId(['cuisine_id' => $cuisineId, 'name' => $mname, 'max_choices' => $mmax, 'price' => $mprice, 'created_at' => now(), 'updated_at' => now()]);
                foreach ($mitems as $i) DB::table('service_catering_items')->insert(['menu_id' => $mid2, 'name' => $i, 'created_at' => now(), 'updated_at' => now()]);
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // Vendor 3 – Island Lens (Photography + Music)
        // ─────────────────────────────────────────────────────────────────────
        $v3 = $this->makeVendor(
            'islandlens@wedbox.com', 'Andreas Constantinou',
            'Island Lens Studios', 'Award-winning photography and live music for Cyprus weddings.',
            'Paphos, Cyprus'
        );

        $svcId = $this->makeService($v3->id, $cats['photography'], [
            'title'       => 'Island Lens Photography',
            'description' => 'Documentary wedding photography in natural light. Capturing authentic emotion across Cyprus\'s most beautiful locations.',
            'location'    => 'Paphos, Cyprus',
            'images'      => [$this->img('1537633552985-df8429e8048b'), $this->img('1519741497674-611481863552'), $this->img('1519225421980-8f41e4890a6e')],
            'price'       => 1100, 'rating' => 4.85, 'reviews' => 91, 'featured' => true,
        ]);
        if ($svcId && !DB::table('service_photography')->where('service_id', $svcId)->exists()) {
            $pid = DB::table('service_photography')->insertGetId(['service_id' => $svcId, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['Essential', 1100, ['Ceremony (4h)', '400 edited photos', 'Online gallery']], ['Complete', 2000, ['Full day (10h)', '800 edited photos', 'Highlight film', 'Photo book']]] as [$pname, $pprice, $pinc]) {
                $pkid = DB::table('service_photography_packages')->insertGetId(['service_photography_id' => $pid, 'package_name' => $pname, 'price' => $pprice, 'includes' => json_encode($pinc), 'created_at' => now(), 'updated_at' => now()]);
                DB::table('service_photography_addons')->insert(['package_id' => $pkid, 'name' => 'Drone footage', 'price' => 300, 'created_at' => now(), 'updated_at' => now()]);
            }
        }

        $svcId = $this->makeService($v3->id, $cats['music'], [
            'title'       => 'Paphos Jazz Trio',
            'description' => 'Intimate jazz ensemble perfect for cocktail hours and garden receptions. Acoustic sets with custom song requests.',
            'location'    => 'Paphos, Cyprus',
            'images'      => [$this->img('1507676184212-d03ab07a01bf'), $this->img('1511192336575-5a79af67a629'), $this->img('1470225620780-dba8ba36b745')],
            'price'       => 160, 'rating' => 4.70, 'reviews' => 38, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_music')->where('service_id', $svcId)->exists()) {
            DB::table('service_music')->insert(['service_id' => $svcId, 'price_per_hour' => 160, 'video_url' => null, 'created_at' => now(), 'updated_at' => now()]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Vendor 4 – Bridal Atelier (Bride Dress + Makeup + Bridesmaid)
        // ─────────────────────────────────────────────────────────────────────
        $v4 = $this->makeVendor(
            'bridalatelier@wedbox.com', 'Sofia Nikkola',
            'Bridal Atelier Cyprus', 'Limassol\'s premier destination for bridal gowns, bridesmaid dresses, and beauty.',
            'Limassol, Cyprus'
        );

        $svcId = $this->makeService($v4->id, $cats['bride-dress'], [
            'title'       => 'Vera & Co Bridal',
            'description' => 'Exquisite bridal collection featuring European designer gowns. In-house alterations by master seamstresses.',
            'location'    => 'Limassol, Cyprus',
            'images'      => [$this->img('1511285560929-80b5a4621270'), $this->img('1594552072238-5c4a6c2cfa40'), $this->img('1519225421980-8f41e4890a6e')],
            'price'       => 700, 'rating' => 4.80, 'reviews' => 62, 'featured' => true,
        ]);
        if ($svcId && !DB::table('service_bride_dresses')->where('service_id', $svcId)->exists()) {
            $bdid = DB::table('service_bride_dresses')->insertGetId(['service_id' => $svcId, 'price_rent' => 700, 'price_buy' => 1600, 'available_sizes' => json_encode(['XS','S','M','L','XL','2XL']), 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['Lace veil', 120], ['Floral headband', 65], ['Alterations', 100]] as [$en, $ep]) DB::table('service_bride_dress_extras')->insert(['service_bride_dress_id' => $bdid, 'name' => $en, 'price' => $ep, 'created_at' => now(), 'updated_at' => now()]);
        }

        $svcId = $this->makeService($v4->id, $cats['makeup'], [
            'title'       => 'Glow Studio Limassol',
            'description' => 'Expert bridal makeup and hairstyling team. Specialising in natural, editorial, and HD bridal looks.',
            'location'    => 'Limassol, Cyprus',
            'images'      => [$this->img('1503236823255-42d64e83cdd8'), $this->img('1487412947147-5cebf100d293'), $this->img('1522337360788-8b13dee7a37e')],
            'price'       => 180, 'rating' => 4.75, 'reviews' => 53, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_makeups')->where('service_id', $svcId)->exists()) {
            DB::table('service_makeups')->insert(['service_id' => $svcId, 'price_bridal' => 180, 'price_after_wedding' => 130, 'price_party' => 100, 'price_trial_1' => 90, 'price_trial_2' => 90, 'available_date_trial_1' => '2026-07-20', 'available_date_trial_2' => '2026-08-05', 'created_at' => now(), 'updated_at' => now()]);
        }

        $svcId = $this->makeService($v4->id, $cats['bridesmaid'], [
            'title'       => 'Silk & Rose Bridesmaids',
            'description' => 'A collection of over 40 bridesmaid styles in 25 colours. Group fittings available with refreshments.',
            'location'    => 'Limassol, Cyprus',
            'images'      => [$this->img('1522673607200-164d1b6ce486'), $this->img('1595777457583-95e059d581b8'), $this->img('1490750967868-88df5691240e')],
            'price'       => 110, 'rating' => 4.55, 'reviews' => 29, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_bridesmaids_dresses')->where('service_id', $svcId)->exists()) {
            DB::table('service_bridesmaids_dresses')->insert(['service_id' => $svcId, 'price' => 110, 'available_sizes' => json_encode(['XS','S','M','L','XL','2XL']), 'created_at' => now(), 'updated_at' => now()]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Vendor 5 – Blue Mediterranean (Yacht + Bachelor + Bachelorette)
        // ─────────────────────────────────────────────────────────────────────
        $v5 = $this->makeVendor(
            'bluemediterranean@wedbox.com', 'Nikos Georgiou',
            'Blue Mediterranean Experiences', 'Luxury sea experiences — yacht hire, stag dos, and hen parties across Cyprus.',
            'Ayia Napa, Cyprus'
        );

        $svcId = $this->makeService($v5->id, $cats['yacht'], [
            'title'       => 'Azure Dream Yacht',
            'description' => 'A sleek 46-foot sailing catamaran with sun deck and shaded lounge. Perfect for intimate wedding celebrations at sea.',
            'location'    => 'Ayia Napa, Cyprus',
            'images'      => [$this->img('1530870110042-98b2cb110834'), $this->img('1544551763-46a013bb70d5'), $this->img('1505118380757-91f5f5632de0')],
            'price'       => 1400, 'rating' => 4.80, 'reviews' => 35, 'featured' => true,
        ]);
        if ($svcId && !DB::table('service_yacht_hires')->where('service_id', $svcId)->exists()) {
            $yhid = DB::table('service_yacht_hires')->insertGetId(['service_id' => $svcId, 'min_people' => 2, 'max_people' => 14, 'speed' => '12 knots', 'length' => '46 ft', 'cabin_crew' => 2, 'washroom' => 2, 'shower' => 1, 'chef_included' => false, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['3 Hours', 1400], ['6 Hours', 2200], ['Sunset Cruise (4h)', 1700]] as [$l, $p]) DB::table('service_yacht_hire_hours')->insert(['service_yacht_hire_id' => $yhid, 'label' => $l, 'price' => $p, 'created_at' => now(), 'updated_at' => now()]);
        }

        $svcId = $this->makeService($v5->id, $cats['bachelor'], [
            'title'       => 'Napa Stag Experience',
            'description' => 'The ultimate stag weekend in Ayia Napa. Quad bikes, boat parties, VIP beach clubs and guided bar crawls.',
            'location'    => 'Ayia Napa, Cyprus',
            'images'      => [$this->img('1496440543397-55c80a11c52b'), $this->img('1528360983277-13d401cdc186'), $this->img('1519046904884-53103b34b206')],
            'price'       => 120, 'rating' => 4.70, 'reviews' => 77, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_bachelors')->where('service_id', $svcId)->exists()) {
            DB::table('service_bachelors')->insert(['service_id' => $svcId, 'price_per_hour' => 120, 'price_per_person' => 40, 'catamaran_price' => 240, 'excursion_price' => 85, 'bar_crawl_price' => 55, 'night_out_price' => 75, 'created_at' => now(), 'updated_at' => now()]);
        }

        $svcId = $this->makeService($v5->id, $cats['bachelorette'], [
            'title'       => 'Napa Hen Luxury',
            'description' => 'Bespoke hen experiences in Ayia Napa and Protaras. Sunset boat trips, spa packages, cocktail classes, and beach parties.',
            'location'    => 'Ayia Napa, Cyprus',
            'images'      => [$this->img('1467721783849-12bfbd5fca5a'), $this->img('1522673607200-164d1b6ce486'), $this->img('1496440543397-55c80a11c52b')],
            'price'       => 110, 'rating' => 4.85, 'reviews' => 61, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_bachelorettes')->where('service_id', $svcId)->exists()) {
            DB::table('service_bachelorettes')->insert(['service_id' => $svcId, 'price_per_hour' => 110, 'price_per_person' => 40, 'catamaran_price' => 220, 'excursion_price' => 80, 'bar_crawl_price' => 50, 'night_out_price' => 70, 'spa_day_price' => 90, 'created_at' => now(), 'updated_at' => now()]);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Vendor 6 – Nicosia Flowers & Cars (Florist + Car Hire)
        // ─────────────────────────────────────────────────────────────────────
        $v6 = $this->makeVendor(
            'nicosiaflowers@wedbox.com', 'Maria Loizidou',
            'Nicosia Flowers & Cars', 'Floral artistry and vintage car hire for Nicosia weddings.',
            'Nicosia, Cyprus'
        );

        $svcId = $this->makeService($v6->id, $cats['florist'], [
            'title'       => 'Petal & Stem Floristry',
            'description' => 'Contemporary and classic floral design. Seasonal blooms sourced daily from our own greenhouse in the Troodos foothills.',
            'location'    => 'Nicosia, Cyprus',
            'images'      => [$this->img('1490750967868-88df5691240e'), $this->img('1523438885200-e635ba2c371e'), $this->img('1558618666-fcd25c85cd64')],
            'price'       => 750, 'rating' => 4.60, 'reviews' => 48, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_florists')->where('service_id', $svcId)->exists()) {
            $fid = DB::table('service_florists')->insertGetId(['service_id' => $svcId, 'fresh_flower_price' => 0, 'fake_flower_price' => 0, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['Classic', 750, 'fresh', ['Bridal bouquet','3 boutonnieres','Ceremony flowers']], ['Deluxe', 1350, 'fresh', ['Everything in Classic','4 centrepieces','Aisle décor','Flower arch']]] as [$pn, $pp, $pt, $pf]) {
                DB::table('service_florist_packages')->insert(['service_florist_id' => $fid, 'name' => $pn, 'price' => $pp, 'type' => $pt, 'features' => json_encode($pf), 'images' => null, 'created_at' => now(), 'updated_at' => now()]);
            }
            foreach (['#FFFFFF','#FFF0F5','#FADADD','#C8E6C9','#E3F2FD'] as $hex) DB::table('service_florist_colors')->insert(['service_florist_id' => $fid, 'hex_color' => $hex, 'price' => 0, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['Rustic Garden', 0], ['Minimalist Chic', 30], ['Romantic Roses', 50]] as [$dn, $dp]) DB::table('service_florist_designs')->insert(['service_florist_id' => $fid, 'name' => $dn, 'price' => $dp, 'images' => null, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['Boutonniere', 15, 'piece'], ['Corsage', 20, 'piece'], ['Table spray', 75, 'table']] as [$an, $ap, $au]) DB::table('service_florist_addons')->insert(['service_florist_id' => $fid, 'name' => $an, 'price_per_unit' => $ap, 'unit' => $au, 'created_at' => now(), 'updated_at' => now()]);
        }

        $svcId = $this->makeService($v6->id, $cats['car-hire'], [
            'title'       => 'Heritage Wedding Cars',
            'description' => 'Pre-war and post-war classic wedding cars for Nicosia and surrounding areas. Uniformed chauffeurs and ribbon dressing included.',
            'location'    => 'Nicosia, Cyprus',
            'images'      => [$this->img('1502161254119-f7ad10064f03'), $this->img('1544636331-e516d28ef708'), $this->img('1553440569-bcc63803ef51')],
            'price'       => 180, 'rating' => 4.50, 'reviews' => 27, 'featured' => false,
        ]);
        if ($svcId && !DB::table('service_car_hires')->where('service_id', $svcId)->exists()) {
            $chid = DB::table('service_car_hires')->insertGetId(['service_id' => $svcId, 'addon_options' => null, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([['2 Hours', 180], ['4 Hours', 300], ['Full Day', 500]] as [$l, $p]) DB::table('service_car_hire_hours')->insert(['service_car_hire_id' => $chid, 'label' => $l, 'price' => $p, 'created_at' => now(), 'updated_at' => now()]);
            foreach (['1950 Morris Minor', '1962 Jaguar Mk2', '1970 VW Beetle'] as $cn) DB::table('service_car_hire_addons')->insert(['service_car_hire_id' => $chid, 'name' => $cn, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()]);
        }
    }
}
