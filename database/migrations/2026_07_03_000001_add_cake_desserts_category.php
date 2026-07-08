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
        if (!DB::table('categories')->where('slug', 'cake-desserts')->exists()) {
            $maxOrder = (int) DB::table('categories')->max('order');
            DB::table('categories')->insert([
                'name'        => 'Cake & Desserts',
                'slug'        => 'cake-desserts',
                'description' => 'Wedding cakes, individual desserts and tasting boxes.',
                'order'       => $maxOrder + 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // ── Vendor config (one row per service) ───────────────────────────────
        Schema::create('service_cake_desserts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('flavors')->nullable();               // ["Vanilla", "Chocolate", …]
            $table->unsignedInteger('max_layers')->default(5);
            $table->decimal('cake_base_price', 10, 2)->default(0);   // covers the first layer
            $table->decimal('cake_layer_price', 10, 2)->default(0);  // per additional layer
            $table->json('desserts')->nullable();              // [{id,name,price,image}]
            $table->json('addons')->nullable();                // [{id,name,price}]
            $table->json('tasting_boxes')->nullable();         // [{id,name,price}]
            $table->timestamps();
        });

        // ── Customer order detail ─────────────────────────────────────────────
        Schema::create('order_cake_desserts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('people')->nullable();
            $table->date('event_date')->nullable();
            $table->string('location')->nullable();
            $table->string('event_time')->nullable();
            $table->string('cake_flavor')->nullable();
            $table->unsignedInteger('cake_layers')->nullable();
            $table->unsignedInteger('cake_quantity')->default(1);
            $table->string('inspo_image_url')->nullable();
            $table->json('selected_desserts')->nullable();     // [{id,name,price,qty}]
            $table->json('selected_addons')->nullable();       // [{id,name,price,qty}]
            $table->json('tasting_box')->nullable();           // {id,name,price} | null
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_cake_desserts');
        Schema::dropIfExists('service_cake_desserts');

        DB::table('categories')->where('slug', 'cake-desserts')->delete();
    }
};
