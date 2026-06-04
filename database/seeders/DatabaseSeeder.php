<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── Test customer
        $customer = User::firstOrCreate(
            ['email' => 'test@wedbox.com'],
            [
                'name'     => 'Test User',
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ]
        );
        Profile::firstOrCreate(['user_id' => $customer->id], [
            'first_name' => 'Test',
            'last_name'  => 'User',
        ]);

        // ── Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@wedbox.com'],
            [
                'name'     => 'WedBox Admin',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ]
        );
        Profile::firstOrCreate(['user_id' => $admin->id], [
            'first_name' => 'WedBox',
            'last_name'  => 'Admin',
        ]);

        // ── Lookup data + services
        $this->call([
            CategorySeeder::class,
            CitySeeder::class,
            VendorSeeder::class,          // main showcase vendor + 18 services
            ServiceSubdataSeeder::class,  // sub-table data for all 18 services
            ExtraVendorSeeder::class,     // 5 more vendors with services + sub-data
            CustomerSeeder::class,        // 8 realistic customer accounts
            TestimonialSeeder::class,     // 6 homepage testimonials
            BlogSeeder::class,            // 5 real blog articles
            ReviewSeeder::class,          // reviews on all active services
            OrderAndFavoriteSeeder::class,// orders + favourites for test accounts
            ConversationSeeder::class,    // message threads between customers & vendors
        ]);
    }
}
