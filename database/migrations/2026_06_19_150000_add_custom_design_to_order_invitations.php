<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_invitations', function (Blueprint $table) {
            // Customer-uploaded custom design (optional)
            $table->string('custom_design_url')->nullable()->after('invitation_text');
        });
    }

    public function down(): void
    {
        Schema::table('order_invitations', function (Blueprint $table) {
            $table->dropColumn('custom_design_url');
        });
    }
};
