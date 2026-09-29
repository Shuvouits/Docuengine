<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('asset_id')->index();

            $table->text('body');

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->foreign('asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->index(
                [
                    'tenant_id',
                    'asset_id',
                    'created_at',
                ],
                'asset_comments_asset_created_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_comments');
    }
};
