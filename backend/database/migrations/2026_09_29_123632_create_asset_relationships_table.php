<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_relationships', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')
                ->index();

            $table->uuid('source_asset_id')
                ->index();

            $table->uuid('related_asset_id')
                ->index();

            $table->string(
                'relationship_type',
                100
            )->default('related_to');

            $table->string(
                'label',
                255
            )->nullable();

            $table->text(
                'notes'
            )->nullable();

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->foreign('source_asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->foreign('related_asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->unique(
                [
                    'tenant_id',
                    'source_asset_id',
                    'related_asset_id',
                    'relationship_type',
                ],
                'asset_relationships_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'source_asset_id',
                    'created_at',
                ],
                'asset_relationships_source_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'related_asset_id',
                    'created_at',
                ],
                'asset_relationships_related_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'asset_relationships'
        );
    }
};
