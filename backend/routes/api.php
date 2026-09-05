<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

    // Public
    Route::post('/login', [AuthController::class, 'login']);

});

Route::middleware('auth:api')->prefix('tenants')->group(function () {

    Route::get('/', [TenantController::class, 'index']);

    Route::post('/', [TenantController::class, 'store']);

    Route::get('/{id}', [TenantController::class, 'show']);

    Route::put('/{id}', [TenantController::class, 'update']);

    Route::delete('/{id}', [TenantController::class, 'destroy']);
});
