<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_mfa_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('user_id')->unique();

            $table->boolean('enabled')
                ->default(false);

            $table->text('secret_encrypted')
                ->nullable();

            $table->longText('recovery_codes_encrypted')
                ->nullable();

            $table->dateTime('confirmed_at')
                ->nullable();

            $table->dateTime('last_used_at')
                ->nullable();

            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->index('enabled');
            $table->index('confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_mfa_settings');
    }
};
