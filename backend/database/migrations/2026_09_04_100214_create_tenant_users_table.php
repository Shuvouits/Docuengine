<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_users', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Relationships
            |--------------------------------------------------------------------------
            */

            $table->uuid('tenant_id');
            $table->uuid('user_id');

            /*
            |--------------------------------------------------------------------------
            | Membership
            |--------------------------------------------------------------------------
            |
            | Temporary role foundation.
            | Full RBAC will come in Module 2.
            |
            */

            $table->string('role')
                ->default('member');

            $table->string('status')
                ->default('active');

            $table->timestamp('joined_at')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Constraints
            |--------------------------------------------------------------------------
            */

            $table->unique([
                'tenant_id',
                'user_id',
            ]);

            $table->index('role');
            $table->index('status');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_users');
    }
};
