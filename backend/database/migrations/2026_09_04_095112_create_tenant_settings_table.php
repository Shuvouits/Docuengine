<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();

            $table->uuid('tenant_id');

            /*
            |--------------------------------------------------------------------------
            | Date & Time
            |--------------------------------------------------------------------------
            */

            $table->string('date_format')
                ->default('Y-m-d');

            $table->string('time_format')
                ->default('H:i');

            $table->string('week_start')
                ->default('monday');

            /*
            |--------------------------------------------------------------------------
            | Naming
            |--------------------------------------------------------------------------
            */

            $table->string('name_prefix')
                ->nullable();

            $table->string('name_suffix')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Other Preferences
            |--------------------------------------------------------------------------
            */

            $table->json('preferences')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints
            |--------------------------------------------------------------------------
            */

            $table->unique('tenant_id');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
