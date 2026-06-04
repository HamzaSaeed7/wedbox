<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Venue orders
        Schema::create('order_venues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('no_of_people');
            $table->timestamps();
        });

        // Catering orders
        Schema::create('order_caterings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('adults')->default(0);
            $table->integer('kids')->default(0);
            $table->timestamps();
        });

        Schema::create('order_catering_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_catering_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cuisine_id')->nullable();
            $table->foreignId('menu_id')->nullable();
            $table->foreignId('item_id')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Florist orders
        Schema::create('order_florists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['fresh', 'fake']);
            $table->foreignId('package_id')->nullable();
            $table->json('selected_colors')->nullable();
            $table->json('selected_designs')->nullable();
            $table->json('selected_addons')->nullable();
            $table->string('inspiration_image_url')->nullable();
            $table->decimal('fake_price', 10, 2)->default(0);
            $table->decimal('real_price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Car hire orders
        Schema::create('order_car_hires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hire_hour_id')->nullable();
            $table->string('pickup_location')->nullable();
            $table->string('pickup_time')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->string('dropoff_time')->nullable();
            $table->json('selected_addons')->nullable();
            $table->timestamps();
        });

        // Photography orders
        Schema::create('order_photography', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->nullable();
            $table->json('selected_addons')->nullable();
            $table->timestamps();
        });

        // Music orders
        Schema::create('order_music', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('hours');
            $table->string('entrance_song')->nullable();
            $table->string('first_dance_song')->nullable();
            $table->string('cutting_cake_song')->nullable();
            $table->text('songs_list')->nullable();
            $table->text('further_details')->nullable();
            $table->timestamps();
        });

        // Bride dress orders
        Schema::create('order_bride_dresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['rent', 'buy']);
            $table->json('sizes')->nullable();
            $table->json('extras')->nullable();
            $table->dateTime('fitting_1')->nullable();
            $table->dateTime('fitting_2')->nullable();
            $table->timestamps();
        });

        // Groom suite orders
        Schema::create('order_groom_suites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['rent', 'buy']);
            $table->string('jacket_size')->nullable();
            $table->string('vest_size')->nullable();
            $table->string('shirt_size')->nullable();
            $table->string('bottom_size')->nullable();
            $table->dateTime('fitting_1')->nullable();
            $table->dateTime('fitting_2')->nullable();
            $table->timestamps();
        });

        // Best man suit orders (identical to groom suites)
        Schema::create('order_best_man_suits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['rent', 'buy']);
            $table->string('jacket_size')->nullable();
            $table->string('vest_size')->nullable();
            $table->string('shirt_size')->nullable();
            $table->string('bottom_size')->nullable();
            $table->dateTime('fitting_1')->nullable();
            $table->dateTime('fitting_2')->nullable();
            $table->timestamps();
        });

        // Bridesmaid dress orders
        Schema::create('order_bridesmaids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->json('sizes')->nullable();
            $table->timestamps();
        });

        // Flower girl dress orders
        Schema::create('order_flower_girls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('dress_size');
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });

        // Yacht hire orders
        Schema::create('order_yacht_hires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hire_hour_id')->nullable();
            $table->timestamps();
        });

        // Bachelor orders
        Schema::create('order_bachelors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('num_boys');
            $table->integer('hours');
            $table->json('includes')->nullable();
            $table->decimal('includes_price', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Bachelorette orders
        Schema::create('order_bachelorettes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('num_girls');
            $table->integer('hours');
            $table->json('includes')->nullable();
            $table->decimal('includes_price', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Hotel orders
        Schema::create('order_hotels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable();
            $table->string('room_type');
            $table->date('arrival_date');
            $table->date('departure_date');
            $table->json('facilities')->nullable();
            $table->timestamps();
        });

        // Bar orders
        Schema::create('order_bars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('people');
            $table->integer('hours');
            $table->foreignId('city_id')->nullable();
            $table->string('address')->nullable();
            $table->json('selected_menus')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Makeup orders
        Schema::create('order_makeups', function (Blueprint $table) {
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
        Schema::dropIfExists('order_makeups');
        Schema::dropIfExists('order_bars');
        Schema::dropIfExists('order_hotels');
        Schema::dropIfExists('order_bachelorettes');
        Schema::dropIfExists('order_bachelors');
        Schema::dropIfExists('order_yacht_hires');
        Schema::dropIfExists('order_flower_girls');
        Schema::dropIfExists('order_bridesmaids');
        Schema::dropIfExists('order_best_man_suits');
        Schema::dropIfExists('order_groom_suites');
        Schema::dropIfExists('order_bride_dresses');
        Schema::dropIfExists('order_music');
        Schema::dropIfExists('order_photography');
        Schema::dropIfExists('order_car_hires');
        Schema::dropIfExists('order_florists');
        Schema::dropIfExists('order_catering_items');
        Schema::dropIfExists('order_caterings');
        Schema::dropIfExists('order_venues');
    }
};
