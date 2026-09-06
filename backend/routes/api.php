<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantAdminController;
use App\Http\Controllers\Api\TenantConfigurationController;
use App\Http\Controllers\Api\TenantController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

// Platform Owner Routes
Route::middleware(['auth:api', 'platform.owner'])
    ->prefix('tenants')
    ->group(function () {

        Route::get('/', [TenantController::class, 'index']);
        Route::post('/', [TenantController::class, 'store']);
        Route::get('/{id}', [TenantController::class, 'show']);
        Route::put('/{id}', [TenantController::class, 'update']);
        Route::patch('/{id}/activate', [TenantController::class, 'activate']);
        Route::patch('/{id}/deactivate', [TenantController::class, 'deactivate']);
        Route::patch('/{id}/suspend', [TenantController::class, 'suspend']);
        Route::patch('/{id}/archive', [TenantController::class, 'archive']);
        Route::post('/{tenantId}/admins', [TenantAdminController::class, 'store']);
        Route::delete('/{id}', [TenantController::class, 'destroy']);
    });

// Tenant Configuration Routes
Route::middleware(['auth:api', 'tenant.resolve:tenantId', 'tenant.admin:tenantId'])->prefix('tenants/{tenantId}/configuration')
    ->group(function () {

        Route::get('/', [TenantConfigurationController::class, 'show']);
        Route::patch('/general', [TenantConfigurationController::class, 'updateGeneral']);
        Route::patch('/settings', [TenantConfigurationController::class, 'updateSettings']);
        Route::patch('/branding', [TenantConfigurationController::class, 'updateBranding']);
        Route::patch('/feature-flags/{key}', [TenantConfigurationController::class, 'updateFeatureFlag']);
        Route::patch('/terminology', [TenantConfigurationController::class, 'updateTerminology']);
        Route::patch('/organization', [TenantConfigurationController::class, 'updateOrganization']);
        Route::post('/branding/assets', [TenantConfigurationController::class, 'uploadBrandingAssets']);
        Route::get('/regional-options', [TenantConfigurationController::class, 'regionalOptions']);
    });
