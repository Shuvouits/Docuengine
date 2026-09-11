<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mfa_login_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('user_id');

            $table->string('token_hash', 64)
                ->unique();

            $table->dateTime('expires_at');

            $table->dateTime('verified_at')
                ->nullable();

            $table->unsignedTinyInteger('failed_attempts')
                ->default(0);

            $table->string('ip_address', 45)
                ->nullable();

            $table->text('user_agent')
                ->nullable();

            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->index([
                'user_id',
                'expires_at',
            ]);

            $table->index('verified_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mfa_login_challenges');
    }
};