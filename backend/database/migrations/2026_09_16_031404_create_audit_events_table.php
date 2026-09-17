<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_events', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Tenant / Actor Snapshot
            |--------------------------------------------------------------------------
            |
            | Deliberately not foreign keys.
            |
            | Audit history must remain intact even if the tenant or user is
            | later removed from the operational tables.
            |
            */

            $table->uuid('tenant_id')
                ->nullable()
                ->index();

            $table->uuid('actor_user_id')
                ->nullable()
                ->index();

            $table->json('actor_snapshot')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Audit Action
            |--------------------------------------------------------------------------
            */

            $table->string('action', 100)
                ->index();

            $table->string('category', 100)
                ->nullable()
                ->index();

            /*
            |--------------------------------------------------------------------------
            | Target Resource
            |--------------------------------------------------------------------------
            |
            | Generic target fields allow this table to audit future modules:
            | companies, documents, assets, credentials, KB articles, etc.
            |
            */

            $table->string('target_type', 120)
                ->nullable();

            $table->string('target_id', 100)
                ->nullable();

            $table->string('target_label')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Audit Details
            |--------------------------------------------------------------------------
            */

            $table->text('description')
                ->nullable();

            $table->json('changes')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Request Context
            |--------------------------------------------------------------------------
            */

            $table->string('ip_address', 45)
                ->nullable();

            $table->text('user_agent')
                ->nullable();

            $table->string('request_method', 10)
                ->nullable();

            $table->text('request_path')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Event Time
            |--------------------------------------------------------------------------
            */

            $table->timestamp('occurred_at')
                ->useCurrent()
                ->index();

            $table->timestamp('created_at')
                ->useCurrent();

            /*
            |--------------------------------------------------------------------------
            | Lookup Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'tenant_id',
                'action',
                'occurred_at',
            ]);

            $table->index([
                'tenant_id',
                'target_type',
                'target_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_events');
    }
};
