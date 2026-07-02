<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_makeups', function (Blueprint $table) {
            // Optional extras the customer can add, e.g. [{"id","name","price"}].
            $table->json('addons')->nullable()->after('location_prices');
        });
    }

    public function down(): void
    {
        Schema::table('service_makeups', function (Blueprint $table) {
            $table->dropColumn('addons');
        });
    }
};
