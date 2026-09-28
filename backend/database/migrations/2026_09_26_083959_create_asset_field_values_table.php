<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_field_values', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /**
             * --------------------------------------------------------------------------
             * Tenant
             * --------------------------------------------------------------------------
             */

            $table->uuid('tenant_id')
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Asset
             * --------------------------------------------------------------------------
             */

            $table->uuid('asset_id')
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Layout Field
             * --------------------------------------------------------------------------
             */

            $table->uuid('asset_layout_field_id')
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Field Snapshot
             * --------------------------------------------------------------------------
             *
             * These values preserve field identity even if the layout changes later.
             */

            $table->string('field_key', 170);

            $table->string('field_type', 50);

            /**
             * --------------------------------------------------------------------------
             * Typed Values
             * --------------------------------------------------------------------------
             */

            $table->longText('value_text')
                ->nullable();

            $table->decimal(
                'value_number',
                20,
                6
            )->nullable();

            $table->dateTime('value_datetime')
                ->nullable();

            $table->boolean('value_boolean')
                ->nullable();

            $table->json('value_json')
                ->nullable();

            /**
             * --------------------------------------------------------------------------
             * Data Source
             * --------------------------------------------------------------------------
             *
             * manual      = entered by a user
             * integration = supplied by an external integration
             */

            $table->string('data_source', 30)
                ->default('manual');

            /**
             * --------------------------------------------------------------------------
             * Integration Metadata
             * --------------------------------------------------------------------------
             */

            $table->string('source_provider', 100)
                ->nullable();

            $table->string('source_reference', 255)
                ->nullable();

            /**
             * --------------------------------------------------------------------------
             * Audit Columns
             * --------------------------------------------------------------------------
             */

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            /**
             * --------------------------------------------------------------------------
             * Foreign Keys
             * --------------------------------------------------------------------------
             */

            $table->foreign('asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->foreign('asset_layout_field_id')
                ->references('id')
                ->on('asset_layout_fields');

            /**
             * --------------------------------------------------------------------------
             * Constraints
             * --------------------------------------------------------------------------
             *
             * One Asset can have only one stored value for one layout field.
             */

            $table->unique(
                [
                    'tenant_id',
                    'asset_id',
                    'asset_layout_field_id',
                ],
                'asset_field_values_unique'
            );

            /**
             * --------------------------------------------------------------------------
             * Indexes
             * --------------------------------------------------------------------------
             */

            $table->index(
                [
                    'tenant_id',
                    'asset_id',
                    'field_key',
                ],
                'asset_field_values_asset_key_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'asset_layout_field_id',
                ],
                'asset_field_values_field_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'data_source',
                ],
                'asset_field_values_source_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'asset_field_values'
        );
    }
};
