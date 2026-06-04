<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Ayia Napa',  'country' => 'Cyprus', 'bar_price' => 8.00,  'show_in_footer' => true],
            ['name' => 'Paphos',     'country' => 'Cyprus', 'bar_price' => 9.00,  'show_in_footer' => true],
            ['name' => 'Limassol',   'country' => 'Cyprus', 'bar_price' => 10.00, 'show_in_footer' => true],
            ['name' => 'Nicosia',    'country' => 'Cyprus', 'bar_price' => 9.00,  'show_in_footer' => true],
            ['name' => 'Larnaca',    'country' => 'Cyprus', 'bar_price' => 8.00,  'show_in_footer' => true],
            ['name' => 'Protaras',   'country' => 'Cyprus', 'bar_price' => 8.00,  'show_in_footer' => true],
            ['name' => 'Paralimni',  'country' => 'Cyprus', 'bar_price' => 7.00,  'show_in_footer' => false],
            ['name' => 'Troodos',    'country' => 'Cyprus', 'bar_price' => 7.00,  'show_in_footer' => false],
        ];

        foreach ($cities as $city) {
            DB::table('cities')->updateOrInsert(
                ['name' => $city['name'], 'country' => $city['country']],
                array_merge($city, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
