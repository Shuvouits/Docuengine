<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('option_list_items', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('option_list_id')->index();

            $table->string('label', 150);

            $table->string('value', 170);

            $table->unsignedInteger('sort_order')
                ->default(0);

            $table->boolean('is_active')
                ->default(true)
                ->index();

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->softDeletes();

            $table->foreign('option_list_id')
                ->references('id')
                ->on('option_lists')
                ->cascadeOnDelete();

            $table->unique(
                [
                    'tenant_id',
                    'option_list_id',
                    'value',
                ],
                'option_list_items_value_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'option_list_id',
                    'sort_order',
                ],
                'option_list_items_order_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('option_list_items');
    }
};
