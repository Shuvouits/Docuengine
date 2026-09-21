<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_layout_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_layout_id')->index();

            $table->unsignedInteger('version_number');

            $table->json('schema_snapshot');

            $table->text('change_summary')
                ->nullable();

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->timestamp('created_at')
                ->useCurrent();

            $table->foreign('asset_layout_id')
                ->references('id')
                ->on('asset_layouts')
                ->cascadeOnDelete();

            $table->unique(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'version_number',
                ],
                'asset_layout_versions_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'created_at',
                ],
                'asset_layout_versions_history_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_layout_versions');
    }
};
