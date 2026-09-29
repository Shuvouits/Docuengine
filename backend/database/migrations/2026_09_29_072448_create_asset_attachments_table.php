<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_id')->index();

            $table->string('attachment_type', 20)
                ->default('file')
                ->index();

            $table->string('original_name', 255);

            $table->string('stored_name', 255);

            $table->string('disk', 100);

            $table->string('path', 1000);

            $table->string('mime_type', 150)
                ->nullable();

            $table->string('extension', 20)
                ->nullable();

            $table->unsignedBigInteger('size_bytes')
                ->default(0);

            $table->uuid('uploaded_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->foreign('asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->index(
                [
                    'tenant_id',
                    'asset_id',
                    'attachment_type',
                ],
                'asset_attachments_scope_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'asset_id',
                    'created_at',
                ],
                'asset_attachments_created_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_attachments');
    }
};
