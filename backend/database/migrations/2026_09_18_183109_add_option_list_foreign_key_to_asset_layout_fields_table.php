<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_layout_fields', function (Blueprint $table) {
            $table->foreign('option_list_id')
                ->references('id')
                ->on('option_lists')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('asset_layout_fields', function (Blueprint $table) {
            $table->dropForeign([
                'option_list_id',
            ]);
        });
    }
};
