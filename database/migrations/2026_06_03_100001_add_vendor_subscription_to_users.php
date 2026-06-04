<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('vendor_plan')->nullable()->after('stripe_customer_id');
            $table->string('vendor_subscription_status')->nullable()->after('vendor_plan');
            $table->string('stripe_checkout_session_id')->nullable()->after('vendor_subscription_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['vendor_plan', 'vendor_subscription_status', 'stripe_checkout_session_id']);
        });
    }
};
