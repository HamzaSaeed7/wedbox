<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'venue',        'name' => 'Venues',           'description' => 'Event venues and estates for your ceremony and reception.',   'order' => 1],
            ['slug' => 'catering',     'name' => 'Catering',         'description' => 'Wedding catering and banquet services.',                       'order' => 2],
            ['slug' => 'florist',      'name' => 'Florists',         'description' => 'Floral arrangements, bouquets, and décor.',                    'order' => 3],
            ['slug' => 'car-hire',     'name' => 'Car Hire',         'description' => 'Luxury and classic wedding car hire.',                          'order' => 4],
            ['slug' => 'photography',  'name' => 'Photography',      'description' => 'Professional wedding photographers and videographers.',          'order' => 5],
            ['slug' => 'music',        'name' => 'Music',            'description' => 'Live bands, DJs, and entertainment.',                           'order' => 6],
            ['slug' => 'bride-dress',  'name' => 'Bride Dress',      'description' => 'Bridal gowns, alterations and accessories.',                   'order' => 7],
            ['slug' => 'groom-suite',  'name' => 'Groom Suite',      'description' => 'Groom and groomsmen suits for hire or purchase.',               'order' => 8],
            ['slug' => 'bridesmaid',   'name' => 'Bridesmaids',      'description' => 'Bridesmaid dress hire and purchase.',                           'order' => 9],
            ['slug' => 'best-man',     'name' => 'Best Man',         'description' => 'Best man suit hire and styling.',                               'order' => 10],
            ['slug' => 'flower-girl',  'name' => 'Flower Girl',      'description' => 'Flower girl dresses for little ones.',                          'order' => 11],
            ['slug' => 'yacht',        'name' => 'Yacht Hire',       'description' => 'Luxury yacht hire for the perfect celebration.',                'order' => 12],
            ['slug' => 'bachelor',     'name' => 'Bachelor Party',   'description' => 'Bachelor party planning and packages.',                         'order' => 13],
            ['slug' => 'bachelorette', 'name' => 'Bachelorette',     'description' => 'Bachelorette party planning and packages.',                     'order' => 14],
            ['slug' => 'hotel',        'name' => 'Hotels',           'description' => 'Hotel blocks and accommodation for wedding guests.',             'order' => 15],
            ['slug' => 'bar',          'name' => 'Bar',              'description' => 'Mobile bars and drinks packages.',                              'order' => 16],
            ['slug' => 'makeup',       'name' => 'Make-up',          'description' => 'Bridal hair and makeup artists.',                               'order' => 17],
            ['slug' => 'stationery',   'name' => 'Stationery',       'description' => 'Wedding invitations, menus, and stationery.',                   'order' => 18],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $cat['slug']],
                array_merge($cat, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
