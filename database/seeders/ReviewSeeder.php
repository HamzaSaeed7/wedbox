<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds realistic reviews for services from the showcase vendor and extra vendors.
 * Each service gets 3-6 reviews from different customer accounts.
 * Also recalculates rating and review_count on the service rows.
 */
class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Gather all customers (exclude vendors and admin)
        $customers = User::where('role', 'customer')
            ->pluck('id')
            ->toArray();

        if (empty($customers)) return;

        $services = Service::with('category')->where('status', 'active')->get();

        $reviewBank = [
            5 => [
                "Absolutely flawless from start to finish. Our guests are still talking about it!",
                "Exceeded every expectation. Professional, warm, and genuinely talented.",
                "Worth every cent. The attention to detail was extraordinary.",
                "Best decision we made for our wedding. Highly recommend to every couple.",
                "Completely transformed our day into something magical. Thank you!",
                "Nothing short of perfect. The whole team was wonderful to work with.",
                "Stunning results. We cried happy tears when we saw everything come together.",
            ],
            4 => [
                "Really lovely service — a couple of minor hiccups but overall fantastic.",
                "Great quality and very professional. Responded quickly to all our requests.",
                "We were very happy with the outcome. Would use again without hesitation.",
                "Fantastic value for money. The team went the extra mile on the day.",
                "Very impressed overall. A few small things could be improved but nothing major.",
            ],
            3 => [
                "Good service but communication could have been a bit smoother.",
                "Nice result in the end but the process felt slightly disorganised at times.",
                "Decent quality for the price. Would recommend with the caveat to follow up regularly.",
            ],
        ];

        foreach ($services as $service) {
            // Skip if already has reviews seeded
            if (DB::table('reviews')->where('service_id', $service->id)->exists()) continue;

            // Distribute 3-6 reviews per service
            $count = rand(3, 6);
            $usedCustomers = collect($customers)->shuffle()->take($count)->values();

            $totalRating = 0;
            foreach ($usedCustomers as $i => $userId) {
                // Weight heavily towards 4-5 stars
                $ratingWeight = [5 => 60, 4 => 30, 3 => 10];
                $rand = rand(1, 100);
                if ($rand <= 60)      $rating = 5;
                elseif ($rand <= 90)  $rating = 4;
                else                  $rating = 3;

                $comments = $reviewBank[$rating];
                $comment  = $comments[array_rand($comments)];

                DB::table('reviews')->insert([
                    'service_id' => $service->id,
                    'user_id'    => $userId,
                    'rating'     => $rating,
                    'comment'    => $comment,
                    'created_at' => now()->subDays(rand(1, 365)),
                    'updated_at' => now(),
                ]);

                $totalRating += $rating;
            }

            // Recalculate aggregate rating on the service
            $avgRating    = round($totalRating / $count, 2);
            $reviewCount  = DB::table('reviews')->where('service_id', $service->id)->count();

            DB::table('services')->where('id', $service->id)->update([
                'rating'       => $avgRating,
                'review_count' => $reviewCount,
                'updated_at'   => now(),
            ]);
        }
    }
}
