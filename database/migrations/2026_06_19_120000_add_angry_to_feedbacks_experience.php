<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Allow "angry" (used by the dashboard feedback widget) alongside the
        // original values. Keeping "neutral" avoids touching any existing rows.
        DB::statement("ALTER TABLE feedbacks MODIFY experience ENUM('happy','sad','neutral','angry') NOT NULL DEFAULT 'happy'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE feedbacks MODIFY experience ENUM('happy','sad','neutral') NOT NULL DEFAULT 'happy'");
    }
};
