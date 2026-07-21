<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Category row (idempotent) ─────────────────────────────────────────
        if (!DB::table('categories')->where('slug', 'nail-salon')->exists()) {
            $maxOrder = (int) DB::table('categories')->max('order');
            DB::table('categories')->insert([
                'name'        => 'Nail Salon',
                'slug'        => 'nail-salon',
                'description' => 'Bridal nails, manicures, pedicures and nail art — in-salon or mobile.',
                'order'       => $maxOrder + 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // ── Vendor config (one row per service) ───────────────────────────────
        Schema::create('service_nail_salons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('bridal_package_price', 10, 2)->default(0); // mani + pedi package
            $table->decimal('trial_price', 10, 2)->default(0);          // trial session
            $table->unsignedInteger('max_group_size')->nullable();      // max clients at once (note)
            $table->json('nail_styles')->nullable();                    // ["Gel", "Acrylic", …]
            $table->json('location_prices')->nullable();                // { "Nicosia": 30, … } mobile fee
            $table->json('addons')->nullable();                         // [{id,name,price}]
            $table->timestamps();
        });

        // ── Customer order detail ─────────────────────────────────────────────
        Schema::create('order_nail_salons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('people')->nullable();
            $table->date('event_date')->nullable();
            $table->string('event_time')->nullable();
            $table->string('location')->nullable();          // 'studio' or a city name
            $table->decimal('location_fee', 10, 2)->default(0);
            $table->string('nail_style')->nullable();
            $table->boolean('bridal_package')->default(false);
            $table->boolean('trial')->default(false);
            $table->json('selected_addons')->nullable();     // [{id,name,price,qty}]
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_nail_salons');
        Schema::dropIfExists('service_nail_salons');

        DB::table('categories')->where('slug', 'nail-salon')->delete();
    }
};
