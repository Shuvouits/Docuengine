<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_users', function (Blueprint $table) {
            $table
                ->uuid('current_company_id')
                ->nullable()
                ->after('joined_at');

            $table->index(
                'current_company_id',
                'tenant_users_current_company_id_index'
            );

            $table
                ->foreign('current_company_id')
                ->references('id')
                ->on('companies')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::table('tenant_users', function (Blueprint $table) {
            $table->dropForeign(
                'tenant_users_current_company_id_foreign'
            );

            $table->dropIndex(
                'tenant_users_current_company_id_index'
            );

            $table->dropColumn(
                'current_company_id'
            );
        });
    }
};
