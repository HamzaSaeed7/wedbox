<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('service_hairs')) {
            Schema::create('service_hairs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('service_id')->constrained()->cascadeOnDelete();
                $table->string('pricing_mode', 20)->default('regular');
                $table->json('packages')->nullable();
                $table->decimal('price_bridal', 10, 2)->nullable();
                $table->decimal('price_after_wedding', 10, 2)->nullable();
                $table->decimal('price_party', 10, 2)->nullable();
                $table->decimal('price_trial_1', 10, 2)->nullable();
                $table->decimal('price_trial_2', 10, 2)->nullable();
                $table->date('available_date_trial_1')->nullable();
                $table->date('available_date_trial_2')->nullable();
                $table->timestamps();
            });
        }

        // order_hair may already exist with legacy columns; rebuild it to match order_makeups
        Schema::dropIfExists('order_hair');
        Schema::create('order_hair', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->dateTime('date_bridal')->nullable();
            $table->dateTime('date_after_wedding')->nullable();
            $table->dateTime('date_party')->nullable();
            $table->dateTime('date_trial_1')->nullable();
            $table->dateTime('date_trial_2')->nullable();
            $table->decimal('price_bridal', 10, 2)->default(0);
            $table->decimal('price_after_wedding', 10, 2)->default(0);
            $table->decimal('price_party', 10, 2)->default(0);
            $table->decimal('price_trial_1', 10, 2)->default(0);
            $table->decimal('price_trial_2', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_hair');
        Schema::dropIfExists('service_hairs');
    }
};
