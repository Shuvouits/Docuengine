<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_keeper_links', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_id')->index();

            $table->uuid('keeper_link_id')->index();

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->foreign('asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->foreign('keeper_link_id')
                ->references('id')
                ->on('keeper_links')
                ->cascadeOnDelete();

            $table->unique(
                [
                    'tenant_id',
                    'asset_id',
                    'keeper_link_id',
                ],
                'asset_keeper_links_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'asset_id',
                    'created_at',
                ],
                'asset_keeper_links_asset_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'asset_keeper_links'
        );
    }
};
