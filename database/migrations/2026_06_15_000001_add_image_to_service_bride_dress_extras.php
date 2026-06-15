<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_bride_dress_extras', function (Blueprint $table) {
            $table->string('image')->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('service_bride_dress_extras', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
