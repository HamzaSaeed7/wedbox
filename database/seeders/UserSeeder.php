<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds all users (customers, vendors, admin) from the live localhost snapshot.
 * All accounts use password: "password" — admin uses "admin123".
 * Stripe fields are intentionally nulled out (environment-specific).
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $password  = Hash::make('password');
        $admin_pwd = Hash::make('admin123');
        $now       = now();

        // Helper: a row with all vendor fields nulled (for customers/admin)
        $base = ['vendor_subscription_status' => null, 'vendor_plan' => null];

        DB::table('users')->insert([

            // ── Customers ────────────────────────────────────────────────
            $base + ['id' => 1,  'name' => 'Test User',            'email' => 'test@wedbox.com',                   'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 9,  'name' => 'Emma Wilson',          'email' => 'emma.wilson@example.com',           'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 10, 'name' => 'Jack Turner',          'email' => 'jack.turner@example.com',           'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 11, 'name' => 'Olivia Harris',        'email' => 'olivia.harris@example.com',         'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 12, 'name' => 'Liam Morgan',          'email' => 'liam.morgan@example.com',           'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 13, 'name' => 'Sophia Baker',         'email' => 'sophia.baker@example.com',          'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 14, 'name' => 'Noah Clark',           'email' => 'noah.clark@example.com',            'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 15, 'name' => 'Isabella Hall',        'email' => 'isabella.hall@example.com',         'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 16, 'name' => 'Mason Young',          'email' => 'mason.young@example.com',           'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],
            $base + ['id' => 23, 'name' => 'Hamza Test',           'email' => 'khamzasaeed7+customer@gmail.com',   'role' => 'customer', 'password' => $password,  'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],

            // ── Admin ─────────────────────────────────────────────────────
            $base + ['id' => 45, 'name' => 'Admin',                'email' => 'admin@wedbox.com',                  'role' => 'admin',    'password' => $admin_pwd, 'email_verified_at' => $now, 'created_at' => $now, 'updated_at' => $now],

            // ── Demo vendors (original seeded accounts) ───────────────────
            ['id' => 4,  'name' => 'Eleni Papadopoulos',   'email' => 'aphrodite@wedbox.com',              'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 5,  'name' => 'Andreas Constantinou', 'email' => 'islandlens@wedbox.com',             'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 6,  'name' => 'Sofia Nikkola',        'email' => 'bridalatelier@wedbox.com',          'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 7,  'name' => 'Nikos Georgiou',       'email' => 'bluemediterranean@wedbox.com',      'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 8,  'name' => 'Maria Loizidou',       'email' => 'nicosiaflowers@wedbox.com',         'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],

            // Missing users referenced by vendor_profiles (reconstructed from profile data)
            ['id' => 31, 'name' => 'Cyprus Classic Cars',  'email' => 'carcyprus@wedbox.com',              'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 33, 'name' => 'Strings Beats Music',  'email' => 'strings@wedbox.com',                'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 34, 'name' => 'La Maison Bridal',     'email' => 'lamaison@wedbox.com',               'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 35, 'name' => 'The Dapper Groom',     'email' => 'dappergroom@wedbox.com',            'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],

            // ── Test vendors (created via UI) ─────────────────────────────
            ['id' => 17, 'name' => 'Vendor test',          'email' => 'vendor+flower@test.com',            'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 18, 'name' => 'Vendor Test',          'email' => 'vendor@wedbox.com',                 'role' => 'vendor',   'password' => $password,  'email_verified_at' => null, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 19, 'name' => 'Vendor Test',          'email' => 'khamzasaeed7+vendor@gmail.com',     'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 20, 'name' => 'test test',            'email' => 'khamzasaeed7+vendor1@gmail.com',    'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => null,     'vendor_plan' => null,       'created_at' => $now, 'updated_at' => $now],
            ['id' => 21, 'name' => 'Flower test',          'email' => 'khamzasaeed7+flower@gmail.com',     'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 22, 'name' => 'Venue test',           'email' => 'khamzasaeed7+venue@gmail.com',      'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 24, 'name' => 'Catering Test',        'email' => 'khamzasaeed7+catering@gmail.com',   'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 25, 'name' => 'CarHire test',         'email' => 'khamzasaeed7+CarHire@gmail.com',    'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 26, 'name' => 'Photography test',     'email' => 'khamzasaeed7+Photography@gmail.com','role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 27, 'name' => 'Music Test',           'email' => 'khamzasaeed7+Music@gmail.com',      'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 28, 'name' => 'BrideDress test',      'email' => 'khamzasaeed7+BrideDress@gmail.com', 'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 29, 'name' => 'GroomSuite test',      'email' => 'khamzasaeed7+GroomSuite@gmail.com', 'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 30, 'name' => 'Florist Vendor',       'email' => 'khamzasaeed7+florist@gmail.com',    'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 32, 'name' => 'Photographer Vendor',  'email' => 'khamzasaeed7+photographer@gmail.com','role' => 'vendor',  'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 36, 'name' => 'Bridesmaid Vendor',    'email' => 'khamzasaeed7+bridesmaid@gmail.com', 'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 37, 'name' => 'Bestman Vendor',       'email' => 'khamzasaeed7+bestman@gmail.com',    'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 38, 'name' => 'Flowergirl Vendor',    'email' => 'khamzasaeed7+flowergirl@gmail.com', 'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 39, 'name' => 'Yacht Vendor',         'email' => 'khamzasaeed7+yacht@gmail.com',      'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 40, 'name' => 'Bachelor Vendor',      'email' => 'khamzasaeed7+bachelor@gmail.com',   'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 41, 'name' => 'Bachelorette Vendor',  'email' => 'khamzasaeed7+bachelorette@gmail.com','role' => 'vendor',  'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 42, 'name' => 'Hotel Vendor',         'email' => 'khamzasaeed7+hotel@gmail.com',      'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 43, 'name' => 'Bar Vendor',           'email' => 'khamzasaeed7+bar@gmail.com',        'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 44, 'name' => 'Makeup Vendor',        'email' => 'khamzasaeed7+makeup@gmail.com',     'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
            ['id' => 46, 'name' => 'Silk & Shear Studio',  'email' => 'khamzasaeed7+hair@gmail.com',       'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '3month',   'created_at' => $now, 'updated_at' => $now],
            ['id' => 47, 'name' => 'Hamza Saeed',          'email' => 'khamzasaeed7+sub@gmail.com',        'role' => 'vendor',   'password' => $password,  'email_verified_at' => $now, 'vendor_subscription_status' => 'active', 'vendor_plan' => '12month',  'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
