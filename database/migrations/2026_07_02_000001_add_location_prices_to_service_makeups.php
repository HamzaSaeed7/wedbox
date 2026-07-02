<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_makeups', function (Blueprint $table) {
            // Per-city travel fee the vendor charges, e.g. {"Nicosia": 100, "Limassol": 50}.
            // Cities not listed default to free; in-studio is always free.
            $table->json('location_prices')->nullable()->after('packages');
        });
    }

    public function down(): void
    {
        Schema::table('service_makeups', function (Blueprint $table) {
            $table->dropColumn('location_prices');
        });
    }
};
