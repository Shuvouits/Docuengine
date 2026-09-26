<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /**
             * --------------------------------------------------------------------------
             * Tenant & Company
             * --------------------------------------------------------------------------
             */

            $table->uuid('tenant_id')
                ->index();

            $table->uuid('company_id')
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Asset Layout
             * --------------------------------------------------------------------------
             */

            $table->uuid('asset_layout_id')
                ->index();

            $table->uuid('asset_layout_version_id')
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Asset Identity
             * --------------------------------------------------------------------------
             */

            $table->string('name', 200);

            $table->string('status', 30)
                ->default('active')
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Ownership / Assignment
             * --------------------------------------------------------------------------
             */

            $table->uuid('owner_user_id')
                ->nullable()
                ->index();

            $table->uuid('assigned_user_id')
                ->nullable()
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Data Source
             * --------------------------------------------------------------------------
             */

            $table->string('data_source', 30)
                ->default('manual');

            /**
             * --------------------------------------------------------------------------
             * Warranty
             * --------------------------------------------------------------------------
             */

            $table->string('warranty_provider', 150)
                ->nullable();

            $table->date('warranty_start_date')
                ->nullable();

            $table->date('warranty_expiration_date')
                ->nullable()
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Lifecycle
             * --------------------------------------------------------------------------
             */

            $table->string('lifecycle_status', 30)
                ->nullable()
                ->index();

            /**
             * --------------------------------------------------------------------------
             * Notes
             * --------------------------------------------------------------------------
             */

            $table->text('notes')
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

            $table->softDeletes();

            /**
             * --------------------------------------------------------------------------
             * Foreign Keys
             * --------------------------------------------------------------------------
             */

            $table->foreign('company_id')
                ->references('id')
                ->on('companies');

            $table->foreign('asset_layout_id')
                ->references('id')
                ->on('asset_layouts');

            $table->foreign('asset_layout_version_id')
                ->references('id')
                ->on('asset_layout_versions');

            /**
             * --------------------------------------------------------------------------
             * Indexes
             * --------------------------------------------------------------------------
             */

            $table->index(
                [
                    'tenant_id',
                    'company_id',
                    'status',
                ],
                'assets_company_status_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'status',
                ],
                'assets_layout_status_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'data_source',
                ],
                'assets_data_source_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'lifecycle_status',
                ],
                'assets_lifecycle_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
