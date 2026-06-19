<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_invitations', function (Blueprint $table) {
            // "Save the Date" — the date the customer's event is held
            $table->date('event_date')->nullable()->after('needed_by');
        });
    }

    public function down(): void
    {
        Schema::table('order_invitations', function (Blueprint $table) {
            $table->dropColumn('event_date');
        });
    }
};
