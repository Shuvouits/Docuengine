<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('archive_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')
                ->index();

            $table->string('resource_type', 120)
                ->index();

            $table->string('resource_id', 100)
                ->index();

            $table->string('resource_label')
                ->nullable();

            $table->uuid('archived_by_user_id')
                ->nullable()
                ->index();

            $table->json('actor_snapshot')
                ->nullable();

            $table->text('reason')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamp('archived_at')
                ->index();

            $table->timestamp('restored_at')
                ->nullable()
                ->index();

            $table->uuid('restored_by_user_id')
                ->nullable();

            $table->timestamp('permanently_deleted_at')
                ->nullable()
                ->index();

            $table->uuid('permanently_deleted_by_user_id')
                ->nullable();

            $table->timestamps();

            $table->index([
                'tenant_id',
                'resource_type',
                'resource_id',
            ]);

            $table->index([
                'tenant_id',
                'archived_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archive_entries');
    }
};
