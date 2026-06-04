<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_profiles', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('user_id')
                  ->constrained('categories')->nullOnDelete();
            $table->string('address1')->nullable()->after('location');
            $table->string('address2')->nullable()->after('address1');
            $table->string('country')->nullable()->after('address2');
            $table->string('city')->nullable()->after('country');
            $table->string('phone')->nullable()->after('city');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->boolean('onboarding_completed')->default(false)->after('avatar_url');
        });

        // Make business_name nullable (it's set during onboarding, not at registration)
        Schema::table('vendor_profiles', function (Blueprint $table) {
            $table->string('business_name')->nullable()->change();
            $table->string('contact_first_name')->nullable()->change();
            $table->string('contact_last_name')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('vendor_profiles', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn([
                'category_id', 'address1', 'address2', 'country',
                'city', 'phone', 'avatar_url', 'onboarding_completed',
            ]);
        });
    }
};
