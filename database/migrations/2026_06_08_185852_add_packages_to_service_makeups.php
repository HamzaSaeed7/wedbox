<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_makeups', function (Blueprint $table) {
            $table->string('pricing_mode', 20)->default('regular')->after('service_id');
            $table->json('packages')->nullable()->after('pricing_mode');
        });
    }

    public function down(): void
    {
        Schema::table('service_makeups', function (Blueprint $table) {
            $table->dropColumn(['pricing_mode', 'packages']);
        });
    }
};
