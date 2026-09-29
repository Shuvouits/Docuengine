<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('keeper_links', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('tenant_id')->index();

            $table->uuid('company_id')
                ->nullable()
                ->index();

            $table->string('name', 255);

            $table->string('username_hint', 255)
                ->nullable();

            $table->string('keeper_uid', 255)
                ->nullable()
                ->index();

            $table->text('record_url')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->uuid('created_by')
                ->nullable()
                ->index();

            $table->uuid('updated_by')
                ->nullable()
                ->index();

            $table->timestamps();

            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->nullOnDelete();

            $table->index(
                [
                    'tenant_id',
                    'company_id',
                    'name',
                ],
                'keeper_links_tenant_company_name_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keeper_links');
    }
};
