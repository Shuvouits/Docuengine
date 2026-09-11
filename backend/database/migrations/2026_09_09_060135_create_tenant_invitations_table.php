<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Tenant
            |--------------------------------------------------------------------------
            */

            $table->uuid('tenant_id');

            /*
            |--------------------------------------------------------------------------
            | Invitee
            |--------------------------------------------------------------------------
            */

            $table->string('name')
                ->nullable();

            $table->string('email');

            /*
            |--------------------------------------------------------------------------
            | Role
            |--------------------------------------------------------------------------
            */

            $table->unsignedBigInteger('role_id');

            /*
            |--------------------------------------------------------------------------
            | Invitation Security
            |--------------------------------------------------------------------------
            |
            | Raw invitation token will never be stored.
            | Only its SHA-256 hash is persisted.
            |
            */

            $table->string('token_hash', 64)
                ->unique();

            /*
            |--------------------------------------------------------------------------
            | Invitation State
            |--------------------------------------------------------------------------
            */

            $table->string('status')
                ->default('pending');

            $table->dateTime('expires_at');

            $table->dateTime('accepted_at')
                ->nullable();

            $table->dateTime('revoked_at')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Audit
            |--------------------------------------------------------------------------
            */

            $table->uuid('invited_by')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'tenant_id',
                'email',
            ]);

            $table->index([
                'tenant_id',
                'status',
            ]);

            $table->index('expires_at');

            /*
            |--------------------------------------------------------------------------
            | Foreign Keys
            |--------------------------------------------------------------------------
            */

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->cascadeOnDelete();

            $table->foreign('invited_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_invitations');
    }
};
