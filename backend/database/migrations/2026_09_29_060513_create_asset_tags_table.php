<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')
                ->index();

            $table->string('name', 100);

            $table->string('slug', 120);

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->unique(
                [
                    'tenant_id',
                    'slug',
                ],
                'asset_tags_tenant_slug_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'name',
                ],
                'asset_tags_tenant_name_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_tags');
    }
};
