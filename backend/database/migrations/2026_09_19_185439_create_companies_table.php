<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Tenant Ownership
            |--------------------------------------------------------------------------
            */

            $table->uuid('tenant_id')
                ->index();

            /*
            |--------------------------------------------------------------------------
            | Company Profile
            |--------------------------------------------------------------------------
            */

            $table->string('name');

            $table->string('legal_name')
                ->nullable();

            $table->string('slug');

            $table->string('website')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Primary Contact
            |--------------------------------------------------------------------------
            */

            $table->string('primary_contact_name')
                ->nullable();

            $table->string('primary_contact_email')
                ->nullable();

            $table->string('primary_contact_phone', 50)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Address / Location
            |--------------------------------------------------------------------------
            */

            $table->string('address_line1')
                ->nullable();

            $table->string('address_line2')
                ->nullable();

            $table->string('city', 150)
                ->nullable();

            $table->string('state_region', 150)
                ->nullable();

            $table->string('postal_code', 50)
                ->nullable();

            $table->string('country', 150)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Internal Documentation
            |--------------------------------------------------------------------------
            */

            $table->text('description')
                ->nullable();

            $table->longText('notes')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Lifecycle
            |--------------------------------------------------------------------------
            */

            $table->string('status')
                ->default('active')
                ->index();

            $table->timestamp('archived_at')
                ->nullable()
                ->index();

            $table->uuid('archived_by')
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

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Constraints / Indexes
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'tenant_id',
                    'slug',
                ],
                'companies_tenant_slug_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'status',
                ],
                'companies_tenant_status_index'
            );

            $table->index(
                [
                    'tenant_id',
                    'name',
                ],
                'companies_tenant_name_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
