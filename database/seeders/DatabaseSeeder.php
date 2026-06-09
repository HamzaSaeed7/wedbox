<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Seeds the database from the current localhost snapshot.
 *
 * Credentials after seeding:
 *   admin@wedbox.com          → admin123
 *   All other accounts        → password
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CategorySeeder::class,      // 18 categories
            CitySeeder::class,          // 8 Cyprus cities
            TestimonialSeeder::class,   // 6 homepage testimonials
            BlogSeeder::class,          // 7 blog articles
            UserSeeder::class,          // admin + customers + all vendors
            VendorProfileSeeder::class, // 31 vendor profiles
            ServiceSeeder::class,       // 25 services
        ]);
    }
}
