<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class VendorSeeder extends Seeder
{
    private function img(string $id, int $w = 800, int $h = 600): string
    {
        return "https://images.unsplash.com/photo-{$id}?w={$w}&h={$h}&fit=crop&auto=format&q=70";
    }

    public function run(): void
    {
        // ── Vendor user
        $vendor = User::firstOrCreate(
            ['email' => 'vendor@wedbox.com'],
            [
                'name'     => 'WedBox Showcase',
                'password' => Hash::make('password123'),
                'role'     => 'vendor',
            ]
        );

        Profile::firstOrCreate(['user_id' => $vendor->id], [
            'first_name' => 'WedBox',
            'last_name'  => 'Showcase',
        ]);

        VendorProfile::firstOrCreate(['user_id' => $vendor->id], [
            'business_name'       => 'WedBox Showcase Vendor',
            'business_description'=> 'Official demo vendor for the WedBox platform.',
            'contact_first_name'  => 'WedBox',
            'contact_last_name'   => 'Showcase',
            'location'            => 'Limassol, Cyprus',
        ]);

        // ── Category ID lookup
        $cats = DB::table('categories')->pluck('id', 'slug');

        // ── Service definitions (one per category)
        $services = [
            [
                'slug' => 'venue',
                'title' => 'Olive Grove Estate',
                'description' => 'A 14-acre olive grove with sea views, hand-carved limestone arches, and three event lawns. Capacity 30–300 guests with on-site coordination.',
                'location' => 'Paphos, Cyprus',
                'images' => [
                    $this->img('1519741497674-611481863552'),
                    $this->img('1464366400600-ac2db963f8c0'),
                    $this->img('1511795409834-432f7b1728b2'),
                ],
                'minimum_price' => 5500,
                'rating' => 4.90,
                'review_count' => 124,
                'is_featured' => true,
            ],
            [
                'slug' => 'catering',
                'title' => 'Mediterranea Catering Co.',
                'description' => 'Award-winning Mediterranean catering for weddings, banquets and corporate events. From authentic Cypriot mezze to fusion menus crafted by our head chef.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1555244162-d45-a0-a3'),
                    $this->img('1414235077428-338989a2e8c0'),
                    $this->img('1567620905732-2d1ec7ab7445'),
                ],
                'minimum_price' => 65,
                'rating' => 4.80,
                'review_count' => 98,
                'is_featured' => true,
            ],
            [
                'slug' => 'florist',
                'title' => 'Bloom & Vine Floristry',
                'description' => 'Romantic arrangements, wild bouquets and sustainable décor. We work with locally grown flowers and season-specific blooms to craft breathtaking displays.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1523438885200-e635ba2c371e'),
                    $this->img('1490750967868-88df5691240e'),
                    $this->img('1558618666-fcd25c85cd64'),
                ],
                'minimum_price' => 850,
                'rating' => 4.90,
                'review_count' => 77,
                'is_featured' => true,
            ],
            [
                'slug' => 'car-hire',
                'title' => 'Coastal Classic Cars',
                'description' => 'Vintage and luxury wedding car hire across Cyprus. Our fleet includes a 1965 Rolls-Royce Silver Shadow, a Bentley Continental GT, and a classic Citroen DS.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1553440569-bcc63803ef51'),
                    $this->img('1544636331-e516d28ef708'),
                    $this->img('1502161254119-f7ad10064f03'),
                ],
                'minimum_price' => 220,
                'rating' => 4.70,
                'review_count' => 55,
                'is_featured' => false,
            ],
            [
                'slug' => 'photography',
                'title' => 'Stillframe Studios',
                'description' => 'Award-winning wedding photography and cinematic video. We capture your story with natural light and documentary-style storytelling.',
                'location' => 'Ayia Napa, Cyprus',
                'images' => [
                    $this->img('1519741497674-611481863552'),
                    $this->img('1537633552985-df8429e8048b'),
                    $this->img('1519225421980-8f41e4890a6e'),
                ],
                'minimum_price' => 1200,
                'rating' => 4.90,
                'review_count' => 142,
                'is_featured' => true,
            ],
            [
                'slug' => 'music',
                'title' => 'The Limassol Quartet',
                'description' => 'A versatile four-piece string ensemble performing classical arrangements, jazz standards and contemporary covers. Available for ceremonies, cocktail hours and receptions.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1511192336575-5a79af67a629'),
                    $this->img('1470225620780-dba8ba36b745'),
                    $this->img('1507676184212-d03ab07a01bf'),
                ],
                'minimum_price' => 180,
                'rating' => 4.80,
                'review_count' => 63,
                'is_featured' => false,
            ],
            [
                'slug' => 'bride-dress',
                'title' => 'Aphrodite Bridal',
                'description' => 'Bespoke and designer bridal gowns for the modern bride. From timeless A-line silhouettes to contemporary fits, our Nicosia boutique offers alterations and accessories.',
                'location' => 'Nicosia, Cyprus',
                'images' => [
                    $this->img('1594552072238-5c4a6c2cfa40'),
                    $this->img('1511285560929-80b5a4621270'),
                    $this->img('1519225421980-8f41e4890a6e'),
                ],
                'minimum_price' => 800,
                'rating' => 4.90,
                'review_count' => 88,
                'is_featured' => true,
            ],
            [
                'slug' => 'groom-suite',
                'title' => 'Atelier Aristos',
                'description' => 'Tailored suits and tuxedos for grooms and groomsmen. Choose from hire or purchase options with a wide range of fabrics, cuts and accessories.',
                'location' => 'Nicosia, Cyprus',
                'images' => [
                    $this->img('1507679799987-c73779587ccf'),
                    $this->img('1593032465175-481ac7f401a0'),
                    $this->img('1617127365659-c47fa9d30a47'),
                ],
                'minimum_price' => 350,
                'rating' => 4.60,
                'review_count' => 41,
                'is_featured' => false,
            ],
            [
                'slug' => 'bridesmaid',
                'title' => 'Belle & Bridal Collective',
                'description' => 'A curated selection of bridesmaid dresses available in all sizes. Mix-and-match styles in over 30 colours to suit every wedding palette.',
                'location' => 'Larnaca, Cyprus',
                'images' => [
                    $this->img('1595777457583-95e059d581b8'),
                    $this->img('1490750967868-88df5691240e'),
                    $this->img('1522673607200-164d1b6ce486'),
                ],
                'minimum_price' => 120,
                'rating' => 4.50,
                'review_count' => 33,
                'is_featured' => false,
            ],
            [
                'slug' => 'best-man',
                'title' => 'Gentlemen\'s Guild',
                'description' => 'Coordinated suits and styling for the best man and groomsmen. Expert fittings and group hire packages available.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1617127365659-c47fa9d30a47'),
                    $this->img('1507679799987-c73779587ccf'),
                    $this->img('1593032465175-481ac7f401a0'),
                ],
                'minimum_price' => 200,
                'rating' => 4.40,
                'review_count' => 28,
                'is_featured' => false,
            ],
            [
                'slug' => 'flower-girl',
                'title' => 'Little Petals Boutique',
                'description' => 'Enchanting flower girl dresses in a range of styles and sizes. Custom embroidery and sash options available.',
                'location' => 'Paphos, Cyprus',
                'images' => [
                    $this->img('1522673607200-164d1b6ce486'),
                    $this->img('1595777457583-95e059d581b8'),
                ],
                'minimum_price' => 85,
                'rating' => 4.70,
                'review_count' => 22,
                'is_featured' => false,
            ],
            [
                'slug' => 'yacht',
                'title' => 'Poseidon Luxury Yachts',
                'description' => 'A 58-foot motor yacht for intimate celebrations on the Mediterranean. Includes a crew of two, a private chef, and full bar service.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1544551763-46a013bb70d5'),
                    $this->img('1530870110042-98b2cb110834'),
                    $this->img('1505118380757-91f5f5632de0'),
                ],
                'minimum_price' => 1800,
                'rating' => 4.90,
                'review_count' => 47,
                'is_featured' => true,
            ],
            [
                'slug' => 'bachelor',
                'title' => 'Epic Stag Cyprus',
                'description' => 'Fully customised stag weekends in Cyprus. Activities include dune buggies, boat trips, bar crawls and private villa packages.',
                'location' => 'Ayia Napa, Cyprus',
                'images' => [
                    $this->img('1528360983277-13d401cdc186'),
                    $this->img('1496440543397-55c80a11c52b'),
                    $this->img('1519046904884-53103b34b206'),
                ],
                'minimum_price' => 150,
                'rating' => 4.80,
                'review_count' => 93,
                'is_featured' => false,
            ],
            [
                'slug' => 'bachelorette',
                'title' => 'Pink Palm Hen Party',
                'description' => 'Unforgettable bachelorette experiences — from spa retreats to beach parties. Fully planned so the bride can relax and enjoy.',
                'location' => 'Paphos, Cyprus',
                'images' => [
                    $this->img('1522673607200-164d1b6ce486'),
                    $this->img('1496440543397-55c80a11c52b'),
                    $this->img('1467721783849-12bfbd5fca5a'),
                ],
                'minimum_price' => 130,
                'rating' => 4.80,
                'review_count' => 71,
                'is_featured' => false,
            ],
            [
                'slug' => 'hotel',
                'title' => 'Elysian Sands Resort',
                'description' => 'A 5-star beachfront resort offering exclusive wedding room blocks. Ocean-view suites, wedding suite upgrades, and dedicated concierge service.',
                'location' => 'Protaras, Cyprus',
                'images' => [
                    $this->img('1515934751635-c81c6bc9a2d8'),
                    $this->img('1551882547-ff40c599fb63'),
                    $this->img('1445019980597-93fa8acb246c'),
                ],
                'minimum_price' => 180,
                'rating' => 4.70,
                'review_count' => 56,
                'is_featured' => true,
            ],
            [
                'slug' => 'bar',
                'title' => 'The Mobile Cellar',
                'description' => 'A premium mobile bar service specialising in craft cocktails, local wines, and premium spirits. Staffed by trained mixologists.',
                'location' => 'Limassol, Cyprus',
                'images' => [
                    $this->img('1527661591-335815454a24'),
                    $this->img('1470337458703-4ad1cf8f9b53'),
                    $this->img('1550431344-b6e3d0534ac4'),
                ],
                'minimum_price' => 300,
                'rating' => 4.60,
                'review_count' => 39,
                'is_featured' => false,
            ],
            [
                'slug' => 'makeup',
                'title' => 'Glam Collective Cyprus',
                'description' => 'A team of expert bridal makeup artists and hairstylists. Specialising in airbrush, HD, and natural bridal looks.',
                'location' => 'Nicosia, Cyprus',
                'images' => [
                    $this->img('1487412947147-5cebf100d293'),
                    $this->img('1522337360788-8b13dee7a37e'),
                    $this->img('1503236823255-42d64e83cdd8'),
                ],
                'minimum_price' => 200,
                'rating' => 4.80,
                'review_count' => 84,
                'is_featured' => false,
            ],
            [
                'slug' => 'stationery',
                'title' => 'Paper & Bloom Studio',
                'description' => 'Bespoke wedding stationery — invitations, menus, place cards and signage. Foil printing, letterpress and digital options available.',
                'location' => 'Nicosia, Cyprus',
                'images' => [
                    $this->img('1503376780353-7e6692767b70'),
                    $this->img('1501143698666-5f3eba25d13b'),
                ],
                'minimum_price' => 120,
                'rating' => 4.50,
                'review_count' => 31,
                'is_featured' => false,
            ],
        ];

        foreach ($services as $svcData) {
            $catId = $cats[$svcData['slug']] ?? null;
            if (!$catId) continue;

            $existing = DB::table('services')
                ->where('vendor_id', $vendor->id)
                ->where('category_id', $catId)
                ->first();

            if (!$existing) {
                DB::table('services')->insert([
                    'vendor_id'     => $vendor->id,
                    'category_id'   => $catId,
                    'title'         => $svcData['title'],
                    'description'   => $svcData['description'],
                    'location'      => $svcData['location'],
                    'images'        => json_encode($svcData['images']),
                    'minimum_price' => $svcData['minimum_price'],
                    'rating'        => $svcData['rating'],
                    'review_count'  => $svcData['review_count'],
                    'is_featured'   => $svcData['is_featured'],
                    'status'        => 'active',
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }
    }
}
