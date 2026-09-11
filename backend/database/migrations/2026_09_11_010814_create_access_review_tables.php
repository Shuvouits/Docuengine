<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('tenant_id')
                ->constrained('tenants')
                ->cascadeOnDelete();

            $table->string('name', 150);

            $table->string('status', 30)
                ->default('draft');

            $table->foreignUuid('reviewer_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUuid('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('due_at')
                ->nullable();

            $table->timestamp('started_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamps();

            $table->index([
                'tenant_id',
                'status',
            ]);

            $table->index([
                'tenant_id',
                'due_at',
            ]);
        });

        Schema::create('access_review_items', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('access_review_id')
                ->constrained('access_reviews')
                ->cascadeOnDelete();

            $table->foreignUuid('tenant_id')
                ->constrained('tenants')
                ->cascadeOnDelete();

            $table->unsignedBigInteger('tenant_user_id')
                ->nullable();

            $table->foreign('tenant_user_id')
                ->references('id')
                ->on('tenant_users')
                ->nullOnDelete();

            $table->foreignUuid('subject_user_id')
                ->constrained('users');

            $table->string('decision', 30)
                ->default('pending');

            $table->string('current_role', 100)
                ->nullable();

            $table->string('requested_role', 100)
                ->nullable();

            $table->foreignUuid('reviewed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('reviewed_at')
                ->nullable();

            $table->text('decision_notes')
                ->nullable();

            $table->json('access_snapshot')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'access_review_id',
                'tenant_user_id',
            ]);

            $table->index([
                'tenant_id',
                'decision',
            ]);

            $table->index([
                'subject_user_id',
                'decision',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_review_items');
        Schema::dropIfExists('access_reviews');
    }
};