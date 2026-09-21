<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_layout_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_layout_id')->index();

            $table->string('name', 150);

            $table->text('description')->nullable();

            $table->unsignedInteger('sort_order')
                ->default(0);

            $table->unsignedTinyInteger('columns')
                ->default(1);

            $table->boolean('is_collapsible')
                ->default(false);

            $table->boolean('is_collapsed_by_default')
                ->default(false);

            $table->boolean('is_visible')
                ->default(true);

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->softDeletes();

            $table->foreign('asset_layout_id')
                ->references('id')
                ->on('asset_layouts')
                ->cascadeOnDelete();

            $table->index(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'sort_order',
                ],
                'asset_layout_sections_order_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_layout_sections');
    }
};
