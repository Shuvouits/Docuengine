<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            $table->boolean('is_platform_owner')
                ->default(false);

            $table->string('status')
                ->default('active');

            $table->timestamp('email_verified_at')
                ->nullable();

            $table->rememberToken();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('is_platform_owner');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();

            $table->string('token_hash', 64)
                ->unique();

            $table->dateTime('created_at')
                ->nullable();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
