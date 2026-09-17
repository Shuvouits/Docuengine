<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id');

            $table->string('name');
            $table->text('description')->nullable();

            $table->boolean('is_system')
                ->default(false);

            $table->uuid('created_by')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Soft Delete / Archive
            |--------------------------------------------------------------------------
            */

            $table->softDeletes();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->unique(
                ['tenant_id', 'name'],
                'security_groups_tenant_name_unique'
            );

            $table->index('tenant_id');
            $table->index('is_system');
        });

        Schema::create('security_group_users', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->uuid('tenant_id');
            $table->uuid('security_group_id');
            $table->uuid('user_id');

            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();

            $table->foreign('security_group_id')
                ->references('id')
                ->on('security_groups')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->unique(
                [
                    'security_group_id',
                    'user_id',
                ],
                'security_group_users_group_user_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'user_id',
                ],
                'security_group_users_tenant_user_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_group_users');
        Schema::dropIfExists('security_groups');
    }
};