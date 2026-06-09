<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    private const S3 = 'https://wedbox-app-production-bucket.s3.ap-south-1.amazonaws.com';

    public function run(): void
    {
        $now = Carbon::now();

        // ── 1. Categories ─────────────────────────────────────────────────────
        $categories = [
            ['name' => 'Venue',             'slug' => 'venue',            'description' => 'Wedding venues and event spaces.',         'order' => 1],
            ['name' => 'Catering',          'slug' => 'catering',         'description' => 'Food and beverage catering services.',      'order' => 2],
            ['name' => 'Florist',           'slug' => 'florist',          'description' => 'Floral arrangements and decorations.',       'order' => 3],
            ['name' => 'Car Hire',          'slug' => 'car-hire',         'description' => 'Wedding car hire and chauffeur services.',   'order' => 4],
            ['name' => 'Photography',       'slug' => 'photography',      'description' => 'Wedding photography and videography.',       'order' => 5],
            ['name' => 'Music',             'slug' => 'music',            'description' => 'Live music and DJ entertainment.',           'order' => 6],
            ['name' => 'Bride Dress',       'slug' => 'bride-dress',      'description' => 'Bridal gowns and dresses.',                  'order' => 7],
            ['name' => 'Groom Suite',       'slug' => 'groom-suite',      'description' => 'Groom suits and formalwear.',               'order' => 8],
            ['name' => 'Best Man Suit',     'slug' => 'best-man',         'description' => 'Best man suits and accessories.',           'order' => 9],
            ['name' => 'Bridesmaid',        'slug' => 'bridesmaid',       'description' => 'Bridesmaid dresses and styling.',           'order' => 10],
            ['name' => 'Flower Girl Dress', 'slug' => 'flower-girl',      'description' => 'Flower girl dresses for little ones.',      'order' => 11],
            ['name' => 'Yacht Hire',        'slug' => 'yacht',            'description' => 'Luxury yacht hire for weddings.',           'order' => 12],
            ['name' => 'Bachelor',          'slug' => 'bachelor',         'description' => 'Bachelor party planning and events.',       'order' => 13],
            ['name' => 'Bachelorette',      'slug' => 'bachelorette',     'description' => 'Bachelorette party planning and events.',   'order' => 14],
            ['name' => 'Hotel',             'slug' => 'hotel',            'description' => 'Wedding accommodation and hotel packages.',  'order' => 15],
            ['name' => 'Bar',               'slug' => 'bar',              'description' => 'Bar and cocktail services for weddings.',   'order' => 16],
            ['name' => 'Make Up',           'slug' => 'makeup',           'description' => 'Bridal makeup and beauty services.',        'order' => 17],
            ['name' => 'Hair',              'slug' => 'hair',             'description' => 'Bridal hair styling and up-dos.',           'order' => 18],
        ];

        foreach ($categories as &$cat) {
            $cat['created_at'] = $now;
            $cat['updated_at'] = $now;
        }
        unset($cat);

        DB::table('categories')->insert($categories);

        // Build slug → id map
        $catIds = DB::table('categories')->pluck('id', 'slug');

        // ── 2. Cities ──────────────────────────────────────────────────────────
        DB::table('cities')->insert([
            ['name' => 'Nicosia',   'country' => 'Cyprus', 'show_in_footer' => true,  'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Limassol',  'country' => 'Cyprus', 'show_in_footer' => true,  'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Larnaca',   'country' => 'Cyprus', 'show_in_footer' => true,  'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Paphos',    'country' => 'Cyprus', 'show_in_footer' => true,  'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Famagusta', 'country' => 'Cyprus', 'show_in_footer' => false, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ayia Napa', 'country' => 'Cyprus', 'show_in_footer' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── 3. Admin user ──────────────────────────────────────────────────────
        $adminId = DB::table('users')->insertGetId([
            'name'                       => 'Admin User',
            'email'                      => 'khamzasaeed7@gmail.com',
            'email_verified_at'          => $now,
            'password'                   => Hash::make('abcd1234'),
            'role'                       => 'admin',
            'vendor_subscription_status' => null,
            'vendor_plan'                => null,
            'created_at'                 => $now,
            'updated_at'                 => $now,
        ]);

        DB::table('profiles')->insert([
            'user_id'    => $adminId,
            'first_name' => 'Admin',
            'last_name'  => 'User',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Second admin account
        $adminId2 = DB::table('users')->insertGetId([
            'name'                       => 'Admin',
            'email'                      => 'admin@wedbox.io',
            'email_verified_at'          => $now,
            'password'                   => Hash::make('abcd1234'),
            'role'                       => 'admin',
            'vendor_subscription_status' => null,
            'vendor_plan'                => null,
            'created_at'                 => $now,
            'updated_at'                 => $now,
        ]);
        DB::table('profiles')->insert([
            'user_id'    => $adminId2,
            'first_name' => 'Admin',
            'last_name'  => 'WedBox',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Customer account
        $customerId = DB::table('users')->insertGetId([
            'name'                       => 'Customer',
            'email'                      => 'customer@wedbox.io',
            'email_verified_at'          => $now,
            'password'                   => Hash::make('abcd1234'),
            'role'                       => 'customer',
            'vendor_subscription_status' => null,
            'vendor_plan'                => null,
            'created_at'                 => $now,
            'updated_at'                 => $now,
        ]);
        DB::table('profiles')->insert([
            'user_id'    => $customerId,
            'first_name' => 'Customer',
            'last_name'  => 'WedBox',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ── 4. Vendor definitions ──────────────────────────────────────────────
        $vendors = [
            [
                'tag'         => 'venue',
                'cat'         => 'venue',
                'business'    => 'Elysian Gardens Venue',
                'first'       => 'Elena',
                'last'        => 'Papadopoulos',
                'phone'       => '+35722100001',
                'city'        => 'Limassol',
                'description' => 'Stunning outdoor and indoor venue nestled in the heart of Limassol with capacity for up to 500 guests and breathtaking sea views.',
            ],
            [
                'tag'         => 'catering',
                'cat'         => 'catering',
                'business'    => 'Aphrodite Catering',
                'first'       => 'Stavros',
                'last'        => 'Kyriakou',
                'phone'       => '+35722100002',
                'city'        => 'Nicosia',
                'description' => 'Award-winning catering team specialising in Mediterranean and international wedding menus tailored to every taste.',
            ],
            [
                'tag'         => 'flower',
                'cat'         => 'florist',
                'business'    => 'Blossom & Bloom Florist',
                'first'       => 'Maria',
                'last'        => 'Constantinou',
                'phone'       => '+35722100003',
                'city'        => 'Paphos',
                'description' => 'Artisan florist creating bespoke floral designs with fresh and artificial flowers for weddings across Cyprus.',
            ],
            [
                'tag'         => 'car',
                'cat'         => 'car-hire',
                'business'    => 'Cyprus Prestige Cars',
                'first'       => 'Nikos',
                'last'        => 'Alexandrou',
                'phone'       => '+35722100004',
                'city'        => 'Larnaca',
                'description' => 'Luxury wedding car hire including Rolls Royce, Bentley, Mercedes, and vintage classics with experienced chauffeurs.',
            ],
            [
                'tag'         => 'photo',
                'cat'         => 'photography',
                'img'         => 'photographer',
                'business'    => 'Moments By Andreas',
                'first'       => 'Andreas',
                'last'        => 'Georgiou',
                'phone'       => '+35722100005',
                'city'        => 'Limassol',
                'description' => 'Documentary-style wedding photography and cinematic videography capturing your love story with artistic precision.',
            ],
            [
                'tag'         => 'music',
                'cat'         => 'music',
                'business'    => 'Harmony Wedding Music',
                'first'       => 'Costas',
                'last'        => 'Petrides',
                'phone'       => '+35722100006',
                'city'        => 'Nicosia',
                'description' => 'Live bands, string quartets, and professional DJs crafting the perfect wedding soundtrack from ceremony to midnight.',
            ],
            [
                'tag'         => 'bridedress',
                'cat'         => 'bride-dress',
                'business'    => 'La Belle Bridal',
                'first'       => 'Sophia',
                'last'        => 'Andreou',
                'phone'       => '+35722100007',
                'city'        => 'Nicosia',
                'description' => 'Exclusive bridal boutique offering designer wedding gowns from top international brands with in-house alterations.',
            ],
            [
                'tag'         => 'groomsuit',
                'cat'         => 'groom-suite',
                'business'    => 'Dapper Groom Cyprus',
                'first'       => 'Dimitris',
                'last'        => 'Loizou',
                'phone'       => '+35722100008',
                'city'        => 'Limassol',
                'description' => 'Bespoke and off-the-rack groom suits tailored to perfection with a wide range of premium fabrics and accessories.',
            ],
            [
                'tag'         => 'bestman',
                'cat'         => 'best-man',
                'business'    => 'Suit Up Groomsmen',
                'first'       => 'Panayiotis',
                'last'        => 'Stavrou',
                'phone'       => '+35722100009',
                'city'        => 'Paphos',
                'description' => 'Coordinated best man and groomsmen suit packages ensuring the whole party looks sharp on the big day.',
            ],
            [
                'tag'         => 'bridesmaid',
                'cat'         => 'bridesmaid',
                'business'    => 'Blush Bridesmaid Boutique',
                'first'       => 'Anna',
                'last'        => 'Theodorou',
                'phone'       => '+35722100010',
                'city'        => 'Larnaca',
                'description' => 'Beautiful bridesmaid dresses in all sizes and colours, available for rent or purchase with free alterations included.',
            ],
            [
                'tag'         => 'flowergirl',
                'cat'         => 'flower-girl',
                'img'         => 'flower-girl-dress',
                'business'    => 'Little Princess Dresses',
                'first'       => 'Irene',
                'last'        => 'Michaelidou',
                'phone'       => '+35722100011',
                'city'        => 'Nicosia',
                'description' => 'Enchanting flower girl dresses for ages 2-14, handcrafted with premium fabrics in a range of dreamy colours.',
            ],
            [
                'tag'         => 'yacht',
                'cat'         => 'yacht',
                'img'         => 'yacht-hire',
                'business'    => 'Azure Yacht Charter',
                'first'       => 'Giorgos',
                'last'        => 'Christodoulou',
                'phone'       => '+35722100012',
                'city'        => 'Limassol',
                'description' => 'Luxury yacht charters around Cyprus for wedding receptions, honeymoon cruises, and unforgettable sea celebrations.',
            ],
            [
                'tag'         => 'bachelor',
                'cat'         => 'bachelor',
                'business'    => 'Epic Bachelor Cyprus',
                'first'       => 'Michalis',
                'last'        => 'Vassiliou',
                'phone'       => '+35722100013',
                'city'        => 'Ayia Napa',
                'description' => 'Ultimate bachelor party experiences across Cyprus — bar crawls, catamaran trips, nightclub excursions and more.',
            ],
            [
                'tag'         => 'bachelorette',
                'cat'         => 'bachelorette',
                'business'    => 'Girls Night Out Cyprus',
                'first'       => 'Christina',
                'last'        => 'Ioannou',
                'phone'       => '+35722100014',
                'city'        => 'Limassol',
                'description' => 'Tailored bachelorette parties including spa days, beach boat trips, cocktail nights and personalised hen packages.',
            ],
            [
                'tag'         => 'hotel',
                'cat'         => 'hotel',
                'business'    => 'The Olive Grove Hotel',
                'first'       => 'Lefteris',
                'last'        => 'Papadakis',
                'phone'       => '+35722100015',
                'city'        => 'Paphos',
                'description' => 'Five-star boutique hotel offering exclusive wedding accommodation packages with dedicated rooms for the wedding party.',
            ],
            [
                'tag'         => 'bar',
                'cat'         => 'bar',
                'business'    => 'Cocktail Craft Bar',
                'first'       => 'Yiannis',
                'last'        => 'Economou',
                'phone'       => '+35722100016',
                'city'        => 'Nicosia',
                'description' => 'Mobile cocktail bar service with bespoke menus, expert mixologists, and premium spirits delivered to your wedding.',
            ],
            [
                'tag'         => 'makeup',
                'cat'         => 'makeup',
                'img'         => 'make-up',
                'business'    => 'Glow Bridal Beauty',
                'first'       => 'Natasha',
                'last'        => 'Hadjicosta',
                'phone'       => '+35722100017',
                'city'        => 'Limassol',
                'description' => 'Professional bridal makeup artists specialising in flawless bridal looks, touch-ups, and airbrush techniques.',
            ],
            [
                'tag'         => 'hair',
                'cat'         => 'hair',
                'business'    => 'Silhouette Bridal Hair',
                'first'       => 'Katerina',
                'last'        => 'Philippou',
                'phone'       => '+35722100018',
                'city'        => 'Nicosia',
                'description' => 'Expert bridal hair stylists creating stunning up-dos, braids, waves, and romantic styles for your perfect wedding day.',
            ],
        ];

        foreach ($vendors as $v) {
            $catId = $catIds[$v['cat']];
            $email = 'khamzasaeed7+' . $v['tag'] . '@gmail.com';

            // Create user
            $userId = DB::table('users')->insertGetId([
                'name'                       => $v['first'] . ' ' . $v['last'],
                'email'                      => $email,
                'email_verified_at'          => $now,
                'password'                   => Hash::make('abcd1234'),
                'role'                       => 'vendor',
                'vendor_subscription_status' => 'active',
                'vendor_plan'                => '3month',
                'created_at'                 => $now,
                'updated_at'                 => $now,
            ]);

            // Create profile
            DB::table('profiles')->insert([
                'user_id'    => $userId,
                'first_name' => $v['first'],
                'last_name'  => $v['last'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Create vendor profile
            DB::table('vendor_profiles')->insertGetId([
                'user_id'              => $userId,
                'category_id'          => $catId,
                'business_name'        => $v['business'],
                'business_description' => $v['description'],
                'contact_first_name'   => $v['first'],
                'contact_last_name'    => $v['last'],
                'contact_title'        => 'Mr',
                'location'             => $v['city'] . ', Cyprus',
                'address1'             => '1 ' . $v['business'] . ' Street',
                'address2'             => null,
                'country'              => 'Cyprus',
                'city'                 => $v['city'],
                'phone'                => $v['phone'],
                'avatar_url'           => null,
                'onboarding_completed' => true,
                'created_at'           => $now,
                'updated_at'           => $now,
            ]);

            // Create the service + subtable
            $this->createService($v, $userId, $catId, $now);
        }
    }

    // ── Service factory ────────────────────────────────────────────────────────

    private function createService(array $v, int $userId, int $catId, Carbon $now): void
    {
        $cat      = $v['cat'];
        $imgFolder = $v['img'] ?? $cat;           // S3 folder may differ from category slug
        $img1  = self::S3 . "/services/{$imgFolder}/image1.jpg";
        $img2  = self::S3 . "/services/{$imgFolder}/image2.jpg";

        $serviceId = DB::table('services')->insertGetId([
            'vendor_id'     => $userId,
            'category_id'   => $catId,
            'title'         => $v['business'],
            'description'   => $v['description'],
            'location'      => $v['city'] . ', Cyprus',
            'images'        => json_encode([$img1, $img2]),
            'minimum_price' => $this->basePrice($cat),
            'rating'        => 5.0,
            'review_count'  => 0,
            'is_featured'   => 1,
            'status'        => 'active',
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        match ($cat) {
            'venue'        => $this->seedVenue($serviceId, $now),
            'catering'     => $this->seedCatering($serviceId, $now),
            'florist'      => $this->seedFlorist($serviceId, $now),
            'car-hire'     => $this->seedCarHire($serviceId, $now),
            'photography'  => $this->seedPhotography($serviceId, $now),
            'music'        => $this->seedMusic($serviceId, $now),
            'bride-dress'  => $this->seedBrideDress($serviceId, $now),
            'groom-suite'  => $this->seedGroomSuite($serviceId, $now),
            'best-man'     => $this->seedBestManSuit($serviceId, $now),
            'bridesmaid'   => $this->seedBridesmaid($serviceId, $now),
            'flower-girl'  => $this->seedFlowerGirlDress($serviceId, $now),
            'yacht'        => $this->seedYachtHire($serviceId, $now),
            'bachelor'     => $this->seedBachelor($serviceId, $now),
            'bachelorette' => $this->seedBachelorette($serviceId, $now),
            'hotel'        => $this->seedHotel($serviceId, $now),
            'bar'          => $this->seedBar($serviceId, $now),
            'makeup'       => $this->seedMakeup($serviceId, $now),
            'hair'         => $this->seedHair($serviceId, $now),
            default        => null,
        };
    }

    private function basePrice(string $cat): float
    {
        return match ($cat) {
            'venue'        => 2500.00,
            'catering'     => 45.00,
            'florist'      => 350.00,
            'car-hire'     => 200.00,
            'photography'  => 800.00,
            'music'        => 500.00,
            'bride-dress'  => 600.00,
            'groom-suite'  => 300.00,
            'best-man'     => 200.00,
            'bridesmaid'   => 150.00,
            'flower-girl'  => 80.00,
            'yacht'        => 1200.00,
            'bachelor'     => 150.00,
            'bachelorette' => 120.00,
            'hotel'        => 180.00,
            'bar'          => 400.00,
            'makeup'       => 250.00,
            'hair'         => 200.00,
            default        => 100.00,
        };
    }

    // ── Subtable seeders ───────────────────────────────────────────────────────

    private function seedVenue(int $serviceId, Carbon $now): void
    {
        DB::table('service_venues')->insert([
            'service_id'       => $serviceId,
            'min_people'       => 50,
            'max_people'       => 500,
            'price_per_person' => 55.00,
            'min_cost'         => 2500.00,
            'location'         => 'Limassol, Cyprus',
            'created_at'       => $now,
            'updated_at'       => $now,
        ]);
    }

    private function seedCatering(int $serviceId, Carbon $now): void
    {
        $cateringId = DB::table('service_caterings')->insertGetId([
            'service_id' => $serviceId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $cuisineId1 = DB::table('service_catering_cuisines')->insertGetId([
            'service_catering_id' => $cateringId,
            'cuisine_name'        => 'Mediterranean',
            'created_at'          => $now,
            'updated_at'          => $now,
        ]);
        $menuId1 = DB::table('service_catering_menus')->insertGetId([
            'cuisine_id'  => $cuisineId1,
            'name'        => 'Starters',
            'max_choices' => 2,
            'price'       => 15.00,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);
        DB::table('service_catering_items')->insert([
            ['menu_id' => $menuId1, 'name' => 'Greek Salad',        'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $menuId1, 'name' => 'Hummus & Pita',      'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $menuId1, 'name' => 'Stuffed Vine Leaves','created_at' => $now, 'updated_at' => $now],
        ]);
        $menuId2 = DB::table('service_catering_menus')->insertGetId([
            'cuisine_id'  => $cuisineId1,
            'name'        => 'Main Course',
            'max_choices' => 1,
            'price'       => 30.00,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);
        DB::table('service_catering_items')->insert([
            ['menu_id' => $menuId2, 'name' => 'Lamb Kleftiko',    'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $menuId2, 'name' => 'Grilled Sea Bass', 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $menuId2, 'name' => 'Chicken Souvlaki', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $cuisineId2 = DB::table('service_catering_cuisines')->insertGetId([
            'service_catering_id' => $cateringId,
            'cuisine_name'        => 'International',
            'created_at'          => $now,
            'updated_at'          => $now,
        ]);
        $menuId3 = DB::table('service_catering_menus')->insertGetId([
            'cuisine_id'  => $cuisineId2,
            'name'        => 'Canapes',
            'max_choices' => 3,
            'price'       => 12.00,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);
        DB::table('service_catering_items')->insert([
            ['menu_id' => $menuId3, 'name' => 'Smoked Salmon Blini', 'created_at' => $now, 'updated_at' => $now],
            ['menu_id' => $menuId3, 'name' => 'Mini Bruschetta',     'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedFlorist(int $serviceId, Carbon $now): void
    {
        $floristId = DB::table('service_florists')->insertGetId([
            'service_id'         => $serviceId,
            'fresh_flower_price' => 350.00,
            'fake_flower_price'  => 200.00,
            'created_at'         => $now,
            'updated_at'         => $now,
        ]);

        DB::table('service_florist_packages')->insert([
            [
                'service_florist_id' => $floristId,
                'name'               => 'Classic Rose Package',
                'price'              => 350.00,
                'type'               => 'fresh',
                'features'           => json_encode(['Bridal bouquet', 'Bridesmaid bouquets x4', 'Buttonholes x6', 'Table centrepieces x10']),
                'images'             => json_encode([self::S3 . '/services/florist/image1.jpg']),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'service_florist_id' => $floristId,
                'name'               => 'Luxury Peony Package',
                'price'              => 650.00,
                'type'               => 'fresh',
                'features'           => json_encode(['Premium bridal bouquet', 'Bridesmaid bouquets x6', 'Buttonholes x8', 'Table centrepieces x15', 'Ceremony arch flowers']),
                'images'             => json_encode([self::S3 . '/services/florist/image2.jpg']),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'service_florist_id' => $floristId,
                'name'               => 'Artificial Elegance',
                'price'              => 200.00,
                'type'               => 'fake',
                'features'           => json_encode(['Silk bridal bouquet', 'Bridesmaid bouquets x4', 'Table centrepieces x8']),
                'images'             => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
        ]);

        DB::table('service_florist_colors')->insert([
            ['service_florist_id' => $floristId, 'hex_color' => '#FFFFFF', 'price' => 0,   'created_at' => $now, 'updated_at' => $now],
            ['service_florist_id' => $floristId, 'hex_color' => '#FFB6C1', 'price' => 0,   'created_at' => $now, 'updated_at' => $now],
            ['service_florist_id' => $floristId, 'hex_color' => '#FF0000', 'price' => 20,  'created_at' => $now, 'updated_at' => $now],
            ['service_florist_id' => $floristId, 'hex_color' => '#800080', 'price' => 30,  'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('service_florist_designs')->insert([
            ['service_florist_id' => $floristId, 'name' => 'Romantic Garden', 'price' => 50.00, 'images' => null, 'created_at' => $now, 'updated_at' => $now],
            ['service_florist_id' => $floristId, 'name' => 'Modern Minimal',  'price' => 30.00, 'images' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('service_florist_addons')->insert([
            ['service_florist_id' => $floristId, 'name' => 'Extra Buttonhole', 'price_per_unit' => 15.00, 'unit' => 'piece', 'created_at' => $now, 'updated_at' => $now],
            ['service_florist_id' => $floristId, 'name' => 'Flower Crown',     'price_per_unit' => 45.00, 'unit' => 'piece', 'created_at' => $now, 'updated_at' => $now],
            ['service_florist_id' => $floristId, 'name' => 'Table Runner',     'price_per_unit' => 60.00, 'unit' => 'table', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedCarHire(int $serviceId, Carbon $now): void
    {
        $carId = DB::table('service_car_hires')->insertGetId([
            'service_id'   => $serviceId,
            'addon_options' => json_encode(['Ribbons', 'Flowers', 'Champagne']),
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        DB::table('service_car_hire_hours')->insert([
            ['service_car_hire_id' => $carId, 'label' => '2 Hours',  'price' => 200.00, 'created_at' => $now, 'updated_at' => $now],
            ['service_car_hire_id' => $carId, 'label' => '4 Hours',  'price' => 350.00, 'created_at' => $now, 'updated_at' => $now],
            ['service_car_hire_id' => $carId, 'label' => 'Full Day', 'price' => 600.00, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('service_car_hire_addons')->insert([
            ['service_car_hire_id' => $carId, 'name' => 'Rolls Royce Phantom', 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['service_car_hire_id' => $carId, 'name' => 'Bentley Continental', 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['service_car_hire_id' => $carId, 'name' => 'Mercedes S-Class',    'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedPhotography(int $serviceId, Carbon $now): void
    {
        $photoId = DB::table('service_photography')->insertGetId([
            'service_id' => $serviceId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $pkgs = [
            ['package_name' => 'Essential', 'price' => 800.00,  'includes' => json_encode(['8-hour coverage', '300+ edited photos', 'Online gallery'])],
            ['package_name' => 'Premium',   'price' => 1400.00, 'includes' => json_encode(['12-hour coverage', '600+ edited photos', 'Online gallery', 'Engagement shoot', 'Photo album'])],
            ['package_name' => 'Cinematic', 'price' => 2200.00, 'includes' => json_encode(['Full day coverage', '800+ edited photos', '5-min highlight video', 'Second photographer', 'Premium album'])],
        ];

        foreach ($pkgs as $pkg) {
            $pkgId = DB::table('service_photography_packages')->insertGetId([
                'service_photography_id' => $photoId,
                'package_name'           => $pkg['package_name'],
                'price'                  => $pkg['price'],
                'includes'               => $pkg['includes'],
                'created_at'             => $now,
                'updated_at'             => $now,
            ]);
            DB::table('service_photography_addons')->insert([
                ['package_id' => $pkgId, 'name' => 'Extra hour',    'price' => 100.00, 'created_at' => $now, 'updated_at' => $now],
                ['package_id' => $pkgId, 'name' => 'Drone footage', 'price' => 200.00, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }
    }

    private function seedMusic(int $serviceId, Carbon $now): void
    {
        DB::table('service_music')->insert([
            'service_id'     => $serviceId,
            'price_per_hour' => 150.00,
            'video_url'      => null,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);
    }

    private function seedBrideDress(int $serviceId, Carbon $now): void
    {
        $dressId = DB::table('service_bride_dresses')->insertGetId([
            'service_id'      => $serviceId,
            'price_rent'      => 600.00,
            'price_buy'       => 1800.00,
            'available_sizes' => json_encode(['XS','S','M','L','XL','XXL']),
            'created_at'      => $now,
            'updated_at'      => $now,
        ]);

        DB::table('service_bride_dress_extras')->insert([
            ['service_bride_dress_id' => $dressId, 'name' => 'Veil',        'price' => 120.00, 'created_at' => $now, 'updated_at' => $now],
            ['service_bride_dress_id' => $dressId, 'name' => 'Tiara',       'price' => 80.00,  'created_at' => $now, 'updated_at' => $now],
            ['service_bride_dress_id' => $dressId, 'name' => 'Alterations', 'price' => 150.00, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedGroomSuite(int $serviceId, Carbon $now): void
    {
        DB::table('service_groom_suites')->insert([
            'service_id'   => $serviceId,
            'price_rent'   => 300.00,
            'price_buy'    => 850.00,
            'jacket_sizes' => json_encode(['36','38','40','42','44','46','48']),
            'vest_sizes'   => json_encode(['S','M','L','XL','XXL']),
            'shirt_sizes'  => json_encode(['S','M','L','XL','XXL']),
            'bottom_sizes' => json_encode(['28','30','32','34','36','38']),
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);
    }

    private function seedBestManSuit(int $serviceId, Carbon $now): void
    {
        DB::table('service_best_man_suits')->insert([
            'service_id'   => $serviceId,
            'price_rent'   => 200.00,
            'price_buy'    => 650.00,
            'jacket_sizes' => json_encode(['36','38','40','42','44','46']),
            'vest_sizes'   => json_encode(['S','M','L','XL','XXL']),
            'shirt_sizes'  => json_encode(['S','M','L','XL','XXL']),
            'bottom_sizes' => json_encode(['28','30','32','34','36','38']),
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);
    }

    private function seedBridesmaid(int $serviceId, Carbon $now): void
    {
        DB::table('service_bridesmaids_dresses')->insert([
            'service_id'      => $serviceId,
            'price'           => 150.00,
            'available_sizes' => json_encode(['XS','S','M','L','XL','XXL']),
            'created_at'      => $now,
            'updated_at'      => $now,
        ]);
    }

    private function seedFlowerGirlDress(int $serviceId, Carbon $now): void
    {
        DB::table('service_flower_girl_dresses')->insert([
            'service_id' => $serviceId,
            'price'      => 80.00,
            'age_groups' => json_encode(['1Y', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10Y', '12Y']),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    private function seedYachtHire(int $serviceId, Carbon $now): void
    {
        $yachtId = DB::table('service_yacht_hires')->insertGetId([
            'service_id'    => $serviceId,
            'min_people'    => 10,
            'max_people'    => 60,
            'speed'         => '12 knots',
            'length'        => '25 metres',
            'cabin_crew'    => 4,
            'washroom'      => 3,
            'shower'        => 2,
            'chef_included' => true,
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        DB::table('service_yacht_hire_hours')->insert([
            ['service_yacht_hire_id' => $yachtId, 'label' => '3 Hours',  'price' => 1200.00, 'created_at' => $now, 'updated_at' => $now],
            ['service_yacht_hire_id' => $yachtId, 'label' => '6 Hours',  'price' => 2000.00, 'created_at' => $now, 'updated_at' => $now],
            ['service_yacht_hire_id' => $yachtId, 'label' => 'Full Day', 'price' => 3500.00, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedBachelor(int $serviceId, Carbon $now): void
    {
        DB::table('service_bachelors')->insert([
            'service_id'       => $serviceId,
            'price_per_hour'   => 80.00,
            'price_per_person' => 150.00,
            'catamaran_price'  => 250.00,
            'excursion_price'  => 120.00,
            'bar_crawl_price'  => 90.00,
            'night_out_price'  => 180.00,
            'created_at'       => $now,
            'updated_at'       => $now,
        ]);
    }

    private function seedBachelorette(int $serviceId, Carbon $now): void
    {
        DB::table('service_bachelorettes')->insert([
            'service_id'       => $serviceId,
            'price_per_hour'   => 70.00,
            'price_per_person' => 120.00,
            'catamaran_price'  => 220.00,
            'excursion_price'  => 100.00,
            'bar_crawl_price'  => 80.00,
            'night_out_price'  => 150.00,
            'spa_day_price'    => 180.00,
            'created_at'       => $now,
            'updated_at'       => $now,
        ]);
    }

    private function seedHotel(int $serviceId, Carbon $now): void
    {
        $accomId = DB::table('service_accommodations')->insertGetId([
            'service_id' => $serviceId,
            'location'   => 'Paphos, Cyprus',
            'images'     => json_encode([
                self::S3 . '/services/hotel/image1.jpg',
                self::S3 . '/services/hotel/image2.jpg',
            ]),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('service_accommodation_rooms')->insert([
            ['accommodation_id' => $accomId, 'room_type' => 'Deluxe Double',   'price_per_night' => 180.00, 'max_adults' => 2, 'max_kids' => 1, 'images' => null, 'created_at' => $now, 'updated_at' => $now],
            ['accommodation_id' => $accomId, 'room_type' => 'Junior Suite',    'price_per_night' => 280.00, 'max_adults' => 2, 'max_kids' => 2, 'images' => null, 'created_at' => $now, 'updated_at' => $now],
            ['accommodation_id' => $accomId, 'room_type' => 'Honeymoon Suite', 'price_per_night' => 450.00, 'max_adults' => 2, 'max_kids' => 0, 'images' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('service_accommodation_facilities')->insert([
            ['accommodation_id' => $accomId, 'name' => 'Private Pool',     'price' => 0,     'created_at' => $now, 'updated_at' => $now],
            ['accommodation_id' => $accomId, 'name' => 'Spa & Wellness',   'price' => 0,     'created_at' => $now, 'updated_at' => $now],
            ['accommodation_id' => $accomId, 'name' => 'Airport Transfer', 'price' => 60.00, 'created_at' => $now, 'updated_at' => $now],
            ['accommodation_id' => $accomId, 'name' => 'Breakfast',        'price' => 25.00, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    private function seedBar(int $serviceId, Carbon $now): void
    {
        $barId = DB::table('service_bars')->insertGetId([
            'service_id'  => $serviceId,
            'description' => 'Premium mobile bar service with bespoke cocktail menus crafted by expert mixologists for weddings and private events.',
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);

        $menus = [
            ['name' => 'Classic Cocktails',  'price' => 12.00, 'items' => ['Mojito', 'Cosmopolitan', 'Old Fashioned', 'Aperol Spritz']],
            ['name' => 'Signature Mocktails','price' => 8.00,  'items' => ['Virgin Mojito', 'Cucumber Cooler', 'Berry Fizz']],
            ['name' => 'Wines & Prosecco',   'price' => 10.00, 'items' => ['House White', 'House Red', 'Prosecco']],
        ];

        foreach ($menus as $menu) {
            $menuId = DB::table('service_bar_menus')->insertGetId([
                'service_bar_id' => $barId,
                'name'           => $menu['name'],
                'price'          => $menu['price'],
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
            foreach ($menu['items'] as $item) {
                DB::table('service_bar_menu_items')->insert([
                    'menu_id'    => $menuId,
                    'name'       => $item,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    private function seedMakeup(int $serviceId, Carbon $now): void
    {
        DB::table('service_makeups')->insert([
            'service_id'             => $serviceId,
            'pricing_mode'           => 'regular',
            'packages'               => null,
            'price_bridal'           => 250.00,
            'price_after_wedding'    => 180.00,
            'price_party'            => 120.00,
            'price_trial_1'          => 100.00,
            'price_trial_2'          => 100.00,
            'available_date_trial_1' => Carbon::now()->addDays(14)->toDateString(),
            'available_date_trial_2' => Carbon::now()->addDays(21)->toDateString(),
            'created_at'             => $now,
            'updated_at'             => $now,
        ]);
    }

    private function seedHair(int $serviceId, Carbon $now): void
    {
        DB::table('service_hairs')->insert([
            'service_id'             => $serviceId,
            'pricing_mode'           => 'regular',
            'packages'               => null,
            'price_bridal'           => 200.00,
            'price_after_wedding'    => 150.00,
            'price_party'            => 100.00,
            'price_trial_1'          => 90.00,
            'price_trial_2'          => 90.00,
            'available_date_trial_1' => Carbon::now()->addDays(10)->toDateString(),
            'available_date_trial_2' => Carbon::now()->addDays(17)->toDateString(),
            'created_at'             => $now,
            'updated_at'             => $now,
        ]);
    }
}
