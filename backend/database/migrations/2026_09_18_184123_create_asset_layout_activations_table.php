<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_layout_activations', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_layout_id')->index();

            /*
            |--------------------------------------------------------------------------
            | Company
            |--------------------------------------------------------------------------
            |
            | We are not adding a foreign key yet because we should connect this
            | only after confirming the exact company/client table used by DocuEngine.
            |
            */

            $table->uuid('company_id')->index();

            /*
            |--------------------------------------------------------------------------
            | Activation State
            |--------------------------------------------------------------------------
            */

            $table->boolean('is_active')
                ->default(true)
                ->index();

            $table->timestamp('activated_at')
                ->nullable();

            $table->uuid('activated_by')
                ->nullable()
                ->index();

            $table->timestamp('deactivated_at')
                ->nullable();

            $table->uuid('deactivated_by')
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

            /*
            |--------------------------------------------------------------------------
            | Foreign Keys
            |--------------------------------------------------------------------------
            */

            $table->foreign('asset_layout_id')
                ->references('id')
                ->on('asset_layouts')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Constraints
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'tenant_id',
                    'asset_layout_id',
                    'company_id',
                ],
                'asset_layout_activations_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'company_id',
                    'is_active',
                ],
                'asset_layout_activations_company_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_layout_activations');
    }
};
