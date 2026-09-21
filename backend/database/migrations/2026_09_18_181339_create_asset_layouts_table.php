<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_layouts', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->string('name', 150);

            $table->string('slug', 170);

            $table->text('description')->nullable();

            $table->string('status', 30)
                ->default('draft')
                ->index();

            $table->unsignedInteger('current_version')
                ->default(1);

            $table->boolean('is_template')
                ->default(false);

            $table->boolean('is_active')
                ->default(false)
                ->index();

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->softDeletes();

            $table->unique(
                ['tenant_id', 'slug'],
                'asset_layouts_tenant_slug_unique'
            );

            $table->index(
                ['tenant_id', 'status'],
                'asset_layouts_tenant_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_layouts');
    }
};
