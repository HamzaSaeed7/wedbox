<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('users');
            $table->decimal('price', 10, 2)->default(0);
            $table->date('deliver_date')->nullable();
            $table->text('note')->nullable();
            $table->enum('status', ['in_cart', 'pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('in_cart');
            $table->string('stripe_session_id')->nullable();
            $table->string('order_type');
            $table->timestamps();
            $table->index(['user_id', 'status']);
            $table->index(['vendor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
