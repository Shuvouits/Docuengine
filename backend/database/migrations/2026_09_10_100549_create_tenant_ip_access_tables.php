<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_ip_access_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')
                ->unique();

            $table->boolean('enabled')
                ->default(false);

            $table->uuid('updated_by')
                ->nullable();

            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });

        Schema::create('tenant_ip_allowlist_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id');

            $table->string('label', 100)
                ->nullable();

            $table->string('ip_or_cidr', 64);

            $table->boolean('is_active')
                ->default(true);

            $table->uuid('created_by')
                ->nullable();

            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->unique([
                'tenant_id',
                'ip_or_cidr',
            ]);

            $table->index([
                'tenant_id',
                'is_active',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'tenant_ip_allowlist_entries'
        );

        Schema::dropIfExists(
            'tenant_ip_access_policies'
        );
    }
};