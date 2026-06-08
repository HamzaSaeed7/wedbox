<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'slug'               => 'planning-your-dream-cyprus-wedding',
                'title'              => 'Planning Your Dream Cyprus Wedding: The Complete Guide',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 8,
                'published_at'       => '2026-03-15 09:00:00',
                'body'               => '<p>Cyprus — the island of Aphrodite — has long been one of Europe\'s most sought-after wedding destinations. With over 300 days of sunshine per year, dramatic clifftop venues, and a warm Mediterranean culture that embraces celebration, it\'s easy to see why couples from across the world choose Cyprus for their big day.</p>
<h2>When to get married in Cyprus</h2>
<p>The shoulder seasons — <strong>April–May</strong> and <strong>September–October</strong> — offer near-perfect wedding weather: warm, bright days with comfortable evenings. July and August are popular but can be extremely hot (often 38°C+), so outdoor ceremonies should be planned for early morning or after sunset. Winter weddings in December and January are beautifully mild compared to Northern Europe, with temperatures around 18–22°C.</p>
<h2>Legal requirements</h2>
<p>For a legally recognised civil ceremony in Cyprus you will need to give at least <strong>15 days\' notice</strong> at the local Municipal Office. You\'ll need your passports, birth certificates, and (if applicable) divorce decrees or death certificates of a former spouse. Many couples choose to have a civil ceremony at home and hold a blessing or symbolic ceremony at their chosen Cyprus venue — this can be the most stress-free option.</p>
<h2>Choosing your venue</h2>
<p>Cyprus offers every style of wedding venue imaginable: beachfront resorts in Ayia Napa and Protaras, ancient monastery courtyards inland, boutique vineyards in the Troodos mountains, and grand estate gardens in Paphos. Your guest count will be the biggest driver — most intimate venues accommodate 20–80 guests, while larger estates handle 300+.</p>
<h2>Budgeting realistically</h2>
<p>A mid-range Cyprus wedding for 80 guests typically costs between <strong>€18,000 and €35,000</strong>, depending on venue choice and food and drink style. Budget around €70–€120 per head for catering, €1,200–€2,500 for photography, and €3,000–€8,000 for a venue hire fee.</p>
<p>WedBox makes budgeting easy — browse, compare, and reserve all your vendors in one place, with transparent pricing upfront.</p>',
            ],
            [
                'slug'               => 'best-wedding-venues-paphos',
                'title'              => 'The 7 Best Wedding Venues in Paphos',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1464366400600-ac2db963f8c0?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 6,
                'published_at'       => '2026-04-02 10:00:00',
                'body'               => '<p>Paphos, a UNESCO World Heritage city on Cyprus\'s southwest coast, offers some of the island\'s most spectacular wedding settings. Here are our top picks for 2026.</p>
<h2>1. Olive Grove Estates</h2>
<p>Sprawling 14-acre grounds with hand-carved limestone arches and three separate event lawns. The ceremony terrace overlooks the sea and seats up to 200. Perfect for couples who want a grand, romantic backdrop without sacrificing intimacy.</p>
<h2>2. Aphrodite Hills Resort</h2>
<p>A luxury five-star resort perched above Aphrodite\'s legendary birthplace. Stunning infinity pool backdrop, award-winning catering, and accommodation on site for all your guests.</p>
<h2>3. Almyra Hotel Gardens</h2>
<p>Sleek, contemporary gardens with direct beach access. The minimalist design makes it perfect for modern couples, and the hotel\'s Michelin-recognised kitchen ensures exceptional food.</p>
<h2>4. Columbia Beach Resort</h2>
<p>Set within the Pissouri Bay, this adults-only boutique resort creates an exclusively yours feeling. The beach ceremony option here is truly breathtaking.</p>
<h2>5. Akamas Eco Retreat</h2>
<p>For nature-loving couples, the Akamas peninsula wilderness offers private outdoor ceremonies surrounded by protected flora and sea views. Smaller capacities (max 60 guests) keep it intimate.</p>
<h2>6. Kings Avenue Mall Rooftop</h2>
<p>A surprisingly stunning urban rooftop venue with panoramic views over Paphos town and the harbour. Contemporary, cool, and unique — perfect for fashion-forward couples.</p>
<h2>7. Annabelle Hotel</h2>
<p>A classic 5-star resort with beautiful tropical gardens. Their dedicated wedding team is among the most experienced on the island, having hosted weddings for over 30 years.</p>',
            ],
            [
                'slug'               => 'cyprus-wedding-catering-guide',
                'title'              => 'A Foodie\'s Guide to Cyprus Wedding Catering',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 5,
                'published_at'       => '2026-04-18 08:30:00',
                'body'               => '<p>Food is at the heart of every Cypriot celebration, and a Cyprus wedding feast is something your guests will remember for years. Here\'s what to expect — and how to make the most of it.</p>
<h2>The traditional mezze experience</h2>
<p>A full Cypriot mezze for a wedding can include up to <strong>30 small dishes</strong> served progressively over two to three hours. Expect fresh hummus and tahini, halloumi grilled over charcoal, loukanika sausage, lamb keftedes, stuffed vine leaves, and more. Mezze creates a wonderfully social, relaxed dining atmosphere.</p>
<h2>Modern wedding menus</h2>
<p>Many couples now opt for a <strong>hybrid approach</strong>: a Cypriot mezze starter followed by a plated main course of their choice. This gives the best of both worlds — cultural flavour combined with the elegance of a formal dining experience.</p>
<h2>Dietary requirements</h2>
<p>The good news: Mediterranean cuisine naturally accommodates most dietary needs. Fish and vegetarian options are abundant, and most caterers now offer dedicated vegan, gluten-free, and halal menus on request. Always confirm these requirements in writing at least four weeks before your wedding date.</p>
<h2>The wedding cake</h2>
<p>The traditional Cypriot wedding cake is a tiered sponge or chocolate cake decorated with fresh flowers, but international-style fondant cakes and naked cakes with fresh fruit are increasingly popular. Many caterers will liaise directly with a local cake designer as part of their package.</p>
<h2>Drinks</h2>
<p>Cyprus has an excellent wine tradition — the Commandaria dessert wine is one of the world\'s oldest named wines. Local varieties Xynisteri (white) and Maratheftiko (red) from the Troodos wineries are superb and add a distinctive local character to your reception drinks.</p>',
            ],
            [
                'slug'               => 'wedding-photography-tips-cyprus',
                'title'              => 'Getting the Best Wedding Photos in Cyprus: Tips from the Pros',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 7,
                'published_at'       => '2026-05-05 09:00:00',
                'body'               => '<p>Cyprus\'s dramatic light, ancient ruins, and crystal-clear waters make it one of the world\'s most photogenic wedding destinations. Here\'s how to make the most of it.</p>
<h2>Timing is everything</h2>
<p>The <strong>golden hour</strong> — the 45 minutes after sunrise and before sunset — produces the most flattering, atmospheric light. If your ceremony is in the evening, plan your couple portraits for the last hour of daylight. Midday light in summer is harsh; avoid outdoor portraits between 11am and 4pm in July and August.</p>
<h2>Choosing your photographer</h2>
<p>Look for photographers whose portfolio already includes Cyprus locations — they\'ll know where the hidden spots are and how to handle the intense Mediterranean light. Ask to see a full wedding gallery (not just highlights) to see how they handle different lighting conditions and candid moments.</p>
<h2>Iconic Cyprus photo locations</h2>
<ul>
<li><strong>Aphrodite\'s Rock (Petra tou Romiou)</strong> — dramatic sea stacks at sunset</li>
<li><strong>Bellapais Abbey, Kyrenia</strong> — Gothic ruins with mountain backdrop</li>
<li><strong>Nissi Beach, Ayia Napa</strong> — turquoise lagoon and white sand</li>
<li><strong>Troodos Mountain villages</strong> — vine-covered stone streets</li>
<li><strong>Larnaca Salt Lake</strong> — flamingos in winter, mirror-like reflections year-round</li>
</ul>
<h2>Drone photography</h2>
<p>Cyprus\'s coastline and mountainous interior look extraordinary from above. Many photographers now offer drone footage as an add-on — worth every cent for a venue with strong aerial views. Check your venue\'s drone policy in advance, as some protected areas require permits.</p>
<h2>The getting-ready shots</h2>
<p>Don\'t underestimate the power of pre-ceremony portraits. The natural light of a hotel room in the morning, the quiet intimacy of the final preparations — these images often become couples\' favourites. Brief your bridesmaids to keep the space tidy and well-lit the morning of your wedding.</p>',
            ],
            [
                'slug'               => 'how-to-choose-wedding-flowers-cyprus',
                'title'              => 'How to Choose Wedding Flowers for a Cyprus Summer',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 5,
                'published_at'       => '2026-05-12 09:00:00',
                'body'               => '<p>Choosing flowers for a Mediterranean summer wedding is both a joy and a challenge. The intense heat, the brilliant light, and the island\'s own extraordinary flora all play a role. Here\'s how to get it right.</p>
<h2>Work with the season, not against it</h2>
<p>Cyprus in May through September is warm to very hot. Delicate blooms like garden roses and sweet peas wilt quickly in high temperatures — especially during a long outdoor ceremony. Your florist\'s first priority should be choosing varieties that hold their shape: <strong>proteas, orchids, anthuriums, tropical foliage, succulents, and dried pampas grass</strong> all perform beautifully in the heat and add striking modern texture.</p>
<h2>Embrace local flora</h2>
<p>Cyprus has spectacular native plants that are rarely used in weddings but look extraordinary in arrangements: wild lavender, cistus (rock rose), myrtle — which is traditionally symbolic of love — and the vibrant bougainvillea that drapes the island\'s stone walls all summer long. Using local flora reduces cost, supports the environment, and gives your floristry an authentic sense of place.</p>
<h2>Colour palettes that work in Mediterranean light</h2>
<p>The intensity of Cyprus light bleaches out very pale pastels in photographs. Florals that photograph beautifully here tend toward richer tones: deep coral, terracotta, dusty rose, saffron yellow, and warm white. If you love the pale, romantic look, ask your photographer to time portraits for golden hour when the light is softer.</p>
<h2>Ceremony vs. reception flowers</h2>
<p>For an outdoor ceremony, focus your budget on the arch or altar structure — it becomes the backdrop for all your ceremony photographs. Reception tables can be dressed more simply with low arrangements of greenery and candles, letting your venue\'s natural beauty carry the space. Repurposing ceremony flowers at the reception is a great way to maximise your floristry budget.</p>
<h2>How much to budget</h2>
<p>A realistic floristry budget for an 80-person Cyprus wedding is <strong>€1,500–€4,000</strong>, depending on the scale of your arch, the number of table arrangements, and your choice of flowers. Book your florist at least six months ahead — the best ones are in high demand during peak season.</p>',
            ],
            [
                'slug'               => 'wedding-music-bands-djs-cyprus',
                'title'              => 'Live Band or DJ? Choosing Wedding Music in Cyprus',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 4,
                'published_at'       => '2026-05-28 10:00:00',
                'body'               => '<p>Music sets the emotional tone of your entire wedding day. From the ceremony processional to the last dance, the right choice of entertainment transforms a good wedding into an unforgettable one. Here\'s how to decide between a live band and a DJ for your Cyprus celebration.</p>
<h2>The case for a live band</h2>
<p>There is simply nothing that matches the energy of a live performance. A talented wedding band reading the room, building atmosphere, and responding to your guests\' energy creates moments you can\'t engineer. In Cyprus, several outstanding bands specialise in weddings — many offer a mix of Cypriot folk music, international classics, and current pop that works brilliantly for mixed-nationality guest lists.</p>
<p>The main considerations: live bands cost more (typically <strong>€2,500–€6,000</strong> for a four-piece), require a larger performance space, and have set set-lists. Always ask to attend a live performance before booking, or request a recent wedding video.</p>
<h2>The case for a DJ</h2>
<p>A skilled wedding DJ offers infinite musical flexibility — every genre, every era, every request. DJ sets also work better in outdoor or acoustically challenging spaces and are more adaptable to timing changes (inevitable at every wedding). Budget: <strong>€800–€1,800</strong> for a professional wedding DJ with full sound and lighting setup.</p>
<p>The key is choosing a DJ with genuine wedding experience, not just club experience. Wedding DJs understand pacing — building energy gradually, reading when guests need a breather, knowing exactly when to drop the big floor-fillers.</p>
<h2>The hybrid option</h2>
<p>Many couples now book a live band for the first two hours of dancing and a DJ for the final hours of the night. The band creates the big showpiece moment; the DJ keeps the energy high as the evening winds on. This is our editorial team\'s favourite option for larger weddings with mixed audiences.</p>
<h2>Ceremony music</h2>
<p>Don\'t overlook your ceremony music. A solo acoustic guitarist or string quartet for the ceremony creates a beautifully different atmosphere to the evening entertainment. Cyprus has exceptional classical musicians available for ceremony hire — many conservatory graduates based in Limassol and Nicosia.</p>',
            ],
            [
                'slug'               => 'hen-stag-party-ideas-cyprus',
                'title'              => 'The Best Hen & Stag Party Ideas in Cyprus for 2026',
                'cover_image_url'    => 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=630&fit=crop&auto=format&q=75',
                'read_time_minutes'  => 5,
                'published_at'       => '2026-06-05 11:00:00',
                'body'               => '<p>Cyprus is Europe\'s undisputed capital of pre-wedding celebrations. Between Ayia Napa\'s legendary nightlife, Paphos\'s beach clubs, and the island\'s adventure activities, there\'s something for every group.</p>
<h2>Hen party ideas</h2>
<h3>Sunset catamaran cruise</h3>
<p>Arguably the most iconic Cyprus hen experience. Sail along the coastline, snorkel in sea caves, and return to port for a spectacular sunset. Catering for the entire group is usually included. Book early — the popular catamaran operators fill up months in advance.</p>
<h3>Spa & wellness retreat</h3>
<p>Cyprus\'s top resorts (Elysian Sands, Almyra, Aphrodite Hills) offer full-day spa packages that can be tailored for groups. Hydrotherapy circuits, couples\' massages, and private pool access make for a wonderfully relaxing pre-wedding day.</p>
<h3>Cocktail masterclass</h3>
<p>Several bars in Limassol and Paphos offer private cocktail-making classes for groups. Two hours of learning (and tasting) behind the bar, followed by dinner — a great combination of activity and socialising.</p>
<h2>Stag party ideas</h2>
<h3>Quad biking & off-road adventures</h3>
<p>The Akamas and Troodos regions offer spectacular off-road quad bike routes. Half-day and full-day packages are available, typically including a BBQ lunch stop in the mountains.</p>
<h3>Boat party</h3>
<p>Hire a private boat for the day — open bar, music, swimming stops, and coastline views. Multiple operators in Ayia Napa and Paphos offer group hire from €40–€80 per person.</p>
<h3>VIP bar crawl</h3>
<p>Ayia Napa\'s famous strip can be done properly with a guided VIP package: queue jumps at the top clubs, free shots at partnered bars, and a private host to keep the group together. Best experienced May–October.</p>',
            ],
        ];

        foreach ($posts as $post) {
            DB::table('blog_posts')->updateOrInsert(
                ['slug' => $post['slug']],
                array_merge($post, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
