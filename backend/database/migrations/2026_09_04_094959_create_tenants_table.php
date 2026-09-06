<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Basic Information
            |--------------------------------------------------------------------------
            */

            $table->string('name');

            $table->string('slug')
                ->unique();

            /*
            |--------------------------------------------------------------------------
            | Lifecycle
            |--------------------------------------------------------------------------
            |
            | active
            | inactive
            | suspended
            | archived
            |
            */

            $table->string('status')
                ->default('active');

            $table->timestamp('activated_at')
                ->nullable();

            $table->timestamp('deactivated_at')
                ->nullable();

            $table->timestamp('suspended_at')
                ->nullable();

            $table->text('suspension_reason')
                ->nullable();

            $table->timestamp('archived_at')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Tenant Defaults
            |--------------------------------------------------------------------------
            */

            $table->string('locale')
                ->default('en');

            $table->string('timezone')
                ->default('UTC');

            /*
            |--------------------------------------------------------------------------
            | Extra Metadata
            |--------------------------------------------------------------------------
            */

            $table->json('metadata')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index('status');
            $table->index('archived_at');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
