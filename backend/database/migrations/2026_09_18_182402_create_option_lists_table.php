<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('option_lists', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->string('name', 150);

            $table->string('slug', 170);

            $table->text('description')
                ->nullable();

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

            $table->unique(
                [
                    'tenant_id',
                    'slug',
                ],
                'option_lists_tenant_slug_unique'
            );

            $table->index(
                [
                    'tenant_id',
                    'is_active',
                ],
                'option_lists_tenant_active_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('option_lists');
    }
};
