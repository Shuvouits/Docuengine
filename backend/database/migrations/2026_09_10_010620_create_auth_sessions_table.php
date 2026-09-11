<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('user_id');

            $table->string('jti_hash', 64)
                ->unique();

            $table->string('ip_address', 45)
                ->nullable();

            $table->text('user_agent')
                ->nullable();

            $table->string('device_name', 150)
                ->nullable();

            $table->dateTime('last_activity_at')
                ->nullable();

            $table->dateTime('expires_at');

            $table->dateTime('revoked_at')
                ->nullable();

            $table->string('revoke_reason', 100)
                ->nullable();

            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->index([
                'user_id',
                'revoked_at',
            ]);

            $table->index('expires_at');

            $table->index('last_activity_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_sessions');
    }
};