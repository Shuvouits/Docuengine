<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_layout_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_layout_id')->index();

            $table->uuid('section_id')->index();

            /*
            |--------------------------------------------------------------------------
            | Field Identity
            |--------------------------------------------------------------------------
            */

            $table->string('name', 150);

            $table->string('field_key', 170);

            $table->string('field_type', 50)
                ->index();

            $table->string('label', 150);

            $table->text('description')
                ->nullable();

            $table->string('placeholder', 255)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Ordering
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('sort_order')
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Field Rules
            |--------------------------------------------------------------------------
            */

            $table->boolean('is_required')
                ->default(false);

            $table->boolean('is_unique')
                ->default(false);

            $table->boolean('is_visible')
                ->default(true);

            /*
            |--------------------------------------------------------------------------
            | Field Configuration
            |--------------------------------------------------------------------------
            */

            $table->json('default_value')
                ->nullable();

            $table->json('validation_rules')
                ->nullable();

            $table->json('visibility_rules')
                ->nullable();

            $table->json('settings')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Reusable Option List
            |--------------------------------------------------------------------------
            |
            | Foreign key will be added after option_lists table exists.
            |
            */

            $table->uuid('option_list_id')
                ->nullable()
                ->index();

            /*
            |--------------------------------------------------------------------------
            | Audit Columns
            |--------------------------------------------------------------------------
            */

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->softDeletes();

            /*
            |--------------------------------------------------------------------------
            | Foreign Keys
            |--------------------------------------------------------------------------
            */

            $table->foreign('asset_layout_id')
                ->references('id')
                ->on('asset_layouts')
                ->cascadeOnDelete();

            $table->foreign('section_id')
                ->references('id')
                ->on('asset_layout_sections')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'field_key',
                ],
                'asset_layout_fields_key_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'section_id',
                    'sort_order',
                ],
                'asset_layout_fields_order_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_layout_fields');
    }
};
