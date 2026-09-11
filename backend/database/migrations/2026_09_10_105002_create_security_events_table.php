<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_events', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')
                ->nullable();

            $table->uuid('actor_user_id')
                ->nullable();

            $table->uuid('subject_user_id')
                ->nullable();

            $table->string('event_type', 100);

            $table->string('category', 50);

            $table->string('severity', 20)
                ->default('info');

            $table->string('ip_address', 45)
                ->nullable();

            $table->text('user_agent')
                ->nullable();

            $table->string('description', 255)
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->dateTime('occurred_at');

            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->nullOnDelete();

            $table->foreign('actor_user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('subject_user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->index([
                'tenant_id',
                'event_type',
                'occurred_at',
            ]);

            $table->index([
                'tenant_id',
                'category',
                'occurred_at',
            ]);

            $table->index([
                'subject_user_id',
                'occurred_at',
            ]);

            $table->index([
                'actor_user_id',
                'occurred_at',
            ]);

            $table->index('severity');

            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};