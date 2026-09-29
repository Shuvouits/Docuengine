<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'asset_tag_assignments',
            function (Blueprint $table) {
                $table->uuid('id')->primary();

                $table->uuid('tenant_id')
                    ->index();

                $table->uuid('asset_id')
                    ->index();

                $table->uuid('asset_tag_id')
                    ->index();

                $table->uuid('created_by')
                    ->nullable()
                    ->index();

                $table->timestamps();

                $table->foreign('asset_id')
                    ->references('id')
                    ->on('assets')
                    ->cascadeOnDelete();

                $table->foreign('asset_tag_id')
                    ->references('id')
                    ->on('asset_tags')
                    ->cascadeOnDelete();

                $table->unique(
                    [
                        'tenant_id',
                        'asset_id',
                        'asset_tag_id',
                    ],
                    'asset_tag_assignments_unique'
                );

                $table->index(
                    [
                        'tenant_id',
                        'asset_id',
                    ],
                    'asset_tag_assignments_asset_index'
                );

                $table->index(
                    [
                        'tenant_id',
                        'asset_tag_id',
                    ],
                    'asset_tag_assignments_tag_index'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'asset_tag_assignments'
        );
    }
};
