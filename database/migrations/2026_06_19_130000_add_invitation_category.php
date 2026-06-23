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
        if (!DB::table('categories')->where('slug', 'invitation')->exists()) {
            $maxOrder = (int) DB::table('categories')->max('order');
            DB::table('categories')->insert([
                'name'        => 'Invitation',
                'slug'        => 'invitation',
                'description' => 'Wedding invitations and stationery.',
                'order'       => $maxOrder + 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // ── Parent row (one per service) ──────────────────────────────────────
        Schema::create('service_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        // ── Types the vendor offers (Digital / Printed / Save the Date) ────────
        Schema::create('service_invitation_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_invitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // ── Design templates, each with its own per-invitation price ──────────
        Schema::create('service_invitation_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_invitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('image')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // ── Add-ons (Envelope, Wax seal, …) ───────────────────────────────────
        Schema::create('service_invitation_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_invitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        // ── Customer order detail ─────────────────────────────────────────────
        Schema::create('order_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->date('needed_by')->nullable();
            $table->json('selected_types')->nullable();
            $table->unsignedBigInteger('design_id')->nullable();
            $table->json('selected_addons')->nullable();
            $table->text('invitation_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_invitations');
        Schema::dropIfExists('service_invitation_addons');
        Schema::dropIfExists('service_invitation_designs');
        Schema::dropIfExists('service_invitation_types');
        Schema::dropIfExists('service_invitations');

        DB::table('categories')->where('slug', 'invitation')->delete();
    }
};
