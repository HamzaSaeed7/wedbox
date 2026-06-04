<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds test orders and favourites for the main test customer (test@wedbox.com)
 * and a selection of the extra customers.
 */
class OrderAndFavoriteSeeder extends Seeder
{
    public function run(): void
    {
        $customer  = User::where('email', 'test@wedbox.com')->first();
        $customers = User::where('role', 'customer')->get();
        $vendors   = User::where('role', 'vendor')->get();

        $services = DB::table('services')
            ->join('categories', 'categories.id', '=', 'services.category_id')
            ->where('services.status', 'active')
            ->select('services.*', 'categories.slug as cat_slug')
            ->get();

        if ($services->isEmpty() || !$customer) return;

        // ── Favourites for the test customer ─────────────────────────────────
        $favServiceIds = $services->take(6)->pluck('id');
        foreach ($favServiceIds as $svcId) {
            DB::table('favorites')->updateOrInsert(
                ['user_id' => $customer->id, 'service_id' => $svcId],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // ── Favourites for a couple of extra customers ────────────────────────
        foreach ($customers->take(4) as $cust) {
            $pick = $services->shuffle()->take(rand(2, 5));
            foreach ($pick as $svc) {
                DB::table('favorites')->updateOrInsert(
                    ['user_id' => $cust->id, 'service_id' => $svc->id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        // ── Orders for the test customer ─────────────────────────────────────
        $ordersData = [
            [
                'service_slug' => 'photography',
                'status'       => 'approved',
                'price'        => 2400.00,
                'deliver_date' => '2026-09-14',
                'note'         => 'Please capture our first dance — very important to us.',
                'order_type'   => 'photography',
            ],
            [
                'service_slug' => 'venue',
                'status'       => 'pending',
                'price'        => 7650.00,
                'deliver_date' => '2026-09-14',
                'note'         => '90 guests. We\'d like the east lawn for the ceremony.',
                'order_type'   => 'venue',
            ],
            [
                'service_slug' => 'catering',
                'status'       => 'in_cart',
                'price'        => 5850.00,
                'deliver_date' => '2026-09-14',
                'note'         => 'Mediterranean & European mix. 4 vegan guests, 2 gluten-free.',
                'order_type'   => 'catering',
            ],
            [
                'service_slug' => 'florist',
                'status'       => 'completed',
                'price'        => 1500.00,
                'deliver_date' => '2025-11-22',
                'note'         => 'Fresh Luxe package in ivory and pale pink.',
                'order_type'   => 'florist',
            ],
            [
                'service_slug' => 'music',
                'status'       => 'rejected',
                'price'        => 720.00,
                'deliver_date' => '2025-11-22',
                'note'         => '4-hour evening set.',
                'order_type'   => 'music',
            ],
        ];

        foreach ($ordersData as $od) {
            $svc = $services->firstWhere('cat_slug', $od['service_slug']);
            if (!$svc) continue;

            // Check if this test customer already has an order for this service+status
            $exists = DB::table('orders')
                ->where('user_id', $customer->id)
                ->where('service_id', $svc->id)
                ->where('status', $od['status'])
                ->exists();

            if (!$exists) {
                DB::table('orders')->insert([
                    'user_id'      => $customer->id,
                    'service_id'   => $svc->id,
                    'vendor_id'    => $svc->vendor_id,
                    'price'        => $od['price'],
                    'deliver_date' => $od['deliver_date'],
                    'note'         => $od['note'],
                    'status'       => $od['status'],
                    'order_type'   => $od['order_type'],
                    'created_at'   => now()->subDays(rand(5, 90)),
                    'updated_at'   => now(),
                ]);
            }
        }

        // ── Scatter some orders across extra customers ────────────────────────
        foreach ($customers->shuffle()->take(5) as $cust) {
            $picks = $services->shuffle()->take(rand(1, 3));
            foreach ($picks as $svc) {
                $exists = DB::table('orders')
                    ->where('user_id', $cust->id)
                    ->where('service_id', $svc->id)
                    ->exists();
                if (!$exists) {
                    $statuses = ['pending', 'approved', 'completed'];
                    DB::table('orders')->insert([
                        'user_id'      => $cust->id,
                        'service_id'   => $svc->id,
                        'vendor_id'    => $svc->vendor_id,
                        'price'        => $svc->minimum_price,
                        'deliver_date' => now()->addMonths(rand(2, 14))->format('Y-m-d'),
                        'note'         => null,
                        'status'       => $statuses[array_rand($statuses)],
                        'order_type'   => $svc->cat_slug,
                        'created_at'   => now()->subDays(rand(1, 120)),
                        'updated_at'   => now(),
                    ]);
                }
            }
        }
    }
}
