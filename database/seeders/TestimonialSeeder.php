<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'user_name' => 'Sofia & Andreas',
                'location'  => 'Limassol, Cyprus',
                'text'      => 'WedBox made planning our dream wedding so easy! We found our venue, caterer and photographer all in one place. Everything was perfect on the day.',
                'photo_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format&q=70',
            ],
            [
                'user_name' => 'Emma & James',
                'location'  => 'Paphos, Cyprus',
                'text'      => 'As a couple planning from abroad, WedBox was a lifesaver. The vendor profiles are detailed and the booking process is so transparent. Highly recommend!',
                'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format&q=70',
            ],
            [
                'user_name' => 'Maria & Nikos',
                'location'  => 'Ayia Napa, Cyprus',
                'text'      => 'From the flowers to the music quartet, every vendor we found through WedBox delivered beyond expectations. Our wedding was truly unforgettable.',
                'photo_url' => 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format&q=70',
            ],
            [
                'user_name' => 'Chloe & Dimitris',
                'location'  => 'Nicosia, Cyprus',
                'text'      => 'The cart feature is genius — we locked in all our vendors with one checkout and never worried about double-bookings. Simple, secure and stress-free.',
                'photo_url' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format&q=70',
            ],
            [
                'user_name' => 'Rachel & George',
                'location'  => 'Larnaca, Cyprus',
                'text'      => 'WedBox saved us thousands compared to using a traditional wedding planner. The platform is beautiful and the vendors are genuinely top quality.',
                'photo_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format&q=70',
            ],
            [
                'user_name' => 'Yiota & Michael',
                'location'  => 'Protaras, Cyprus',
                'text'      => 'We booked our yacht ceremony through WedBox and it was the most magical experience of our lives. The team was professional from start to finish.',
                'photo_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format&q=70',
            ],
        ];

        foreach ($testimonials as $t) {
            DB::table('testimonials')->updateOrInsert(
                ['user_name' => $t['user_name']],
                array_merge($t, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
