<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorServiceController extends Controller
{
    public function index(Request $request)
    {
        $user     = $request->user();
        $services = Service::with('category')
            ->where('vendor_id', $user->id)
            ->latest()
            ->get();

        // Auto-create the service from onboarding data on first visit
        if ($services->isEmpty()) {
            $user->load('vendorProfile');
            $profile = $user->vendorProfile;
            if ($profile && $profile->onboarding_completed && $profile->category_id) {
                $service  = Service::create([
                    'vendor_id'     => $user->id,
                    'category_id'   => $profile->category_id,
                    'title'         => $profile->business_name,
                    'description'   => $profile->business_description ?? null,
                    'location'      => $profile->city ?? $profile->address1 ?? null,
                    'minimum_price' => 0,
                    'images'        => [],
                    'status'        => 'draft',
                ]);
                $services = collect([$service->load('category')]);
            }
        }

        return response()->json($services);
    }

    // ── Load all sub-table relationships for one service ──────────────────
    private function loadSubData(Service $service): void
    {
        $slug = $service->category->slug ?? '';
        match ($slug) {
            'venue'         => $service->load('venue'),
            'catering'      => $service->load('catering.cuisines.menus.items'),
            'florist'       => $service->load('florist.packages', 'florist.colors', 'florist.designs', 'florist.addons'),
            'car-hire'      => $service->load('carHire.hours', 'carHire.addons'),
            'photography'   => $service->load('photography.packages.addons'),
            'music'         => $service->load('music'),
            'bride-dress'   => $service->load('brideDress.extras'),
            'groom-suite'   => $service->load('groomSuite'),
            'best-man'      => $service->load('bestManSuit'),
            'bridesmaid'    => $service->load('bridesmaidDress'),
            'flower-girl'   => $service->load('flowerGirlDress'),
            'yacht'         => $service->load('yachtHire.hours'),
            'bachelor'      => $service->load('bachelor'),
            'bachelorette'  => $service->load('bachelorette'),
            'hotel'         => $service->load('accommodation.rooms', 'accommodation.facilities'),
            'bar'           => $service->load('bar.menus.items'),
            'makeup'        => $service->load('makeup'),
            'hair'          => $service->load('hair'),
            'invitation'    => $service->load('invitation.types', 'invitation.designs', 'invitation.addons'),
            default         => null,
        };
    }

    // ── Update sub-table data for a service ───────────────────────────────
    public function updateSubdata(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $service->load('category');
        $slug = $service->category->slug ?? '';
        $d    = $request->input('data', []);

        match ($slug) {
            'venue'         => $this->saveVenue($service->id, $d),
            'catering'      => $this->saveCatering($service->id, $d),
            'florist'       => $this->saveFlorist($service->id, $d),
            'car-hire'      => $this->saveCarHire($service->id, $d),
            'photography'   => $this->savePhotography($service->id, $d),
            'music'         => $this->saveMusic($service->id, $d),
            'bride-dress'   => $this->saveBrideDress($service->id, $d),
            'groom-suite'   => $this->saveGroomSuite($service->id, $d),
            'best-man'      => $this->saveBestManSuit($service->id, $d),
            'bridesmaid'    => $this->saveBridesmaid($service->id, $d),
            'flower-girl'   => $this->saveFlowerGirl($service->id, $d),
            'yacht'         => $this->saveYacht($service->id, $d),
            'bachelor'      => $this->saveBachelor($service->id, $d),
            'bachelorette'  => $this->saveBachelorette($service->id, $d),
            'hotel'         => $this->saveHotel($service->id, $d),
            'bar'           => $this->saveBar($service->id, $d),
            'makeup'        => $this->saveMakeup($service->id, $d),
            'hair'          => $this->saveHair($service->id, $d),
            'invitation'    => $this->saveInvitation($service->id, $d),
            default         => null,
        };

        $this->loadSubData($service->fresh()->load('category'));
        return response()->json($service->fresh()->load('category'));
    }

    private function saveVenue(int $sid, array $d): void
    {
        DB::table('service_venues')->updateOrInsert(['service_id' => $sid], [
            'min_people'       => (int)($d['min_people'] ?? 0),
            'max_people'       => (int)($d['max_people'] ?? 0),
            'price_per_person' => (float)($d['price_per_person'] ?? 0),
            'min_cost'         => (float)($d['min_cost'] ?? 0),
            'location'         => $d['location'] ?? null,
            'updated_at'       => now(),
            'created_at'       => now(),
        ]);
    }

    private function saveCatering(int $sid, array $d): void
    {
        $catId = DB::table('service_caterings')->where('service_id', $sid)->value('id');
        if (!$catId) {
            $catId = DB::table('service_caterings')->insertGetId(['service_id' => $sid, 'created_at' => now(), 'updated_at' => now()]);
        }
        // Delete and re-insert cuisines
        $cuisineIds = DB::table('service_catering_cuisines')->where('service_catering_id', $catId)->pluck('id');
        DB::table('service_catering_items')->whereIn('menu_id', function ($q) use ($cuisineIds) {
            $q->select('id')->from('service_catering_menus')->whereIn('cuisine_id', $cuisineIds);
        })->delete();
        DB::table('service_catering_menus')->whereIn('cuisine_id', $cuisineIds)->delete();
        DB::table('service_catering_cuisines')->where('service_catering_id', $catId)->delete();

        foreach (($d['cuisines'] ?? []) as $c) {
            $cid = DB::table('service_catering_cuisines')->insertGetId(['service_catering_id' => $catId, 'cuisine_name' => $c['cuisine_name'] ?? $c['name'] ?? '', 'created_at' => now(), 'updated_at' => now()]);
            foreach (($c['menus'] ?? []) as $m) {
                $mid = DB::table('service_catering_menus')->insertGetId(['cuisine_id' => $cid, 'name' => $m['name'] ?? '', 'max_choices' => (int)($m['max_choices'] ?? 1), 'price' => (float)($m['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
                foreach (($m['items'] ?? []) as $item) {
                    DB::table('service_catering_items')->insert(['menu_id' => $mid, 'name' => is_array($item) ? ($item['name'] ?? '') : $item, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
        }
    }

    private function saveFlorist(int $sid, array $d): void
    {
        $fid = DB::table('service_florists')->where('service_id', $sid)->value('id');
        if (!$fid) {
            $fid = DB::table('service_florists')->insertGetId(['service_id' => $sid, 'fresh_flower_price' => 0, 'fake_flower_price' => 0, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_florist_packages')->where('service_florist_id', $fid)->delete();
        DB::table('service_florist_colors')->where('service_florist_id', $fid)->delete();
        DB::table('service_florist_designs')->where('service_florist_id', $fid)->delete();
        DB::table('service_florist_addons')->where('service_florist_id', $fid)->delete();

        foreach (($d['packages'] ?? []) as $p) {
            $pkgImages = array_values(array_filter((array)($p['images'] ?? [])));
            DB::table('service_florist_packages')->insert(['service_florist_id' => $fid, 'name' => $p['name'] ?? '', 'price' => (float)($p['price'] ?? 0), 'type' => $p['type'] ?? 'fresh', 'tier' => $p['tier'] ?? null, 'features' => json_encode($p['features'] ?? []), 'images' => $pkgImages ? json_encode($pkgImages) : null, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['colors'] ?? []) as $hex) {
            DB::table('service_florist_colors')->insert(['service_florist_id' => $fid, 'hex_color' => is_array($hex) ? ($hex['hex_color'] ?? $hex['hex'] ?? '#000000') : $hex, 'price' => 0, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['designs'] ?? []) as $des) {
            $imgUrl = $des['image'] ?? null;
            DB::table('service_florist_designs')->insert(['service_florist_id' => $fid, 'name' => $des['name'] ?? '', 'price' => (float)($des['price'] ?? 0), 'images' => $imgUrl ? json_encode([$imgUrl]) : null, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['addons'] ?? []) as $a) {
            DB::table('service_florist_addons')->insert(['service_florist_id' => $fid, 'name' => $a['name'] ?? '', 'price_per_unit' => (float)($a['price_per_unit'] ?? $a['price'] ?? 0), 'unit' => $a['unit'] ?? 'piece', 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function saveCarHire(int $sid, array $d): void
    {
        $chid = DB::table('service_car_hires')->where('service_id', $sid)->value('id');
        if (!$chid) {
            $chid = DB::table('service_car_hires')->insertGetId(['service_id' => $sid, 'addon_options' => null, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_car_hire_hours')->where('service_car_hire_id', $chid)->delete();
        DB::table('service_car_hire_addons')->where('service_car_hire_id', $chid)->delete();
        foreach (($d['hours'] ?? []) as $h) {
            DB::table('service_car_hire_hours')->insert(['service_car_hire_id' => $chid, 'label' => $h['label'] ?? '', 'price' => (float)($h['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['addons'] ?? []) as $a) {
            DB::table('service_car_hire_addons')->insert(['service_car_hire_id' => $chid, 'name' => is_array($a) ? ($a['name'] ?? '') : $a, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function savePhotography(int $sid, array $d): void
    {
        $pid = DB::table('service_photography')->where('service_id', $sid)->value('id');
        if (!$pid) {
            $pid = DB::table('service_photography')->insertGetId(['service_id' => $sid, 'created_at' => now(), 'updated_at' => now()]);
        }
        // Delete packages + addons
        DB::table('service_photography_addons')->whereIn('package_id', function ($q) use ($pid) {
            $q->select('id')->from('service_photography_packages')->where('service_photography_id', $pid);
        })->delete();
        DB::table('service_photography_packages')->where('service_photography_id', $pid)->delete();

        foreach (($d['packages'] ?? []) as $p) {
            $pkgId = DB::table('service_photography_packages')->insertGetId(['service_photography_id' => $pid, 'package_name' => $p['package_name'] ?? $p['name'] ?? '', 'price' => (float)($p['price'] ?? 0), 'includes' => json_encode($p['includes'] ?? []), 'created_at' => now(), 'updated_at' => now()]);
            foreach (($p['addons'] ?? []) as $a) {
                DB::table('service_photography_addons')->insert(['package_id' => $pkgId, 'name' => is_array($a) ? ($a['name'] ?? '') : $a, 'price' => (float)(is_array($a) ? ($a['price'] ?? 0) : 0), 'created_at' => now(), 'updated_at' => now()]);
            }
        }
    }

    private function saveMusic(int $sid, array $d): void
    {
        DB::table('service_music')->updateOrInsert(['service_id' => $sid], [
            'price_per_hour' => (float)($d['price_per_hour'] ?? 0),
            'video_url'      => $d['video_url'] ?? null,
            'updated_at'     => now(), 'created_at' => now(),
        ]);
    }

    private function saveBrideDress(int $sid, array $d): void
    {
        $bdid = DB::table('service_bride_dresses')->where('service_id', $sid)->value('id');
        if (!$bdid) {
            $bdid = DB::table('service_bride_dresses')->insertGetId(['service_id' => $sid, 'price_rent' => 0, 'price_buy' => 0, 'available_sizes' => '[]', 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_bride_dresses')->where('id', $bdid)->update(['price_rent' => (float)($d['price_rent'] ?? 0), 'price_buy' => (float)($d['price_buy'] ?? 0), 'available_sizes' => json_encode($d['available_sizes'] ?? []), 'updated_at' => now()]);
        DB::table('service_bride_dress_extras')->where('service_bride_dress_id', $bdid)->delete();
        foreach (($d['extras'] ?? []) as $e) {
            DB::table('service_bride_dress_extras')->insert(['service_bride_dress_id' => $bdid, 'name' => is_array($e) ? ($e['name'] ?? '') : $e, 'price' => (float)(is_array($e) ? ($e['price'] ?? 0) : 0), 'image' => is_array($e) ? ($e['image'] ?? null) : null, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function saveGroomSuite(int $sid, array $d): void
    {
        DB::table('service_groom_suites')->updateOrInsert(['service_id' => $sid], [
            'price_rent'   => (float)($d['price_rent'] ?? 0),
            'price_buy'    => (float)($d['price_buy'] ?? 0),
            'jacket_sizes' => json_encode($d['jacket_sizes'] ?? []),
            'vest_sizes'   => json_encode($d['vest_sizes'] ?? []),
            'shirt_sizes'  => json_encode($d['shirt_sizes'] ?? []),
            'bottom_sizes' => json_encode($d['bottom_sizes'] ?? []),
            'updated_at'   => now(), 'created_at' => now(),
        ]);
    }

    private function saveBestManSuit(int $sid, array $d): void
    {
        DB::table('service_best_man_suits')->updateOrInsert(['service_id' => $sid], [
            'price_rent'   => (float)($d['price_rent'] ?? 0),
            'price_buy'    => (float)($d['price_buy'] ?? 0),
            'jacket_sizes' => json_encode($d['jacket_sizes'] ?? []),
            'vest_sizes'   => json_encode($d['vest_sizes'] ?? []),
            'shirt_sizes'  => json_encode($d['shirt_sizes'] ?? []),
            'bottom_sizes' => json_encode($d['bottom_sizes'] ?? []),
            'updated_at'   => now(), 'created_at' => now(),
        ]);
    }

    private function saveBridesmaid(int $sid, array $d): void
    {
        DB::table('service_bridesmaids_dresses')->updateOrInsert(['service_id' => $sid], [
            'price'           => (float)($d['price'] ?? 0),
            'available_sizes' => json_encode($d['available_sizes'] ?? []),
            'updated_at'      => now(), 'created_at' => now(),
        ]);
    }

    private function saveFlowerGirl(int $sid, array $d): void
    {
        DB::table('service_flower_girl_dresses')->updateOrInsert(['service_id' => $sid], [
            'price'      => (float)($d['price'] ?? 0),
            'age_groups' => json_encode($d['age_groups'] ?? []),
            'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function saveYacht(int $sid, array $d): void
    {
        $yhid = DB::table('service_yacht_hires')->where('service_id', $sid)->value('id');
        if (!$yhid) {
            $yhid = DB::table('service_yacht_hires')->insertGetId(['service_id' => $sid, 'min_people' => 0, 'max_people' => 0, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_yacht_hires')->where('id', $yhid)->update([
            'min_people'    => (int)($d['min_people'] ?? 0),
            'max_people'    => (int)($d['max_people'] ?? 0),
            'speed'         => $d['speed'] ?? null,
            'length'        => $d['length'] ?? null,
            'cabin_crew'    => (int)($d['cabin_crew'] ?? 0),
            'washroom'      => (int)($d['washroom'] ?? 0),
            'shower'        => (int)($d['shower'] ?? 0),
            'chef_included' => (bool)($d['chef_included'] ?? false),
            'updated_at'    => now(),
        ]);
        DB::table('service_yacht_hire_hours')->where('service_yacht_hire_id', $yhid)->delete();
        foreach (($d['hours'] ?? []) as $h) {
            DB::table('service_yacht_hire_hours')->insert(['service_yacht_hire_id' => $yhid, 'label' => $h['label'] ?? '', 'price' => (float)($h['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function saveBachelor(int $sid, array $d): void
    {
        DB::table('service_bachelors')->updateOrInsert(['service_id' => $sid], [
            'price_per_hour'   => (float)($d['price_per_hour'] ?? 0),
            'price_per_person' => (float)($d['price_per_person'] ?? 0),
            'catamaran_price'  => (float)($d['catamaran_price'] ?? 0),
            'excursion_price'  => (float)($d['excursion_price'] ?? 0),
            'bar_crawl_price'  => (float)($d['bar_crawl_price'] ?? 0),
            'night_out_price'  => (float)($d['night_out_price'] ?? 0),
            'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function saveBachelorette(int $sid, array $d): void
    {
        DB::table('service_bachelorettes')->updateOrInsert(['service_id' => $sid], [
            'price_per_hour'   => (float)($d['price_per_hour'] ?? 0),
            'price_per_person' => (float)($d['price_per_person'] ?? 0),
            'catamaran_price'  => (float)($d['catamaran_price'] ?? 0),
            'excursion_price'  => (float)($d['excursion_price'] ?? 0),
            'bar_crawl_price'  => (float)($d['bar_crawl_price'] ?? 0),
            'night_out_price'  => (float)($d['night_out_price'] ?? 0),
            'spa_day_price'    => (float)($d['spa_day_price'] ?? 0),
            'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function saveHotel(int $sid, array $d): void
    {
        $acid = DB::table('service_accommodations')->where('service_id', $sid)->value('id');
        if (!$acid) {
            $acid = DB::table('service_accommodations')->insertGetId(['service_id' => $sid, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_accommodation_rooms')->where('accommodation_id', $acid)->delete();
        DB::table('service_accommodation_facilities')->where('accommodation_id', $acid)->delete();
        foreach (($d['rooms'] ?? []) as $r) {
            DB::table('service_accommodation_rooms')->insert(['accommodation_id' => $acid, 'room_type' => $r['room_type'] ?? '', 'price_per_night' => (float)($r['price_per_night'] ?? 0), 'max_adults' => (int)($r['max_adults'] ?? 2), 'max_kids' => (int)($r['max_kids'] ?? 0), 'images' => null, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['facilities'] ?? []) as $f) {
            DB::table('service_accommodation_facilities')->insert(['accommodation_id' => $acid, 'name' => is_array($f) ? ($f['name'] ?? '') : $f, 'price' => (float)(is_array($f) ? ($f['price'] ?? 0) : 0), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function saveBar(int $sid, array $d): void
    {
        $barid = DB::table('service_bars')->where('service_id', $sid)->value('id');
        if (!$barid) {
            $barid = DB::table('service_bars')->insertGetId(['service_id' => $sid, 'description' => null, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_bar_menu_items')->whereIn('menu_id', function ($q) use ($barid) {
            $q->select('id')->from('service_bar_menus')->where('service_bar_id', $barid);
        })->delete();
        DB::table('service_bar_menus')->where('service_bar_id', $barid)->delete();
        foreach (($d['menus'] ?? []) as $m) {
            $mid = DB::table('service_bar_menus')->insertGetId(['service_bar_id' => $barid, 'name' => $m['name'] ?? '', 'price' => (float)($m['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
            foreach (($m['items'] ?? []) as $item) {
                DB::table('service_bar_menu_items')->insert(['menu_id' => $mid, 'name' => is_array($item) ? ($item['name'] ?? '') : $item, 'created_at' => now(), 'updated_at' => now()]);
            }
        }
    }

    private function saveMakeup(int $sid, array $d): void
    {
        $mode = in_array($d['pricing_mode'] ?? '', ['packages', 'regular']) ? $d['pricing_mode'] : 'regular';

        // Strip any UI-only transient fields from package objects
        $packages = array_map(function (array $p) {
            unset($p['_uploading']);
            $p['images']   = array_values(array_filter((array)($p['images'] ?? [])));
            $p['features'] = array_values(array_filter((array)($p['features'] ?? [])));
            $p['price']    = (float)($p['price'] ?? 0);
            $p['tier']     = $p['tier'] ?? null;
            return $p;
        }, (array)($d['packages'] ?? []));

        DB::table('service_makeups')->updateOrInsert(['service_id' => $sid], [
            'pricing_mode'           => $mode,
            'packages'               => json_encode($packages),
            'price_bridal'           => (float)($d['price_bridal'] ?? 0),
            'price_after_wedding'    => (float)($d['price_after_wedding'] ?? 0),
            'price_party'            => (float)($d['price_party'] ?? 0),
            'price_trial_1'          => (float)($d['price_trial_1'] ?? 0),
            'price_trial_2'          => (float)($d['price_trial_2'] ?? 0),
            'available_date_trial_1' => $d['available_date_trial_1'] ?? null,
            'available_date_trial_2' => $d['available_date_trial_2'] ?? null,
            'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function saveHair(int $sid, array $d): void
    {
        $mode = in_array($d['pricing_mode'] ?? '', ['packages', 'regular']) ? $d['pricing_mode'] : 'regular';

        $packages = array_map(function (array $p) {
            unset($p['_uploading']);
            $p['images']   = array_values(array_filter((array)($p['images'] ?? [])));
            $p['features'] = array_values(array_filter((array)($p['features'] ?? [])));
            $p['price']    = (float)($p['price'] ?? 0);
            $p['tier']     = $p['tier'] ?? null;
            return $p;
        }, (array)($d['packages'] ?? []));

        DB::table('service_hairs')->updateOrInsert(['service_id' => $sid], [
            'pricing_mode'           => $mode,
            'packages'               => json_encode($packages),
            'price_bridal'           => (float)($d['price_bridal'] ?? 0),
            'price_after_wedding'    => (float)($d['price_after_wedding'] ?? 0),
            'price_party'            => (float)($d['price_party'] ?? 0),
            'price_trial_1'          => (float)($d['price_trial_1'] ?? 0),
            'price_trial_2'          => (float)($d['price_trial_2'] ?? 0),
            'available_date_trial_1' => $d['available_date_trial_1'] ?? null,
            'available_date_trial_2' => $d['available_date_trial_2'] ?? null,
            'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function saveInvitation(int $sid, array $d): void
    {
        $iid = DB::table('service_invitations')->where('service_id', $sid)->value('id');
        if (!$iid) {
            $iid = DB::table('service_invitations')->insertGetId(['service_id' => $sid, 'created_at' => now(), 'updated_at' => now()]);
        }
        DB::table('service_invitation_types')->where('service_invitation_id', $iid)->delete();
        DB::table('service_invitation_designs')->where('service_invitation_id', $iid)->delete();
        DB::table('service_invitation_addons')->where('service_invitation_id', $iid)->delete();

        foreach (($d['types'] ?? []) as $t) {
            if (trim((string)($t['name'] ?? '')) === '') continue;
            DB::table('service_invitation_types')->insert(['service_invitation_id' => $iid, 'name' => $t['name'], 'price' => (float)($t['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['designs'] ?? []) as $des) {
            if (trim((string)($des['name'] ?? '')) === '' && empty($des['image'])) continue;
            DB::table('service_invitation_designs')->insert(['service_invitation_id' => $iid, 'name' => $des['name'] ?? '', 'image' => $des['image'] ?? null, 'price' => (float)($des['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (($d['addons'] ?? []) as $a) {
            if (trim((string)($a['name'] ?? '')) === '') continue;
            DB::table('service_invitation_addons')->insert(['service_invitation_id' => $iid, 'name' => $a['name'], 'price' => (float)($a['price'] ?? 0), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'title'         => 'required|string',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string',
            'minimum_price' => 'nullable|numeric|min:0',
            'images'        => 'nullable|array|min:2',
            'sub_data'      => 'nullable|array',
        ]);

        $service = Service::create([
            'vendor_id'     => $request->user()->id,
            'category_id'   => $data['category_id'],
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'location'      => $data['location'] ?? null,
            'minimum_price' => $data['minimum_price'] ?? 0,
            'images'        => $data['images'] ?? [],
            'status'        => 'draft',
        ]);

        return response()->json($service->load('category'), 201);
    }

    public function show(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        $service->load('category', 'reviews.user.profile');
        $this->loadSubData($service);
        return response()->json($service);
    }

    public function update(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validate([
            'title'         => 'sometimes|string',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string',
            'minimum_price' => 'nullable|numeric|min:0',
            'images'        => 'nullable|array',
            'status'        => 'in:active,inactive,draft',
        ]);

        $service->update($data);
        return response()->json($service);
    }

    public function destroy(Request $request, Service $service)
    {
        if ($service->vendor_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $service->delete();
        return response()->json(null, 204);
    }
}
