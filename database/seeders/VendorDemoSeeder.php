<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class VendorDemoSeeder extends Seeder
{
    // ── Image folder name per category slug ───────────────────────────────────
    private array $imageFolders = [
        'venue'        => 'venue',
        'catering'     => 'catering',
        'florist'      => 'florist',
        'car-hire'     => 'car-hire',
        'photography'  => 'photographer',
        'music'        => 'music',
        'bride-dress'  => 'bride-dress',
        'groom-suite'  => 'groom-suite',
        'bridesmaid'   => 'bridesmaid',
        'best-man'     => 'best-man',
        'flower-girl'  => 'flower-girl-dress',
        'yacht'        => 'yacht-hire',
        'bachelor'     => 'bachelor',
        'bachelorette' => 'bachelorette',
        'hotel'        => 'venue',          // reuse venue images
        'bar'          => 'bar',
        'makeup'       => 'make-up',
    ];

    // ── Email tag per category slug ───────────────────────────────────────────
    private array $emailTags = [
        'venue'        => 'venue',
        'catering'     => 'catering',
        'florist'      => 'florist',
        'car-hire'     => 'carhire',
        'photography'  => 'photographer',
        'music'        => 'music',
        'bride-dress'  => 'bridedress',
        'groom-suite'  => 'groomsuite',
        'bridesmaid'   => 'bridesmaid',
        'best-man'     => 'bestman',
        'flower-girl'  => 'flowergirl',
        'yacht'        => 'yacht',
        'bachelor'     => 'bachelor',
        'bachelorette' => 'bachelorette',
        'hotel'        => 'hotel',
        'bar'          => 'bar',
        'makeup'       => 'makeup',
    ];

    public function run(): void
    {
        $categories = Category::all()->keyBy('slug');
        $sourceBase = resource_path('Images/service images');
        $destBase   = 'public/services';

        Storage::makeDirectory($destBase);

        foreach ($categories as $slug => $category) {
            $this->command->info("Seeding vendor: {$slug}");

            // ── 1. Copy images ────────────────────────────────────────────────
            $folderName = $this->imageFolders[$slug] ?? $slug;
            $sourceDir  = "{$sourceBase}/{$folderName}";
            $imageUrls  = [];

            if (File::isDirectory($sourceDir)) {
                $destDir = "{$destBase}/{$slug}";
                Storage::makeDirectory($destDir);
                foreach (File::files($sourceDir) as $file) {
                    $destPath = "{$destDir}/{$file->getFilename()}";
                    Storage::put($destPath, File::get($file->getPathname()));
                    $imageUrls[] = Storage::url($destPath);
                }
            }

            // ── 2. Create / find vendor user ──────────────────────────────────
            $tag   = $this->emailTags[$slug] ?? $slug;
            $email = "khamzasaeed7+{$tag}@gmail.com";

            $user = User::firstOrCreate(['email' => $email], [
                'name'                      => ucfirst($tag) . ' Vendor',
                'password'                  => Hash::make('abcd1234'),
                'role'                      => 'vendor',
                'email_verified_at'         => now(),
                'vendor_subscription_status'=> 'active',
                'vendor_plan'               => '12month',
            ]);

            // ── 3. Create vendor profile ──────────────────────────────────────
            VendorProfile::updateOrCreate(['user_id' => $user->id], [
                'business_name'        => $this->businessName($slug),
                'business_description' => $this->businessDesc($slug),
                'category_id'          => $category->id,
                'country'              => 'Cyprus',
                'city'                 => $this->city($slug),
                'onboarding_completed' => true,
            ]);

            // ── 4. Create service ─────────────────────────────────────────────
            $service = Service::firstOrCreate(
                ['vendor_id' => $user->id, 'category_id' => $category->id],
                [
                    'title'         => $this->serviceTitle($slug),
                    'description'   => $this->serviceDesc($slug),
                    'location'      => $this->city($slug) . ', Cyprus',
                    'images'        => $imageUrls,
                    'minimum_price' => $this->minPrice($slug),
                    'rating'        => round(mt_rand(42, 50) / 10, 1),
                    'review_count'  => mt_rand(3, 18),
                    'is_featured'   => true,
                    'status'        => 'active',
                ]
            );

            // ── 5. Create service sub-data ────────────────────────────────────
            $this->createSubData($slug, $service);
        }

        $this->command->info('✓ VendorDemoSeeder complete.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Sub-data factory
    // ─────────────────────────────────────────────────────────────────────────

    private function createSubData(string $slug, Service $service): void
    {
        $sid = $service->id;

        match ($slug) {
            'venue'        => $this->seedVenue($sid),
            'catering'     => $this->seedCatering($sid),
            'florist'      => $this->seedFlorist($sid),
            'car-hire'     => $this->seedCarHire($sid),
            'photography'  => $this->seedPhotography($sid),
            'music'        => $this->seedMusic($sid),
            'bride-dress'  => $this->seedBrideDress($sid),
            'groom-suite'  => $this->seedGroomSuite($sid),
            'bridesmaid'   => $this->seedBridesmaid($sid),
            'best-man'     => $this->seedBestMan($sid),
            'flower-girl'  => $this->seedFlowerGirl($sid),
            'yacht'        => $this->seedYacht($sid),
            'bachelor'     => $this->seedBachelor($sid),
            'bachelorette' => $this->seedBachelorette($sid),
            'hotel'        => $this->seedHotel($sid),
            'bar'          => $this->seedBar($sid),
            'makeup'       => $this->seedMakeup($sid),
            default        => null,
        };
    }

    private function seedVenue(int $sid): void
    {
        if (DB::table('service_venues')->where('service_id', $sid)->exists()) return;
        DB::table('service_venues')->insert([
            'service_id'      => $sid,
            'min_people'      => 50,
            'max_people'      => 300,
            'price_per_person'=> 55,
            'min_cost'        => 3000,
            'location'        => 'Limassol Old Town',
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }

    private function seedCatering(int $sid): void
    {
        if (DB::table('service_caterings')->where('service_id', $sid)->exists()) return;
        $cid = DB::table('service_caterings')->insertGetId(['service_id' => $sid, 'created_at' => now(), 'updated_at' => now()]);
        $cuisineId = DB::table('service_catering_cuisines')->insertGetId([
            'service_catering_id' => $cid,
            'cuisine_name'        => 'Mediterranean',
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);
        $menuData = [
            ['Meze Starter',    0,  2, ['Halloumi skewers', 'Hummus & pita', 'Village salad', 'Dolmades']],
            ['Grilled Sea Bass', 42, 1, ['Sea bass fillet', 'Lobster thermidor', 'King prawns']],
            ['Lamb Kleftiko',   38,  1, ['Slow-roast lamb', 'Chicken souvlaki', 'Stuffed vegetables']],
            ['Dessert',          0,  2, ['Baklava', 'Loukoumades', 'Fruit tart', 'Ice cream']],
        ];
        foreach ($menuData as [$name, $price, $max, $items]) {
            $menuId = DB::table('service_catering_menus')->insertGetId([
                'cuisine_id'  => $cuisineId,
                'name'        => $name,
                'price'       => $price,
                'max_choices' => $max,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
            foreach ($items as $item) {
                DB::table('service_catering_items')->insert([
                    'menu_id'    => $menuId,
                    'name'       => $item,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function seedFlorist(int $sid): void
    {
        if (DB::table('service_florists')->where('service_id', $sid)->exists()) return;
        $fid = DB::table('service_florists')->insertGetId([
            'service_id'         => $sid,
            'fresh_flower_price' => 0,
            'fake_flower_price'  => 0,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);
        foreach ([
            ['Silver Bloom',  650,  'fresh', ['Bridal bouquet', '2 boutonnieres', 'Ceremony arch'], 'silver'],
            ['Golden Petal', 1200,  'fresh', ['Everything in Silver', '4 centrepieces', 'Table décor'], 'gold'],
            ['Bronze Touch',  420,  'fresh', ['Bridal bouquet', '2 boutonnieres'], 'bronze'],
        ] as [$name, $price, $type, $features, $tier]) {
            DB::table('service_florist_packages')->insert([
                'service_florist_id' => $fid,
                'name'     => $name,
                'price'    => $price,
                'type'     => $type,
                'features' => json_encode($features),
                'tier'     => $tier,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        foreach (['Romantic Rose', 'Rustic Garden', 'Modern Minimalist'] as $design) {
            DB::table('service_florist_designs')->insert([
                'service_florist_id' => $fid,
                'name'       => $design,
                'price'      => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        foreach (['#FFFFFF', '#FFB6C1', '#FFF8DC', '#C8E6C9', '#E8D5B7'] as $hex) {
            DB::table('service_florist_colors')->insert([
                'service_florist_id' => $fid,
                'hex_color'  => $hex,
                'price'      => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedCarHire(int $sid): void
    {
        if (DB::table('service_car_hires')->where('service_id', $sid)->exists()) return;
        $chid = DB::table('service_car_hires')->insertGetId([
            'service_id'  => $sid,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        foreach ([['2 Hours', 180], ['4 Hours', 320], ['Full Day', 550]] as [$label, $price]) {
            DB::table('service_car_hire_hours')->insert([
                'service_car_hire_id' => $chid,
                'label'      => $label,
                'price'      => $price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        foreach (['1965 Rolls-Royce Silver Shadow', '1968 Mercedes 280 SE', '1972 Jaguar E-Type'] as $car) {
            DB::table('service_car_hire_addons')->insert([
                'service_car_hire_id' => $chid,
                'name'       => $car,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedPhotography(int $sid): void
    {
        if (DB::table('service_photography')->where('service_id', $sid)->exists()) return;
        $phid = DB::table('service_photography')->insertGetId([
            'service_id'  => $sid,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        foreach ([
            ['Essential',  1100, ['Ceremony (4h)', '400 edited photos', 'Online gallery']],
            ['Premium',    1800, ['Full day (8h)', '700 edited photos', 'Slideshow video']],
            ['Ultimate',   2600, ['Full day + pre-shoot', '1000 photos', 'Highlight film', 'Luxury album']],
        ] as [$name, $price, $includes]) {
            DB::table('service_photography_packages')->insert([
                'service_photography_id' => $phid,
                'package_name' => $name,
                'price'        => $price,
                'includes'     => json_encode($includes),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
    }

    private function seedMusic(int $sid): void
    {
        if (DB::table('service_music')->where('service_id', $sid)->exists()) return;
        DB::table('service_music')->insert([
            'service_id'     => $sid,
            'price_per_hour' => 180,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    private function seedBrideDress(int $sid): void
    {
        if (DB::table('service_bride_dresses')->where('service_id', $sid)->exists()) return;
        $did = DB::table('service_bride_dresses')->insertGetId([
            'service_id'      => $sid,
            'price_rent'      => 650,
            'price_buy'       => 1500,
            'available_sizes' => json_encode(['XS','S','M','L','XL','2XL']),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
        foreach ([['Cathedral veil', 110], ['Beaded headpiece', 85], ['Alterations', 120]] as [$name, $price]) {
            DB::table('service_bride_dress_extras')->insert([
                'service_bride_dress_id' => $did,
                'name'       => $name,
                'price'      => $price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedGroomSuite(int $sid): void
    {
        if (DB::table('service_groom_suites')->where('service_id', $sid)->exists()) return;
        DB::table('service_groom_suites')->insert([
            'service_id'    => $sid,
            'price_rent'    => 280,
            'price_buy'     => 750,
            'jacket_sizes'  => json_encode(['36','38','40','42','44','46']),
            'vest_sizes'    => json_encode(['S','M','L','XL']),
            'shirt_sizes'   => json_encode(['S','M','L','XL','2XL']),
            'bottom_sizes'  => json_encode(['30','32','34','36','38','40']),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function seedBridesmaid(int $sid): void
    {
        if (DB::table('service_bridesmaids_dresses')->where('service_id', $sid)->exists()) return;
        DB::table('service_bridesmaids_dresses')->insert([
            'service_id'      => $sid,
            'price'           => 180,
            'available_sizes' => json_encode(['XS','S','M','L','XL']),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }

    private function seedBestMan(int $sid): void
    {
        if (DB::table('service_best_man_suits')->where('service_id', $sid)->exists()) return;
        DB::table('service_best_man_suits')->insert([
            'service_id'    => $sid,
            'price_rent'    => 220,
            'price_buy'     => 600,
            'jacket_sizes'  => json_encode(['36','38','40','42','44','46']),
            'vest_sizes'    => json_encode(['S','M','L','XL']),
            'shirt_sizes'   => json_encode(['S','M','L','XL','2XL']),
            'bottom_sizes'  => json_encode(['30','32','34','36','38','40']),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function seedFlowerGirl(int $sid): void
    {
        if (DB::table('service_flower_girl_dresses')->where('service_id', $sid)->exists()) return;
        DB::table('service_flower_girl_dresses')->insert([
            'service_id' => $sid,
            'price'      => 95,
            'age_groups' => json_encode(['2-3 yrs','4-5 yrs','6-7 yrs','8-10 yrs','11-12 yrs']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function seedYacht(int $sid): void
    {
        if (DB::table('service_yacht_hires')->where('service_id', $sid)->exists()) return;
        $yid = DB::table('service_yacht_hires')->insertGetId([
            'service_id'    => $sid,
            'min_people'    => 2,
            'max_people'    => 16,
            'speed'         => '10 knots',
            'length'        => '50 ft',
            'cabin_crew'    => 2,
            'washroom'      => 2,
            'shower'        => 1,
            'chef_included' => 0,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
        foreach ([['3 Hours', 1500], ['6 Hours', 2400], ['Full Day (8h)', 3200]] as [$label, $price]) {
            DB::table('service_yacht_hire_hours')->insert([
                'service_yacht_hire_id' => $yid,
                'label'      => $label,
                'price'      => $price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedBachelor(int $sid): void
    {
        if (DB::table('service_bachelors')->where('service_id', $sid)->exists()) return;
        DB::table('service_bachelors')->insert([
            'service_id'       => $sid,
            'price_per_hour'   => 120,
            'price_per_person' => 45,
            'catamaran_price'  => 250,
            'excursion_price'  => 90,
            'bar_crawl_price'  => 60,
            'night_out_price'  => 80,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    private function seedBachelorette(int $sid): void
    {
        if (DB::table('service_bachelorettes')->where('service_id', $sid)->exists()) return;
        DB::table('service_bachelorettes')->insert([
            'service_id'       => $sid,
            'price_per_hour'   => 110,
            'price_per_person' => 40,
            'catamaran_price'  => 220,
            'excursion_price'  => 80,
            'bar_crawl_price'  => 55,
            'night_out_price'  => 70,
            'spa_day_price'    => 95,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    private function seedHotel(int $sid): void
    {
        if (DB::table('service_accommodations')->where('service_id', $sid)->exists()) return;
        $hid = DB::table('service_accommodations')->insertGetId([
            'service_id'  => $sid,
            'location'    => 'Paphos Seafront',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        foreach ([
            ['Deluxe Double',  220, 2, 1],
            ['Junior Suite',   380, 2, 0],
            ['Honeymoon Suite',550, 2, 0],
        ] as [$type, $price, $adults, $kids]) {
            DB::table('service_accommodation_rooms')->insert([
                'accommodation_id'  => $hid,
                'room_type'         => $type,
                'price_per_night'   => $price,
                'max_adults'        => $adults,
                'max_kids'          => $kids,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
    }

    private function seedBar(int $sid): void
    {
        if (DB::table('service_bars')->where('service_id', $sid)->exists()) return;
        $bid = DB::table('service_bars')->insertGetId([
            'service_id'  => $sid,
            'description' => 'Premium mobile bar service for weddings and events across Cyprus.',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        foreach ([
            ['Cocktail Package', 35, ['Mojito', 'Aperol Spritz', 'Cosmopolitan', 'Negroni']],
            ['Wine & Spirits',   28, ['House Red', 'House White', 'Prosecco', 'Whisky']],
            ['Non-Alcoholic',    15, ['Fresh Juices', 'Mocktails', 'Soft Drinks', 'Sparkling Water']],
        ] as [$name, $price, $items]) {
            $mid = DB::table('service_bar_menus')->insertGetId([
                'service_bar_id' => $bid,
                'name'       => $name,
                'price'      => $price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            foreach ($items as $item) {
                DB::table('service_bar_menu_items')->insert([
                    'menu_id'    => $mid,
                    'name'       => $item,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function seedMakeup(int $sid): void
    {
        if (DB::table('service_makeups')->where('service_id', $sid)->exists()) return;
        DB::table('service_makeups')->insert([
            'service_id'             => $sid,
            'price_bridal'           => 180,
            'price_after_wedding'    => 130,
            'price_party'            => 100,
            'price_trial_1'          => 85,
            'price_trial_2'          => 85,
            'available_date_trial_1' => now()->addMonths(2),
            'available_date_trial_2' => now()->addMonths(3),
            'created_at'             => now(),
            'updated_at'             => now(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Content helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function businessName(string $slug): string
    {
        return [
            'venue'        => 'Aphrodite Grand Hall',
            'catering'     => 'Olive & Thyme Catering',
            'florist'      => 'Bloom & Petal Floristry',
            'car-hire'     => 'Cyprus Classic Cars',
            'photography'  => 'Golden Hour Photography',
            'music'        => 'Strings & Beats Music',
            'bride-dress'  => 'La Maison Bridal',
            'groom-suite'  => 'The Dapper Groom',
            'bridesmaid'   => 'Blush & Ivory Bridesmaids',
            'best-man'     => 'Savile Row Cyprus',
            'flower-girl'  => 'Little Blooms Dresses',
            'yacht'        => 'Azure Yacht Charters',
            'bachelor'     => 'Stag King Cyprus',
            'bachelorette' => 'Hen Party Queens',
            'hotel'        => 'Elysium Boutique Hotel',
            'bar'          => 'The Wedding Bar Co.',
            'makeup'       => 'Glow Bridal Beauty',
        ][$slug] ?? ucfirst($slug) . ' Cyprus';
    }

    private function businessDesc(string $slug): string
    {
        return [
            'venue'        => 'Stunning waterfront event spaces across Cyprus for your perfect wedding day.',
            'catering'     => 'Award-winning Mediterranean cuisine crafted fresh for your special occasion.',
            'florist'      => 'Bespoke floral arrangements that transform every space into pure romance.',
            'car-hire'     => 'Iconic vintage and luxury cars to make your wedding arrival unforgettable.',
            'photography'  => 'Capturing timeless moments with a cinematic, natural-light approach.',
            'music'        => 'Live bands and DJs for ceremony, cocktail hour and reception dancing.',
            'bride-dress'  => 'Exclusive bridal gowns — rent or buy — with full alteration service.',
            'groom-suite'  => 'Tailored groom suits for rent or purchase, fitted by expert stylists.',
            'bridesmaid'   => 'Beautiful bridesmaid dresses in every size, colour and style imaginable.',
            'best-man'     => 'Sharp suits for the best man and groomsmen, perfectly coordinated.',
            'flower-girl'  => 'Adorable flower girl dresses in a rainbow of colours and sizes.',
            'yacht'        => 'Luxury yacht charters for wedding parties around the Cyprus coastline.',
            'bachelor'     => 'Epic bachelor party experiences — boats, bars and beyond.',
            'bachelorette' => 'Glamorous hen do packages tailored to the bride-to-be.',
            'hotel'        => 'Boutique wedding accommodation for the couple and guests.',
            'bar'          => 'Premium mobile bar hire with expert mixologists and full setup.',
            'makeup'       => 'Professional bridal makeup and trials by award-winning artists.',
        ][$slug] ?? 'Professional wedding services in Cyprus.';
    }

    private function serviceTitle(string $slug): string
    {
        return [
            'venue'        => 'The Limassol Grand Terrace',
            'catering'     => 'Mediterranean Wedding Feast',
            'florist'      => 'Full Wedding Floristry Package',
            'car-hire'     => 'Vintage Wedding Car Hire',
            'photography'  => 'Full Day Wedding Photography',
            'music'        => 'Live Band & DJ Service',
            'bride-dress'  => 'Designer Bridal Gown Collection',
            'groom-suite'  => 'Premium Groom Suit Hire & Sale',
            'bridesmaid'   => 'Bridesmaid Dress Collection',
            'best-man'     => 'Best Man & Groomsmen Suits',
            'flower-girl'  => 'Flower Girl Dress Boutique',
            'yacht'        => 'Luxury Yacht Charter — 50ft',
            'bachelor'     => 'Ultimate Bachelor Party Package',
            'bachelorette' => 'Luxury Hen Party Experience',
            'hotel'        => 'Elysium Boutique Hotel Paphos',
            'bar'          => 'Premium Mobile Wedding Bar',
            'makeup'       => 'Bridal Makeup & Glam Studio',
        ][$slug] ?? 'Professional ' . ucfirst($slug) . ' Service';
    }

    private function serviceDesc(string $slug): string
    {
        return [
            'venue'        => 'An exquisite seafront terrace in Limassol, accommodating 50–300 guests with dedicated wedding coordinator.',
            'catering'     => 'Fresh Mediterranean cuisine served with elegance — from intimate dinners to large receptions.',
            'florist'      => 'Bespoke floral design for every aspect of your big day, from bouquets to venue installations.',
            'car-hire'     => 'Arrive in style with our curated fleet of classic and luxury wedding cars across Cyprus.',
            'photography'  => 'Natural-light photography with a cinematic edge — your story told beautifully.',
            'music'        => 'World-class live music and DJ entertainment for ceremony, cocktail hour and reception.',
            'bride-dress'  => 'A curated collection of designer bridal gowns available to rent or purchase, with full fitting service.',
            'groom-suite'  => 'Sharp, tailored suits for the modern groom — available in a wide range of styles and sizes.',
            'bridesmaid'   => 'Elegant bridesmaid dresses in every colour and size, delivered anywhere in Cyprus.',
            'best-man'     => 'Coordinated suits for the best man and groomsmen — perfectly matched to the groom.',
            'flower-girl'  => 'Adorable, high-quality flower girl dresses from toddler to pre-teen sizes.',
            'yacht'        => 'Set sail around Cyprus on our 50ft luxury yacht — perfect for wedding parties and celebrations.',
            'bachelor'     => 'The ultimate stag experience: yacht trips, bar crawls, excursions and more.',
            'bachelorette' => 'Pamper the bride-to-be with spa days, boat parties and unforgettable nights out.',
            'hotel'        => 'Boutique seafront hotel in Paphos offering exclusive wedding accommodation packages.',
            'bar'          => 'Fully staffed mobile bar with premium spirits, cocktails, and elegant barware setup.',
            'makeup'       => 'Award-winning bridal makeup, trials and touch-up sessions on your wedding day.',
        ][$slug] ?? 'Professional wedding service in Cyprus.';
    }

    private function minPrice(string $slug): int
    {
        return [
            'venue'        => 3000,
            'catering'     => 1800,
            'florist'      => 420,
            'car-hire'     => 180,
            'photography'  => 1100,
            'music'        => 540,
            'bride-dress'  => 650,
            'groom-suite'  => 280,
            'bridesmaid'   => 180,
            'best-man'     => 220,
            'flower-girl'  => 95,
            'yacht'        => 1500,
            'bachelor'     => 200,
            'bachelorette' => 200,
            'hotel'        => 220,
            'bar'          => 400,
            'makeup'       => 85,
        ][$slug] ?? 200;
    }

    private function city(string $slug): string
    {
        $map = [
            'venue'        => 'Limassol',
            'catering'     => 'Nicosia',
            'florist'      => 'Limassol',
            'car-hire'     => 'Larnaca',
            'photography'  => 'Paphos',
            'music'        => 'Nicosia',
            'bride-dress'  => 'Limassol',
            'groom-suite'  => 'Nicosia',
            'bridesmaid'   => 'Limassol',
            'best-man'     => 'Larnaca',
            'flower-girl'  => 'Paphos',
            'yacht'        => 'Limassol',
            'bachelor'     => 'Ayia Napa',
            'bachelorette' => 'Protaras',
            'hotel'        => 'Paphos',
            'bar'          => 'Limassol',
            'makeup'       => 'Nicosia',
        ];
        return $map[$slug] ?? 'Nicosia';
    }
}
