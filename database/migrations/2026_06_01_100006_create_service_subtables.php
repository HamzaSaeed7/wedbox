<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Venues
        Schema::create('service_venues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->integer('min_people');
            $table->integer('max_people');
            $table->decimal('price_per_person', 10, 2);
            $table->decimal('min_cost', 10, 2)->default(0);
            $table->string('location')->nullable();
            $table->timestamps();
        });

        // Catering
        Schema::create('service_caterings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('service_catering_cuisines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_catering_id')->constrained()->cascadeOnDelete();
            $table->string('cuisine_name');
            $table->timestamps();
        });

        Schema::create('service_catering_menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cuisine_id')->references('id')->on('service_catering_cuisines')->cascadeOnDelete();
            $table->string('name');
            $table->integer('max_choices')->default(1);
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('service_catering_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->references('id')->on('service_catering_menus')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // Florists
        Schema::create('service_florists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('fresh_flower_price', 10, 2)->default(0);
            $table->decimal('fake_flower_price', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('service_florist_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_florist_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->enum('type', ['fresh', 'fake']);
            $table->json('features')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
        });

        Schema::create('service_florist_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_florist_id')->constrained()->cascadeOnDelete();
            $table->string('hex_color');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('service_florist_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_florist_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->json('images')->nullable();
            $table->timestamps();
        });

        Schema::create('service_florist_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_florist_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price_per_unit', 10, 2);
            $table->string('unit')->default('piece');
            $table->timestamps();
        });

        // Car Hire
        Schema::create('service_car_hires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->json('addon_options')->nullable();
            $table->timestamps();
        });

        Schema::create('service_car_hire_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_car_hire_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        Schema::create('service_car_hire_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_car_hire_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        // Photography
        Schema::create('service_photography', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('service_photography_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_photography_id')->constrained('service_photography')->cascadeOnDelete();
            $table->string('package_name');
            $table->decimal('price', 10, 2);
            $table->json('includes')->nullable();
            $table->timestamps();
        });

        Schema::create('service_photography_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->references('id')->on('service_photography_packages')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        // Music
        Schema::create('service_music', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_per_hour', 10, 2);
            $table->string('video_url')->nullable();
            $table->timestamps();
        });

        // Bride Dresses
        Schema::create('service_bride_dresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_rent', 10, 2);
            $table->decimal('price_buy', 10, 2);
            $table->json('available_sizes')->nullable();
            $table->timestamps();
        });

        Schema::create('service_bride_dress_extras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_bride_dress_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        // Groom Suites
        Schema::create('service_groom_suites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_rent', 10, 2);
            $table->decimal('price_buy', 10, 2);
            $table->json('jacket_sizes')->nullable();
            $table->json('vest_sizes')->nullable();
            $table->json('shirt_sizes')->nullable();
            $table->json('bottom_sizes')->nullable();
            $table->timestamps();
        });

        // Best Man Suits (identical structure to groom suites)
        Schema::create('service_best_man_suits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_rent', 10, 2);
            $table->decimal('price_buy', 10, 2);
            $table->json('jacket_sizes')->nullable();
            $table->json('vest_sizes')->nullable();
            $table->json('shirt_sizes')->nullable();
            $table->json('bottom_sizes')->nullable();
            $table->timestamps();
        });

        // Bridesmaids Dresses
        Schema::create('service_bridesmaids_dresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->json('available_sizes')->nullable();
            $table->timestamps();
        });

        // Flower Girl Dresses
        Schema::create('service_flower_girl_dresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->json('age_groups')->nullable();
            $table->timestamps();
        });

        // Yacht Hire
        Schema::create('service_yacht_hires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->integer('min_people');
            $table->integer('max_people');
            $table->string('speed')->nullable();
            $table->string('length')->nullable();
            $table->integer('cabin_crew')->nullable();
            $table->integer('washroom')->nullable();
            $table->integer('shower')->nullable();
            $table->boolean('chef_included')->default(false);
            $table->timestamps();
        });

        Schema::create('service_yacht_hire_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_yacht_hire_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        // Bachelors
        Schema::create('service_bachelors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_per_hour', 10, 2);
            $table->decimal('price_per_person', 10, 2);
            $table->decimal('catamaran_price', 10, 2)->nullable();
            $table->decimal('excursion_price', 10, 2)->nullable();
            $table->decimal('bar_crawl_price', 10, 2)->nullable();
            $table->decimal('night_out_price', 10, 2)->nullable();
            $table->timestamps();
        });

        // Bachelorettes
        Schema::create('service_bachelorettes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_per_hour', 10, 2);
            $table->decimal('price_per_person', 10, 2);
            $table->decimal('catamaran_price', 10, 2)->nullable();
            $table->decimal('excursion_price', 10, 2)->nullable();
            $table->decimal('bar_crawl_price', 10, 2)->nullable();
            $table->decimal('night_out_price', 10, 2)->nullable();
            $table->decimal('spa_day_price', 10, 2)->nullable();
            $table->timestamps();
        });

        // Accommodations
        Schema::create('service_accommodations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('location')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
        });

        Schema::create('service_accommodation_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->references('id')->on('service_accommodations')->cascadeOnDelete();
            $table->string('room_type');
            $table->decimal('price_per_night', 10, 2);
            $table->integer('max_adults');
            $table->integer('max_kids');
            $table->json('images')->nullable();
            $table->timestamps();
        });

        Schema::create('service_accommodation_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->references('id')->on('service_accommodations')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // Bars
        Schema::create('service_bars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('service_bar_menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_bar_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        Schema::create('service_bar_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->references('id')->on('service_bar_menus')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // Makeups
        Schema::create('service_makeups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
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

    public function down(): void
    {
        Schema::dropIfExists('service_makeups');
        Schema::dropIfExists('service_bar_menu_items');
        Schema::dropIfExists('service_bar_menus');
        Schema::dropIfExists('service_bars');
        Schema::dropIfExists('service_accommodation_facilities');
        Schema::dropIfExists('service_accommodation_rooms');
        Schema::dropIfExists('service_accommodations');
        Schema::dropIfExists('service_bachelorettes');
        Schema::dropIfExists('service_bachelors');
        Schema::dropIfExists('service_yacht_hire_hours');
        Schema::dropIfExists('service_yacht_hires');
        Schema::dropIfExists('service_flower_girl_dresses');
        Schema::dropIfExists('service_bridesmaids_dresses');
        Schema::dropIfExists('service_best_man_suits');
        Schema::dropIfExists('service_groom_suites');
        Schema::dropIfExists('service_bride_dress_extras');
        Schema::dropIfExists('service_bride_dresses');
        Schema::dropIfExists('service_music');
        Schema::dropIfExists('service_photography_addons');
        Schema::dropIfExists('service_photography_packages');
        Schema::dropIfExists('service_photography');
        Schema::dropIfExists('service_car_hire_addons');
        Schema::dropIfExists('service_car_hire_hours');
        Schema::dropIfExists('service_car_hires');
        Schema::dropIfExists('service_florist_addons');
        Schema::dropIfExists('service_florist_designs');
        Schema::dropIfExists('service_florist_colors');
        Schema::dropIfExists('service_florist_packages');
        Schema::dropIfExists('service_florists');
        Schema::dropIfExists('service_catering_items');
        Schema::dropIfExists('service_catering_menus');
        Schema::dropIfExists('service_catering_cuisines');
        Schema::dropIfExists('service_caterings');
        Schema::dropIfExists('service_venues');
    }
};
