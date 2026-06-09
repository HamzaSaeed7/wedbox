<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $now = now();

        DB::table('categories')->insert([
            ['id' =>  1, 'name' => 'Venues',        'slug' => 'venue',        'description' => 'Event venues and estates for your ceremony and reception.',    'order' =>  1, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  2, 'name' => 'Catering',       'slug' => 'catering',     'description' => 'Wedding catering and banquet services.',                       'order' =>  2, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  3, 'name' => 'Florists',       'slug' => 'florist',      'description' => 'Floral arrangements, bouquets, and décor.',                    'order' =>  3, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  4, 'name' => 'Car Hire',       'slug' => 'car-hire',     'description' => 'Luxury and classic wedding car hire.',                         'order' =>  4, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  5, 'name' => 'Photography',    'slug' => 'photography',  'description' => 'Professional wedding photographers and videographers.',        'order' =>  5, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  6, 'name' => 'Music',          'slug' => 'music',        'description' => 'Live bands, DJs, and entertainment.',                          'order' =>  6, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  7, 'name' => 'Bride Dress',    'slug' => 'bride-dress',  'description' => 'Bridal gowns, alterations and accessories.',                   'order' =>  7, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  8, 'name' => 'Groom Suite',    'slug' => 'groom-suite',  'description' => 'Groom and groomsmen suits for hire or purchase.',              'order' =>  8, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' =>  9, 'name' => 'Bridesmaids',    'slug' => 'bridesmaid',   'description' => 'Bridesmaid dress hire and purchase.',                          'order' =>  9, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 10, 'name' => 'Best Man',       'slug' => 'best-man',     'description' => 'Best man suit hire and styling.',                              'order' => 10, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 11, 'name' => 'Flower Girl',    'slug' => 'flower-girl',  'description' => 'Flower girl dresses for little ones.',                         'order' => 11, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 12, 'name' => 'Yacht Hire',     'slug' => 'yacht',        'description' => 'Luxury yacht hire for the perfect celebration.',               'order' => 12, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 13, 'name' => 'Bachelor Party', 'slug' => 'bachelor',     'description' => 'Bachelor party planning and packages.',                        'order' => 13, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 14, 'name' => 'Bachelorette',   'slug' => 'bachelorette', 'description' => 'Bachelorette party planning and packages.',                    'order' => 14, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 15, 'name' => 'Hotels',         'slug' => 'hotel',        'description' => 'Hotel blocks and accommodation for wedding guests.',           'order' => 15, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 16, 'name' => 'Bar',            'slug' => 'bar',          'description' => 'Mobile bars and drinks packages.',                             'order' => 16, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 17, 'name' => 'Make-up',        'slug' => 'makeup',       'description' => 'Bridal hair and makeup artists.',                              'order' => 17, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 18, 'name' => 'Hair',           'slug' => 'hair',         'description' => 'Bridal hair styling, updo, and blowdry services.',            'order' => 18, 'icon_url' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
