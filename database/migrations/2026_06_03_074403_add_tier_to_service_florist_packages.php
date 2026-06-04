<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_florist_packages', function (Blueprint $table) {
            $table->string('tier')->nullable()->after('type'); // bronze | silver | gold
        });
    }

    public function down(): void
    {
        Schema::table('service_florist_packages', function (Blueprint $table) {
            $table->dropColumn('tier');
        });
    }
};
