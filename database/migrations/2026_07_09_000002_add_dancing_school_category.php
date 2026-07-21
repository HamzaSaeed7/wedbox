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
        if (!DB::table('categories')->where('slug', 'dancing-school')->exists()) {
            $maxOrder = (int) DB::table('categories')->max('order');
            DB::table('categories')->insert([
                'name'        => 'Dancing School',
                'slug'        => 'dancing-school',
                'description' => 'Wedding dance lessons — first dance, parents\' dance and group classes.',
                'order'       => $maxOrder + 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // ── Vendor config (one row per service) ───────────────────────────────
        Schema::create('service_dancing_schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('studio_address')->nullable();   // location of the dancing school
            $table->json('packages')->nullable();           // [{id,name,sessions,price,features[]}]
            $table->json('dance_types')->nullable();         // ["First Dance (Couples)", …]
            $table->json('dance_styles')->nullable();        // ["Waltz", "Tango", …]
            $table->timestamps();
        });

        // ── Customer order detail ─────────────────────────────────────────────
        Schema::create('order_dancing_schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->date('start_date')->nullable();
            $table->string('start_time')->nullable();
            $table->unsignedInteger('people')->nullable();
            $table->json('package')->nullable();             // {id,name,sessions,price}
            $table->string('dance_type')->nullable();
            $table->string('dance_style')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_dancing_schools');
        Schema::dropIfExists('service_dancing_schools');

        DB::table('categories')->where('slug', 'dancing-school')->delete();
    }
};
