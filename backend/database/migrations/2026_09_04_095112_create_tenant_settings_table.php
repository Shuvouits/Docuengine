<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();

            $table->uuid('tenant_id');

            $table->string('date_format')->default('Y-m-d');
            $table->string('time_format')->default('H:i');

            $table->string('name_prefix')->nullable();
            $table->string('name_suffix')->nullable();

            $table->json('preferences')->nullable();

            $table->timestamps();

            $table->unique('tenant_id');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
