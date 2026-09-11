<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_group_resource_restrictions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id');
            $table->uuid('security_group_id');

            $table->string('resource_type', 50);
            $table->uuid('resource_id');

            $table->string('access_level', 20)
                ->default('view');

            $table->uuid('created_by')
                ->nullable();

            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('security_group_id')
                ->references('id')
                ->on('security_groups')
                ->cascadeOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->unique(
                [
                    'security_group_id',
                    'resource_type',
                    'resource_id',
                ],
                'security_group_resource_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'resource_type',
                    'resource_id',
                ],
                'security_group_resource_lookup_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'security_group_resource_restrictions'
        );
    }
};
