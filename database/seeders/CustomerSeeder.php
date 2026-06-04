<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds 8 customer accounts so the admin users list looks populated
 * and reviews / orders have realistic author variety.
 */
class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['email' => 'emma.wilson@example.com',    'name' => 'Emma Wilson',    'first' => 'Emma',    'last' => 'Wilson',    'city' => 'Limassol',  'phone' => '+357 96 111 001'],
            ['email' => 'jack.turner@example.com',    'name' => 'Jack Turner',    'first' => 'Jack',    'last' => 'Turner',    'city' => 'Nicosia',   'phone' => '+357 96 111 002'],
            ['email' => 'olivia.harris@example.com',  'name' => 'Olivia Harris',  'first' => 'Olivia',  'last' => 'Harris',    'city' => 'Paphos',    'phone' => '+357 96 111 003'],
            ['email' => 'liam.morgan@example.com',    'name' => 'Liam Morgan',    'first' => 'Liam',    'last' => 'Morgan',    'city' => 'Larnaca',   'phone' => '+357 96 111 004'],
            ['email' => 'sophia.baker@example.com',   'name' => 'Sophia Baker',   'first' => 'Sophia',  'last' => 'Baker',     'city' => 'Famagusta', 'phone' => '+357 96 111 005'],
            ['email' => 'noah.clark@example.com',     'name' => 'Noah Clark',     'first' => 'Noah',    'last' => 'Clark',     'city' => 'Limassol',  'phone' => '+357 96 111 006'],
            ['email' => 'isabella.hall@example.com',  'name' => 'Isabella Hall',  'first' => 'Isabella','last' => 'Hall',      'city' => 'Nicosia',   'phone' => '+357 96 111 007'],
            ['email' => 'mason.young@example.com',    'name' => 'Mason Young',    'first' => 'Mason',   'last' => 'Young',     'city' => 'Ayia Napa', 'phone' => '+357 96 111 008'],
        ];

        foreach ($customers as $c) {
            $user = User::firstOrCreate(['email' => $c['email']], [
                'name'     => $c['name'],
                'password' => Hash::make('password123'),
                'role'     => 'customer',
            ]);
            Profile::firstOrCreate(['user_id' => $user->id], [
                'first_name' => $c['first'],
                'last_name'  => $c['last'],
                'phone'      => $c['phone'],
                'city'       => $c['city'],
                'country'    => 'Cyprus',
            ]);
        }
    }
}
