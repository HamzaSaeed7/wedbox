<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->json('images')->nullable();
            $table->decimal('minimum_price', 10, 2)->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
            $table->timestamps();
            $table->index(['category_id', 'location', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
