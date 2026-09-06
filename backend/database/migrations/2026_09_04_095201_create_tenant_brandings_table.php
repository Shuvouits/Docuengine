<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_brandings', function (Blueprint $table) {
            $table->id();

            $table->uuid('tenant_id');

            /*
            |--------------------------------------------------------------------------
            | Branding
            |--------------------------------------------------------------------------
            */

            $table->string('display_name')
                ->nullable();

            $table->string('logo_path')
                ->nullable();

            $table->string('favicon_path')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Colors
            |--------------------------------------------------------------------------
            */

            $table->string('primary_color')
                ->nullable();

            $table->string('secondary_color')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Advanced Branding
            |--------------------------------------------------------------------------
            */

            $table->json('custom_styles')
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
        Schema::dropIfExists('tenant_brandings');
    }
};
