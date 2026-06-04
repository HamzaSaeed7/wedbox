<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds realistic message threads between customers and vendors.
 * Creates 3 conversations with back-and-forth message exchanges.
 */
class ConversationSeeder extends Seeder
{
    public function run(): void
    {
        $customer  = User::where('email', 'test@wedbox.com')->first();
        $vendor    = User::where('email', 'vendor@wedbox.com')->first();
        $customer2 = User::where('email', 'emma.wilson@example.com')->first();
        $vendor2   = User::where('email', 'aphrodite@wedbox.com')->first();
        $customer3 = User::where('email', 'olivia.harris@example.com')->first();
        $vendor3   = User::where('email', 'islandlens@wedbox.com')->first();

        $photoService = DB::table('services')
            ->join('categories', 'categories.id', '=', 'services.category_id')
            ->where('categories.slug', 'photography')
            ->where('services.vendor_id', $vendor->id)
            ->value('services.id');

        $venueService = DB::table('services')
            ->join('categories', 'categories.id', '=', 'services.category_id')
            ->where('categories.slug', 'venue')
            ->where('services.vendor_id', $vendor2 ? $vendor2->id : $vendor->id)
            ->value('services.id');

        $photoService2 = DB::table('services')
            ->join('categories', 'categories.id', '=', 'services.category_id')
            ->where('categories.slug', 'photography')
            ->where('services.vendor_id', $vendor3 ? $vendor3->id : $vendor->id)
            ->value('services.id');

        $conversations = [
            // ── Convo 1: Test customer ↔ main showcase vendor (Photography) ──
            [
                'customer' => $customer,
                'vendor'   => $vendor,
                'service'  => $photoService,
                'messages' => [
                    ['sender' => 'customer', 'body' => "Hi! We've seen your portfolio and absolutely love your style. We're getting married on 14th September 2026 at the Olive Grove Estate in Paphos — are you available?", 'days_ago' => 12],
                    ['sender' => 'vendor',   'body' => "Hello! Congratulations on your engagement! 😊 I'd love to be part of your day. Let me check my calendar... Yes, 14th September 2026 is available for me. What package were you thinking about?", 'days_ago' => 11],
                    ['sender' => 'customer', 'body' => "Wonderful! We were looking at the Gold package — ceremony + reception, the video highlight reel especially. Could we also add drone footage? The venue has incredible sea views.", 'days_ago' => 11],
                    ['sender' => 'vendor',   'body' => "Great choice! The Olive Grove Estate is stunning from the air. Drone footage would be €350 on top of the Gold package, so €2,750 total. I can also offer a pre-wedding engagement shoot (1h around the Paphos coastline) for €200 — really helps us get comfortable together before the big day. Interested?", 'days_ago' => 10],
                    ['sender' => 'customer', 'body' => "Yes to the engagement shoot! That sounds perfect. How do we go about securing the booking?", 'days_ago' => 10],
                    ['sender' => 'vendor',   'body' => "I'll send you a formal quote and contract via email. To secure the date I just need a 25% deposit (€737.50). The rest is due 30 days before the wedding. Does that work for you?", 'days_ago' => 9],
                    ['sender' => 'customer', 'body' => "That works perfectly. We're going to book through WedBox now. So excited! ✨", 'days_ago' => 9],
                    ['sender' => 'vendor',   'body' => "Fantastic! I'll keep 14th September blocked for you. Can't wait to capture your day — Paphos at golden hour is absolutely magical. See you at the engagement shoot! 📸", 'days_ago' => 8],
                ],
            ],
            // ── Convo 2: Emma ↔ Aphrodite Events (Venue) ──────────────────────
            [
                'customer' => $customer2,
                'vendor'   => $vendor2 ?? $vendor,
                'service'  => $venueService,
                'messages' => [
                    ['sender' => 'customer', 'body' => "Good morning! We're planning a waterfront wedding for 75 guests in Larnaca. Is the Sunset Terrace available on 5th July 2026?", 'days_ago' => 20],
                    ['sender' => 'vendor',   'body' => "Good morning! Thank you for reaching out. July 5th is currently available ✅. For 75 guests we'd recommend our main terrace — it seats up to 100 with sea views from every table. Shall I send you our full pricing brochure?", 'days_ago' => 19],
                    ['sender' => 'customer', 'body' => "Yes please! Also, do you have accommodation on site for the bridal party?", 'days_ago' => 19],
                    ['sender' => 'vendor',   'body' => "We don't have accommodation on site but we have a preferred rate partnership with the Radisson Blu Larnaca, just 5 minutes away — they offer a 20% group discount for wedding parties. I've included their contact in the brochure. I'll send the full info now!", 'days_ago' => 18],
                ],
            ],
            // ── Convo 3: Olivia ↔ Island Lens (Photography) ──────────────────
            [
                'customer' => $customer3,
                'vendor'   => $vendor3 ?? $vendor,
                'service'  => $photoService2,
                'messages' => [
                    ['sender' => 'customer', 'body' => "Hello! I came across your Instagram and I'm completely obsessed with your work 😍. We're having a small intimate wedding (30 guests) in Paphos, late October 2026. Are you free?", 'days_ago' => 6],
                    ['sender' => 'vendor',   'body' => "Hi Olivia! Thank you so much — that really means a lot! October is one of my favourite months to shoot in Cyprus — the light is magical. I have late October available, yes. Tell me more about your vision for the day!", 'days_ago' => 5],
                    ['sender' => 'customer', 'body' => "We want something very natural, unposed — just real moments. We love the idea of a clifftop ceremony overlooking the sea. No formal portraits, just you following us around and capturing the story 💛", 'days_ago' => 5],
                    ['sender' => 'vendor',   'body' => "That is literally my favourite style to shoot — I call it 'documentary love'. The Complete package would be perfect for you: full day, 800+ images, and a short highlight film. I also know a stunning secret clifftop spot near Coral Bay that almost no one knows about. Interested?", 'days_ago' => 4],
                    ['sender' => 'customer', 'body' => "YES. This sounds absolutely perfect. Let's go with the Complete package. How do I confirm?", 'days_ago' => 4],
                ],
            ],
        ];

        foreach ($conversations as $conv) {
            if (!$conv['customer'] || !$conv['vendor']) continue;

            // Check if conversation already exists
            $exists = DB::table('conversations')
                ->where('customer_id', $conv['customer']->id)
                ->where('vendor_id', $conv['vendor']->id)
                ->exists();

            if ($exists) continue;

            $lastMsg = collect($conv['messages'])->last();
            $lastMsgAt = now()->subDays($lastMsg['days_ago'] ?? 1);

            $convId = DB::table('conversations')->insertGetId([
                'customer_id'      => $conv['customer']->id,
                'vendor_id'        => $conv['vendor']->id,
                'service_id'       => $conv['service'] ?? null,
                'last_message_at'  => $lastMsgAt,
                'created_at'       => now()->subDays(max(array_column($conv['messages'], 'days_ago'))),
                'updated_at'       => $lastMsgAt,
            ]);

            foreach ($conv['messages'] as $msg) {
                $senderId = $msg['sender'] === 'customer' ? $conv['customer']->id : $conv['vendor']->id;
                $sentAt   = now()->subDays($msg['days_ago']);
                DB::table('messages')->insert([
                    'conversation_id' => $convId,
                    'sender_id'       => $senderId,
                    'body'            => $msg['body'],
                    'read_at'         => $msg['sender'] === 'customer' ? $sentAt : null,
                    'created_at'      => $sentAt,
                    'updated_at'      => $sentAt,
                ]);
            }
        }
    }
}
