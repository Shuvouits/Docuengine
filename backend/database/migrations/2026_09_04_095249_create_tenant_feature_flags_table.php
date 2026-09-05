<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_feature_flags', function (Blueprint $table) {
            $table->id();

            $table->uuid('tenant_id');

            $table->string('key');
            $table->boolean('enabled')->default(false);

            $table->json('config')->nullable();

            $table->timestamps();

            $table->unique([
                'tenant_id',
                'key',
            ]);

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_feature_flags');
    }
};
