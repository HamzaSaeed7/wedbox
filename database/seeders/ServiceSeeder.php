<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('services')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $now = now();

        DB::table('services')->insert([
            // ── Demo vendor services ─────────────────────────────────────
            [
                'id' => 20, 'vendor_id' => 4, 'category_id' => 2,
                'title' => 'Citrus Kitchen Catering',
                'description' => 'Farm-to-table wedding catering celebrating Cyprus seasonal produce. Vegan, halal and gluten-free options available.',
                'location' => 'Larnaca, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '55.00', 'rating' => '5.00', 'review_count' => 4,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 21, 'vendor_id' => 5, 'category_id' => 5,
                'title' => 'Island Lens Photography',
                'description' => 'Documentary wedding photography in natural light. Capturing authentic emotion across Cyprus\'s most beautiful locations.',
                'location' => 'Paphos, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1519225421980-8f41e4890a6e?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '1100.00', 'rating' => '4.20', 'review_count' => 5,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 22, 'vendor_id' => 5, 'category_id' => 6,
                'title' => 'Paphos Jazz Trio',
                'description' => 'Intimate jazz ensemble perfect for cocktail hours and garden receptions. Acoustic sets with custom song requests.',
                'location' => 'Paphos, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '160.00', 'rating' => '4.25', 'review_count' => 4,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 25, 'vendor_id' => 6, 'category_id' => 9,
                'title' => 'Silk & Rose Bridesmaids',
                'description' => 'A collection of over 40 bridesmaid styles in 25 colours. Group fittings available with refreshments.',
                'location' => 'Limassol, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '110.00', 'rating' => '4.60', 'review_count' => 5,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 26, 'vendor_id' => 7, 'category_id' => 12,
                'title' => 'Azure Dream Yacht',
                'description' => 'A sleek 46-foot sailing catamaran with sun deck and shaded lounge. Perfect for intimate wedding celebrations at sea.',
                'location' => 'Ayia Napa, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '1400.00', 'rating' => '3.67', 'review_count' => 3,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],

            // ── Test vendor services (created via UI) ─────────────────────
            [
                'id' => 31, 'vendor_id' => 21, 'category_id' => 3,
                'title' => 'The flower',
                'description' => 'this is the description',
                'location' => 'Troodos',
                'images' => '["https://images.unsplash.com/photo-1490750967868-88df5691240e?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '20.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 32, 'vendor_id' => 22, 'category_id' => 1,
                'title' => 'The venue',
                'description' => 'this is the description',
                'location' => 'Troodos',
                'images' => '["https://images.unsplash.com/photo-1464366400600-ac2db963f8c0?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '40.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 33, 'vendor_id' => 24, 'category_id' => 2,
                'title' => 'The Catering',
                'description' => 'This is the description',
                'location' => 'Protaras',
                'images' => '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '80.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 34, 'vendor_id' => 25, 'category_id' => 4,
                'title' => 'The CarHire',
                'description' => 'This is the description',
                'location' => 'Troodos',
                'images' => '["https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '450.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 35, 'vendor_id' => 26, 'category_id' => 5,
                'title' => 'the Photography',
                'description' => 'This is the description',
                'location' => 'Troodos',
                'images' => '["https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '200.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 36, 'vendor_id' => 27, 'category_id' => 6,
                'title' => 'the Music',
                'description' => 'This is the description',
                'location' => 'Troodos',
                'images' => '["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '100.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 37, 'vendor_id' => 28, 'category_id' => 7,
                'title' => 'The Bride Dress',
                'description' => 'This is the description',
                'location' => 'Protaras',
                'images' => '["https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '50.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 53, 'vendor_id' => 29, 'category_id' => 8,
                'title' => 'The GroomSuite',
                'description' => 'This is the description.',
                'location' => 'Troodos',
                'images' => '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '80.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],

            // ── Extra demo vendor services ────────────────────────────────
            [
                'id' => 54, 'vendor_id' => 41, 'category_id' => 14,
                'title' => 'Cyprus Bachelorette Experience',
                'description' => 'Unforgettable bachelorette parties across Cyprus — beach clubs, yacht trips, sunset cocktails, and personalised itineraries for the bride-to-be and her squad.',
                'location' => 'Ayia Napa, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '299.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 55, 'vendor_id' => 42, 'category_id' => 15,
                'title' => 'Luxury Wedding Accommodation',
                'description' => 'Exclusive hotel packages for wedding guests and the bridal party. Sea-view suites, honeymoon upgrades, and group booking discounts across Cyprus top resorts.',
                'location' => 'Paphos, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '180.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 56, 'vendor_id' => 43, 'category_id' => 16,
                'title' => 'Premium Wedding Bar Service',
                'description' => 'Professional mobile bar hire for weddings and events. Craft cocktails, local wines, premium spirits, and experienced bartenders to keep your celebration flowing.',
                'location' => 'Limassol, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '450.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 57, 'vendor_id' => 44, 'category_id' => 17,
                'title' => 'Bridal Make-up Artistry',
                'description' => 'Luxury bridal make-up by certified artists. Trial sessions, airbrush finish, long-lasting formulas for Cyprus heat, and full-party packages for bridesmaids and mothers.',
                'location' => 'Nicosia, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '220.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 58, 'vendor_id' => 38, 'category_id' => 11,
                'title' => 'Flower Girl Dress Collection',
                'description' => 'Enchanting flower girl dresses handcrafted in Cyprus. Soft tulle, satin, and lace designs in every colour palette — custom sizing and rush orders available.',
                'location' => 'Larnaca, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '95.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 59, 'vendor_id' => 39, 'category_id' => 12,
                'title' => 'Cyprus Yacht Hire for Weddings',
                'description' => 'Say your vows on the Mediterranean. Luxury yacht hire for wedding ceremonies, receptions, and honeymoon cruises around the coast of Cyprus.',
                'location' => 'Limassol Marina, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '1200.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 60, 'vendor_id' => 40, 'category_id' => 13,
                'title' => 'Epic Bachelor Party Cyprus',
                'description' => 'The ultimate bachelor party experience in Cyprus. Go-karting, boat trips, beach parties, quad biking, and VIP club packages — we handle everything.',
                'location' => 'Ayia Napa, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '350.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 61, 'vendor_id' => 34, 'category_id' => 7,
                'title' => 'Bridal Gown Boutique',
                'description' => 'Bespoke wedding gowns crafted for the modern bride. Lace, silk, and contemporary silhouettes with full alteration service and bridal accessories in our Cyprus atelier.',
                'location' => 'Paphos, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '1500.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 62, 'vendor_id' => 35, 'category_id' => 8,
                'title' => 'Groom Suit & Styling',
                'description' => 'Sharp, tailored suits for grooms and groomsmen. Italian fabrics, bespoke fit, and a full styling consultation to ensure you look your best on the day.',
                'location' => 'Nicosia, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1553867745-6af7a78f7d7a?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '650.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 63, 'vendor_id' => 36, 'category_id' => 9,
                'title' => 'Bridesmaid Dress Studio',
                'description' => 'Coordinated bridesmaid dresses for every body type and style. Mix-and-match collections, custom colour matching, and group discounts for parties of 4 or more.',
                'location' => 'Limassol, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '185.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],

            // ── Hair services ─────────────────────────────────────────────
            [
                'id' => 64, 'vendor_id' => 46, 'category_id' => 18,
                'title' => 'Silk & Shear Bridal Hair',
                'description' => 'Luxury bridal hair styling studio. We specialise in breathtaking updos, romantic braids, silky blowdrys and seamless extensions. Our Limassol studio serves brides across Cyprus with a calm, personalised experience.',
                'location' => 'Limassol, Cyprus',
                'images' => '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&auto=format&q=70","https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&auto=format&q=70"]',
                'minimum_price' => '90.00', 'rating' => '4.85', 'review_count' => 67,
                'is_featured' => 1, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'id' => 65, 'vendor_id' => 47, 'category_id' => 18,
                'title' => 'The hair saloon',
                'description' => 'this is the description',
                'location' => 'Protaras',
                'images' => '[]',
                'minimum_price' => '0.00', 'rating' => '0.00', 'review_count' => 0,
                'is_featured' => 0, 'status' => 'draft', 'created_at' => $now, 'updated_at' => $now,
            ],
        ]);
    }
}
