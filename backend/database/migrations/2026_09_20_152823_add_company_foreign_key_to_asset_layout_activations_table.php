<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!$this->foreignKeyExists(
            'asset_layout_activations',
            'asset_layout_activations_company_foreign'
        )) {
            Schema::table('asset_layout_activations', function (Blueprint $table) {
                $table->foreign('company_id', 'asset_layout_activations_company_foreign')
                    ->references('id')
                    ->on('companies')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if ($this->foreignKeyExists(
            'asset_layout_activations',
            'asset_layout_activations_company_foreign'
        )) {
            Schema::table('asset_layout_activations', function (Blueprint $table) {
                $table->dropForeign('asset_layout_activations_company_foreign');
            });
        }
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        $result = DB::selectOne(
            '
                SELECT COUNT(*) AS total
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND CONSTRAINT_NAME = ?
                  AND CONSTRAINT_TYPE = ?
            ',
            [$table, $constraint, 'FOREIGN KEY']
        );

        return (int) ($result->total ?? 0) > 0;
    }
};
