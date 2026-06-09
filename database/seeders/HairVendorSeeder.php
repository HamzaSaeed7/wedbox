<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class HairVendorSeeder extends Seeder
{
    public function run(): void
    {
        $hairCatId = DB::table('categories')->where('slug', 'hair')->value('id');
        if (!$hairCatId) {
            $this->command->error('Hair category not found — run CategorySeeder first.');
            return;
        }

        $vendor = User::firstOrCreate(
            ['email' => 'khamzasaeed7+hair@gmail.com'],
            [
                'name'                       => 'Silk & Shear Studio',
                'password'                   => Hash::make('abcd1234'),
                'role'                       => 'vendor',
                'vendor_subscription_status' => 'active',
                'vendor_plan'                => '3month',
            ]
        );

        Profile::firstOrCreate(['user_id' => $vendor->id], [
            'first_name' => 'Silk',
            'last_name'  => 'Shear',
        ]);

        VendorProfile::firstOrCreate(['user_id' => $vendor->id], [
            'business_name'        => 'Silk & Shear Studio',
            'business_description' => 'Luxury bridal hair styling studio specialising in updos, blowdrys, braids and extensions. Serving all of Cyprus.',
            'contact_first_name'   => 'Silk',
            'contact_last_name'    => 'Shear',
            'location'             => 'Limassol, Cyprus',
            'city'                 => 'Limassol',
            'country'              => 'Cyprus',
            'category_id'          => $hairCatId,
            'onboarding_completed' => true,
        ]);

        $existing = DB::table('services')
            ->where('vendor_id', $vendor->id)
            ->where('category_id', $hairCatId)
            ->first();

        $serviceId = $existing ? $existing->id : DB::table('services')->insertGetId([
            'vendor_id'     => $vendor->id,
            'category_id'   => $hairCatId,
            'title'         => 'Silk & Shear Bridal Hair',
            'description'   => 'Luxury bridal hair styling studio. We specialise in breathtaking updos, romantic braids, silky blowdrys and seamless extensions. Our Limassol studio serves brides across Cyprus with a calm, personalised experience.',
            'location'      => 'Limassol, Cyprus',
            'images'        => json_encode([
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&auto=format&q=70',
                'https://images.unsplash.com/photo-1487412947147-5cebf100d293?w=800&h=600&fit=crop&auto=format&q=70',
                'https://images.unsplash.com/photo-1503236823255-42d64e83cdd8?w=800&h=600&fit=crop&auto=format&q=70',
            ]),
            'minimum_price' => 90,
            'rating'        => 4.85,
            'review_count'  => 67,
            'is_featured'   => true,
            'status'        => 'active',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        DB::table('service_hairs')->updateOrInsert(['service_id' => $serviceId], [
            'pricing_mode' => 'packages',
            'packages'     => json_encode([
                ['name' => 'Bridal Updo',      'price' => 180, 'tier' => 'gold',   'features' => ['Trial session included', 'On-location service', 'Extensions available'], 'images' => []],
                ['name' => 'Blowdry & Waves',  'price' => 120, 'tier' => 'silver', 'features' => ['Glossy finish', 'Heat protection'], 'images' => []],
                ['name' => 'Braids & Plaits',  'price' => 140, 'tier' => 'silver', 'features' => ['Boho or classic styles', 'Hair accessories included'], 'images' => []],
                ['name' => 'Trial Session',    'price' => 90,  'tier' => null,     'features' => ['1.5 hour session', 'Style rehearsal', 'Photos taken'], 'images' => []],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info("Hair vendor created — ID {$vendor->id}, service ID {$serviceId}");
    }
}
