<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds every service sub-table for the main showcase vendor
 * (vendor@wedbox.com).  Safe to re-run — skips rows that already exist.
 */
class ServiceSubdataSeeder extends Seeder
{
    public function run(): void
    {
        $vendor = User::where('email', 'vendor@wedbox.com')->first();
        if (!$vendor) return;

        // Build a map of category slug → service id for this vendor
        $svcMap = DB::table('services as s')
            ->join('categories as c', 'c.id', '=', 's.category_id')
            ->where('s.vendor_id', $vendor->id)
            ->pluck('s.id', 'c.slug');

        // ── 1. Venue ────────────────────────────────────────────────────────
        if ($id = $svcMap['venue'] ?? null) {
            if (!DB::table('service_venues')->where('service_id', $id)->exists()) {
                DB::table('service_venues')->insert([
                    'service_id'       => $id,
                    'min_people'       => 30,
                    'max_people'       => 300,
                    'price_per_person' => 85.00,
                    'min_cost'         => 5500.00,
                    'location'         => 'Olive Grove Estate, Paphos',
                    'created_at'       => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 2. Catering ─────────────────────────────────────────────────────
        if ($id = $svcMap['catering'] ?? null) {
            if (!DB::table('service_caterings')->where('service_id', $id)->exists()) {
                $cateringId = DB::table('service_caterings')->insertGetId([
                    'service_id' => $id, 'created_at' => now(), 'updated_at' => now(),
                ]);

                $cuisines = [
                    ['name' => 'Mediterranean', 'menus' => [
                        ['name' => 'Starter',     'max' => 2, 'price' => 0,  'items' => ['Bruschetta', 'Halloumi bites', 'Meze platter', 'Tzatziki & pita']],
                        ['name' => 'Main Course', 'max' => 1, 'price' => 65, 'items' => ['Grilled sea bass', 'Lamb souvlaki', 'Chicken kleftiko', 'Vegetarian stuffed peppers']],
                        ['name' => 'Dessert',     'max' => 2, 'price' => 0,  'items' => ['Baklava', 'Loukoumades', 'Fresh fruit platter', 'Chocolate fondant']],
                    ]],
                    ['name' => 'European', 'menus' => [
                        ['name' => 'Starter',     'max' => 2, 'price' => 0,  'items' => ['Caprese salad', 'Prawn cocktail', 'Soup of the day', 'Charcuterie board']],
                        ['name' => 'Main Course', 'max' => 1, 'price' => 55, 'items' => ['Beef tenderloin', 'Salmon en croute', 'Duck confit', 'Wild mushroom risotto']],
                        ['name' => 'Dessert',     'max' => 2, 'price' => 0,  'items' => ['Crème brûlée', 'Tiramisu', 'Cheesecake', 'Profiteroles']],
                    ]],
                ];
                foreach ($cuisines as $c) {
                    $cuisineId = DB::table('service_catering_cuisines')->insertGetId([
                        'service_catering_id' => $cateringId, 'cuisine_name' => $c['name'],
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                    foreach ($c['menus'] as $m) {
                        $menuId = DB::table('service_catering_menus')->insertGetId([
                            'cuisine_id' => $cuisineId, 'name' => $m['name'],
                            'max_choices' => $m['max'], 'price' => $m['price'],
                            'created_at' => now(), 'updated_at' => now(),
                        ]);
                        foreach ($m['items'] as $item) {
                            DB::table('service_catering_items')->insert([
                                'menu_id' => $menuId, 'name' => $item,
                                'created_at' => now(), 'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        }

        // ── 3. Florist ──────────────────────────────────────────────────────
        if ($id = $svcMap['florist'] ?? null) {
            if (!DB::table('service_florists')->where('service_id', $id)->exists()) {
                $fid = DB::table('service_florists')->insertGetId([
                    'service_id'        => $id,
                    'fresh_flower_price'=> 0,
                    'fake_flower_price' => 0,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                // Packages
                $packages = [
                    ['name'=>'Fresh Elegance',  'price'=>850,  'type'=>'fresh', 'features'=>['Bridal bouquet','3 bridesmaid bouquets','5 boutonnieres','Ceremony arch']],
                    ['name'=>'Fresh Luxe',      'price'=>1500, 'type'=>'fresh', 'features'=>['All Elegance items','Flower crown','4 centrepieces','Aisle petals','Thank-you bouquets']],
                    ['name'=>'Artificial Chic', 'price'=>600,  'type'=>'fake',  'features'=>['Bridal bouquet','2 bridesmaid bouquets','4 boutonnieres','Table centrepieces']],
                ];
                foreach ($packages as $p) {
                    DB::table('service_florist_packages')->insert([
                        'service_florist_id' => $fid, 'name' => $p['name'],
                        'price' => $p['price'], 'type' => $p['type'],
                        'features' => json_encode($p['features']), 'images' => null,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                // Colors
                foreach (['#FFFFFF','#FFF5F0','#FFE4E1','#F9C6D0','#D4E8D0','#C9E4F0','#FFF9C4','#F5E6CC'] as $hex) {
                    DB::table('service_florist_colors')->insert([
                        'service_florist_id' => $fid, 'hex_color' => $hex, 'price' => 0,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                // Designs
                $designs = [
                    ['name'=>'Garden Romance',  'price'=>0],
                    ['name'=>'Bohemian Wildflower','price'=>50],
                    ['name'=>'Classic White',   'price'=>0],
                    ['name'=>'Tropical Lush',   'price'=>80],
                ];
                foreach ($designs as $d) {
                    DB::table('service_florist_designs')->insert([
                        'service_florist_id' => $fid, 'name' => $d['name'],
                        'price' => $d['price'], 'images' => null,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                // Addons
                $addons = [
                    ['name'=>'Boutonniere',      'price'=>18,  'unit'=>'piece'],
                    ['name'=>'Flower crown',      'price'=>85,  'unit'=>'piece'],
                    ['name'=>'Pew markers',       'price'=>25,  'unit'=>'pair'],
                    ['name'=>'Table centrepiece', 'price'=>95,  'unit'=>'table'],
                    ['name'=>'Flower petals (aisle)','price'=>45,'unit'=>'bag'],
                ];
                foreach ($addons as $a) {
                    DB::table('service_florist_addons')->insert([
                        'service_florist_id' => $fid, 'name' => $a['name'],
                        'price_per_unit' => $a['price'], 'unit' => $a['unit'],
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }
        }

        // ── 4. Car Hire ─────────────────────────────────────────────────────
        if ($id = $svcMap['car-hire'] ?? null) {
            if (!DB::table('service_car_hires')->where('service_id', $id)->exists()) {
                $chid = DB::table('service_car_hires')->insertGetId([
                    'service_id' => $id, 'addon_options' => null,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                foreach ([['2 Hours', 220],['4 Hours', 360],['8 Hours', 550],['Full Day', 750]] as [$label, $price]) {
                    DB::table('service_car_hire_hours')->insert([
                        'service_car_hire_id' => $chid, 'label' => $label, 'price' => $price,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                foreach (['Rolls-Royce Silver Shadow','Bentley Continental GT','Classic Citroën DS'] as $car) {
                    DB::table('service_car_hire_addons')->insert([
                        'service_car_hire_id' => $chid, 'name' => $car, 'image_url' => null,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }
        }

        // ── 5. Photography ──────────────────────────────────────────────────
        if ($id = $svcMap['photography'] ?? null) {
            if (!DB::table('service_photography')->where('service_id', $id)->exists()) {
                $pid = DB::table('service_photography')->insertGetId([
                    'service_id' => $id, 'created_at' => now(), 'updated_at' => now(),
                ]);
                $pkgs = [
                    ['Silver', 1200, ['Ceremony coverage (4h)','500 edited images','Private online gallery','Print release']],
                    ['Gold',   2400, ['Ceremony + reception (8h)','1,000 edited images','HD video highlight reel','Photo book (30 pages)','Same-day preview']],
                    ['Platinum',3800,['Full wedding day (12h)','Unlimited images','Full cinematic film (15 min)','Two photographers','Luxury album (60 pages)','Engagement shoot']],
                ];
                foreach ($pkgs as [$name, $price, $includes]) {
                    $pkgId = DB::table('service_photography_packages')->insertGetId([
                        'service_photography_id' => $pid, 'package_name' => $name,
                        'price' => $price, 'includes' => json_encode($includes),
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                    $addons = [['Drone footage', 350], ['Second shooter', 500], ['Rush delivery (48h)', 200]];
                    foreach ($addons as [$aname, $aprice]) {
                        DB::table('service_photography_addons')->insert([
                            'package_id' => $pkgId, 'name' => $aname, 'price' => $aprice,
                            'created_at' => now(), 'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        // ── 6. Music ────────────────────────────────────────────────────────
        if ($id = $svcMap['music'] ?? null) {
            if (!DB::table('service_music')->where('service_id', $id)->exists()) {
                DB::table('service_music')->insert([
                    'service_id'     => $id,
                    'price_per_hour' => 180.00,
                    'video_url'      => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 7. Bride Dress ──────────────────────────────────────────────────
        if ($id = $svcMap['bride-dress'] ?? null) {
            if (!DB::table('service_bride_dresses')->where('service_id', $id)->exists()) {
                $bdid = DB::table('service_bride_dresses')->insertGetId([
                    'service_id'      => $id,
                    'price_rent'      => 800.00,
                    'price_buy'       => 1800.00,
                    'available_sizes' => json_encode(['XS','S','M','L','XL','2XL']),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                foreach ([['Cathedral veil',150],['Crystal tiara',80],['Pearl earrings',60],['Bridal alterations',120],['Embroidered sash',90]] as [$name,$price]) {
                    DB::table('service_bride_dress_extras')->insert([
                        'service_bride_dress_id' => $bdid, 'name' => $name, 'price' => $price,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }
        }

        // ── 8. Groom Suite ──────────────────────────────────────────────────
        if ($id = $svcMap['groom-suite'] ?? null) {
            if (!DB::table('service_groom_suites')->where('service_id', $id)->exists()) {
                DB::table('service_groom_suites')->insert([
                    'service_id'    => $id,
                    'price_rent'    => 350.00,
                    'price_buy'     => 1200.00,
                    'jacket_sizes'  => json_encode(['34','36','38','40','42','44','46','48','50','52']),
                    'vest_sizes'    => json_encode(['34','36','38','40','42','44','46','48','50','52']),
                    'shirt_sizes'   => json_encode(['14.5','15','15.5','16','16.5','17','17.5','18']),
                    'bottom_sizes'  => json_encode(['28','30','32','34','36','38','40','42']),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 9. Bridesmaid ────────────────────────────────────────────────────
        if ($id = $svcMap['bridesmaid'] ?? null) {
            if (!DB::table('service_bridesmaids_dresses')->where('service_id', $id)->exists()) {
                DB::table('service_bridesmaids_dresses')->insert([
                    'service_id'      => $id,
                    'price'           => 120.00,
                    'available_sizes' => json_encode(['XS','S','M','L','XL','2XL','3XL']),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 10. Best Man ─────────────────────────────────────────────────────
        if ($id = $svcMap['best-man'] ?? null) {
            if (!DB::table('service_best_man_suits')->where('service_id', $id)->exists()) {
                DB::table('service_best_man_suits')->insert([
                    'service_id'    => $id,
                    'price_rent'    => 200.00,
                    'price_buy'     => 600.00,
                    'jacket_sizes'  => json_encode(['36','38','40','42','44','46','48']),
                    'vest_sizes'    => json_encode(['36','38','40','42','44','46','48']),
                    'shirt_sizes'   => json_encode(['15','15.5','16','16.5','17','17.5']),
                    'bottom_sizes'  => json_encode(['28','30','32','34','36','38','40']),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 11. Flower Girl ──────────────────────────────────────────────────
        if ($id = $svcMap['flower-girl'] ?? null) {
            if (!DB::table('service_flower_girl_dresses')->where('service_id', $id)->exists()) {
                DB::table('service_flower_girl_dresses')->insert([
                    'service_id'  => $id,
                    'price'       => 85.00,
                    'age_groups'  => json_encode(['2–3 yrs','4–5 yrs','6–7 yrs','8–9 yrs','10–11 yrs']),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 12. Yacht ────────────────────────────────────────────────────────
        if ($id = $svcMap['yacht'] ?? null) {
            if (!DB::table('service_yacht_hires')->where('service_id', $id)->exists()) {
                $yhid = DB::table('service_yacht_hires')->insertGetId([
                    'service_id'   => $id,
                    'min_people'   => 4,
                    'max_people'   => 20,
                    'speed'        => '16 knots',
                    'length'       => '58 ft',
                    'cabin_crew'   => 2,
                    'washroom'     => 2,
                    'shower'       => 1,
                    'chef_included'=> true,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                foreach ([['4 Hours', 1800], ['8 Hours', 2900], ['Full Day Charter', 4200]] as [$label, $price]) {
                    DB::table('service_yacht_hire_hours')->insert([
                        'service_yacht_hire_id' => $yhid, 'label' => $label, 'price' => $price,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }
        }

        // ── 13. Bachelor ─────────────────────────────────────────────────────
        if ($id = $svcMap['bachelor'] ?? null) {
            if (!DB::table('service_bachelors')->where('service_id', $id)->exists()) {
                DB::table('service_bachelors')->insert([
                    'service_id'       => $id,
                    'price_per_hour'   => 150.00,
                    'price_per_person' => 45.00,
                    'catamaran_price'  => 280.00,
                    'excursion_price'  => 95.00,
                    'bar_crawl_price'  => 65.00,
                    'night_out_price'  => 85.00,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 14. Bachelorette ─────────────────────────────────────────────────
        if ($id = $svcMap['bachelorette'] ?? null) {
            if (!DB::table('service_bachelorettes')->where('service_id', $id)->exists()) {
                DB::table('service_bachelorettes')->insert([
                    'service_id'       => $id,
                    'price_per_hour'   => 130.00,
                    'price_per_person' => 45.00,
                    'catamaran_price'  => 260.00,
                    'excursion_price'  => 90.00,
                    'bar_crawl_price'  => 60.00,
                    'night_out_price'  => 80.00,
                    'spa_day_price'    => 95.00,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }

        // ── 15. Hotel ─────────────────────────────────────────────────────────
        if ($id = $svcMap['hotel'] ?? null) {
            if (!DB::table('service_accommodations')->where('service_id', $id)->exists()) {
                $acid = DB::table('service_accommodations')->insertGetId([
                    'service_id' => $id, 'location' => 'Protaras, Cyprus', 'images' => null,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                $rooms = [
                    ['Standard Room',          180, 2, 1],
                    ['Deluxe Sea View',        280, 2, 2],
                    ['Junior Suite',           420, 2, 2],
                    ['Wedding Suite',          650, 2, 2],
                    ['Presidential Penthouse', 980, 4, 2],
                ];
                foreach ($rooms as [$name, $price, $adults, $kids]) {
                    DB::table('service_accommodation_rooms')->insert([
                        'accommodation_id'  => $acid, 'room_type' => $name,
                        'price_per_night'   => $price,
                        'max_adults'        => $adults, 'max_kids' => $kids,
                        'images' => null, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                $facilities = [
                    ['Buffet breakfast (per person)', 18],
                    ['Airport transfer',              45],
                    ['Spa day pass',                  80],
                    ['Wedding dinner menu',            0],
                    ['Private beach setup',           120],
                ];
                foreach ($facilities as [$name, $price]) {
                    DB::table('service_accommodation_facilities')->insert([
                        'accommodation_id' => $acid, 'name' => $name, 'price' => $price,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }
        }

        // ── 16. Bar ──────────────────────────────────────────────────────────
        if ($id = $svcMap['bar'] ?? null) {
            if (!DB::table('service_bars')->where('service_id', $id)->exists()) {
                $barid = DB::table('service_bars')->insertGetId([
                    'service_id'  => $id,
                    'description' => 'Premium mobile bar service with trained mixologists.',
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                $menus = [
                    ['Classic Cocktails', 300, ['Mojito','Cosmopolitan','Negroni','Aperol Spritz','Piña Colada','Margarita']],
                    ['Premium Spirits',   450, ['Grey Goose Vodka','Hendrick\'s Gin','Jameson Whiskey','Patrón Tequila','Hennessy VSOP']],
                    ['Local Wine Selection',200,['Commandaria dessert wine','Xynisteri White','Maratheftiko Red','Rosé de Chypre']],
                    ['Soft & Mocktails',   80, ['Virgin Mojito','Fruit punch','Sparkling water','Fresh juices','Ginger beer']],
                ];
                foreach ($menus as [$name, $price, $items]) {
                    $mid = DB::table('service_bar_menus')->insertGetId([
                        'service_bar_id' => $barid, 'name' => $name, 'price' => $price,
                        'created_at' => now(), 'updated_at' => now(),
                    ]);
                    foreach ($items as $item) {
                        DB::table('service_bar_menu_items')->insert([
                            'menu_id' => $mid, 'name' => $item,
                            'created_at' => now(), 'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        // ── 17. Makeup ───────────────────────────────────────────────────────
        if ($id = $svcMap['makeup'] ?? null) {
            if (!DB::table('service_makeups')->where('service_id', $id)->exists()) {
                DB::table('service_makeups')->insert([
                    'service_id'            => $id,
                    'price_bridal'          => 200.00,
                    'price_after_wedding'   => 150.00,
                    'price_party'           => 120.00,
                    'price_trial_1'         => 100.00,
                    'price_trial_2'         => 100.00,
                    'available_date_trial_1'=> '2026-07-15',
                    'available_date_trial_2'=> '2026-08-12',
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }
}
