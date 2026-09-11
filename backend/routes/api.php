<?php

use App\Http\Controllers\Api\Auth\AuthSessionController;
use App\Http\Controllers\Api\Auth\MfaController;
use App\Http\Controllers\Api\Auth\MfaLoginChallengeController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Tenant\AccessReviewController;
use App\Http\Controllers\Api\Tenant\SecurityEventController;
use App\Http\Controllers\Api\Tenant\SecurityGroupController;
use App\Http\Controllers\Api\Tenant\SecurityGroupResourceRestrictionController;
use App\Http\Controllers\Api\Tenant\TenantIpAccessController;
use App\Http\Controllers\Api\Tenant\TenantRoleController;
use App\Http\Controllers\Api\TenantAdminController;
use App\Http\Controllers\Api\TenantConfigurationController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\TenantInvitationController;
use App\Http\Controllers\Api\TenantUserController;
use Illuminate\Support\Facades\Route;

// Public Authentication Routes




Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);

Route::post('/auth/password-reset/validate', [PasswordResetController::class, 'validateToken']);

Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::post('/auth/mfa/challenge/verify', [MfaLoginChallengeController::class, 'verify'])
    ->middleware('throttle:10,1');


// Public Invitation Routes

Route::post('/invitations/validate', [TenantInvitationController::class, 'validateInvitation']);

Route::post('/invitations/accept', [TenantInvitationController::class, 'accept']);


// Authenticated User Routes

Route::middleware(['auth:api', 'auth.session'])
    ->prefix('auth')
    ->group(function () {
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/mfa/status', [MfaController::class, 'status']);
        Route::post('/mfa/setup', [MfaController::class, 'setup']);
        Route::post('/mfa/confirm', [MfaController::class, 'confirm']);
        Route::post('/mfa/disable', [MfaController::class, 'disable']);
        Route::post('/mfa/recovery-codes/regenerate', [MfaController::class, 'regenerateRecoveryCodes']);

        Route::get('/sessions', [AuthSessionController::class, 'index']);
        Route::delete('/sessions/{sessionId}', [AuthSessionController::class, 'destroy']);
        Route::post('/sessions/logout-all', [AuthSessionController::class, 'logoutAll']);
    });


// Platform Owner Routes

Route::middleware(['auth:api', 'auth.session', 'platform.owner'])
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

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId', 'tenant.admin:tenantId'])
    ->prefix('tenants/{tenantId}/configuration')
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


// Tenant User Management Routes

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/users')
    ->group(function () {
        Route::get('/role-options', [TenantUserController::class, 'roleOptions'])
            ->middleware([
                'permission:users.create',
                'permission:roles.assign',
            ]);

        Route::get('/', [TenantUserController::class, 'index'])
            ->middleware('permission:users.view');

        Route::get('/{userId}', [TenantUserController::class, 'show'])
            ->middleware('permission:users.view');

        Route::post('/', [TenantUserController::class, 'store'])
            ->middleware([
                'permission:users.create',
                'permission:roles.assign',
            ]);

        Route::patch('/{userId}', [TenantUserController::class, 'update'])
            ->middleware([
                'permission:users.update',
                'permission:roles.assign',
            ]);

        Route::patch('/{userId}/suspend', [TenantUserController::class, 'suspend'])
            ->middleware('permission:users.suspend');

        Route::patch('/{userId}/activate', [TenantUserController::class, 'activate'])
            ->middleware('permission:users.activate');
    });


// Tenant Invitation Routes

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/invitations')
    ->group(function () {
        Route::get('/', [TenantInvitationController::class, 'index'])
            ->middleware('permission:users.invite');

        Route::post('/', [TenantInvitationController::class, 'store'])
            ->middleware([
                'permission:users.invite',
                'permission:roles.assign',
            ]);

        Route::get('/{invitationId}', [TenantInvitationController::class, 'show'])
            ->middleware('permission:users.invite');

        Route::patch('/{invitationId}/revoke', [TenantInvitationController::class, 'revoke'])
            ->middleware('permission:users.invite');

        Route::patch('/{invitationId}/resend', [TenantInvitationController::class, 'resend'])
            ->middleware([
                'permission:users.invite',
                'permission:roles.assign',
            ]);
    });


// Tenant Role Routes

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/roles')
    ->group(function () {
        Route::get('/permissions', [TenantRoleController::class, 'permissions'])
            ->middleware('permission:roles.view');

        Route::get('/', [TenantRoleController::class, 'index'])
            ->middleware('permission:roles.view');

        Route::get('/{roleId}', [TenantRoleController::class, 'show'])
            ->middleware('permission:roles.view');

        Route::post('/', [TenantRoleController::class, 'store'])
            ->middleware('permission:roles.create');

        Route::patch('/{roleId}', [TenantRoleController::class, 'update'])
            ->middleware('permission:roles.update');

        Route::delete('/{roleId}', [TenantRoleController::class, 'destroy'])
            ->middleware('permission:roles.delete');
    });


// Tenant Security Group Routes

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/security-groups')
    ->group(function () {
        Route::get('/', [SecurityGroupController::class, 'index'])
            ->middleware('permission:security_groups.view');

        Route::post('/', [SecurityGroupController::class, 'store'])
            ->middleware('permission:security_groups.create');

        Route::get('/{groupId}', [SecurityGroupController::class, 'show'])
            ->middleware('permission:security_groups.view');

        Route::patch('/{groupId}', [SecurityGroupController::class, 'update'])
            ->middleware('permission:security_groups.update');

        Route::delete('/{groupId}', [SecurityGroupController::class, 'destroy'])
            ->middleware('permission:security_groups.delete');

        Route::get('/{groupId}/users', [SecurityGroupController::class, 'users'])
            ->middleware('permission:security_groups.view');

        Route::post('/{groupId}/users/{userId}', [SecurityGroupController::class, 'addUser'])
            ->middleware('permission:security_groups.assign');

        Route::delete('/{groupId}/users/{userId}', [SecurityGroupController::class, 'removeUser'])
            ->middleware('permission:security_groups.assign');
    });


// Security Group Resource Restriction Routes

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/security-groups/{groupId}/restrictions')
    ->group(function () {
        Route::get('/', [SecurityGroupResourceRestrictionController::class, 'index'])
            ->middleware('permission:security_groups.view');

        Route::post('/', [SecurityGroupResourceRestrictionController::class, 'store'])
            ->middleware('permission:security_groups.update');

        Route::get('/{restrictionId}', [SecurityGroupResourceRestrictionController::class, 'show'])
            ->middleware('permission:security_groups.view');

        Route::patch('/{restrictionId}', [SecurityGroupResourceRestrictionController::class, 'update'])
            ->middleware('permission:security_groups.update');

        Route::delete('/{restrictionId}', [SecurityGroupResourceRestrictionController::class, 'destroy'])
            ->middleware('permission:security_groups.update');
    });


    // Tenant IP Access Routes

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/ip-access')
    ->group(function () {
        Route::get('/', [TenantIpAccessController::class, 'index'])
            ->middleware('permission:security.ip_allowlist.view');

        Route::patch('/policy', [TenantIpAccessController::class, 'updatePolicy'])
            ->middleware('permission:security.ip_allowlist.manage');

        Route::post('/entries', [TenantIpAccessController::class, 'storeEntry'])
            ->middleware('permission:security.ip_allowlist.manage');

        Route::patch('/entries/{entryId}', [TenantIpAccessController::class, 'updateEntry'])
            ->middleware('permission:security.ip_allowlist.manage');

        Route::delete('/entries/{entryId}', [TenantIpAccessController::class, 'destroyEntry'])
            ->middleware('permission:security.ip_allowlist.manage');
    });



    Route::prefix('tenants/{tenantId}/security-events')
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
        'permission:security.events.view',
    ])
    ->group(function () {
        Route::get('/', [SecurityEventController::class, 'index']);

        Route::get('/{eventId}', [SecurityEventController::class, 'show']);
    });



    Route::prefix('tenants/{tenantId}')
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
    ])
    ->group(function () {
        Route::get('/access-reviews', [AccessReviewController::class, 'index'])
            ->middleware('permission:access_reviews.view');

        Route::get('/access-reviews/{reviewId}', [AccessReviewController::class, 'show'])
            ->middleware('permission:access_reviews.view');

        Route::post('/access-reviews', [AccessReviewController::class, 'store'])
            ->middleware('permission:access_reviews.manage');

        Route::post('/access-reviews/{reviewId}/start', [AccessReviewController::class, 'start'])
            ->middleware('permission:access_reviews.manage');

        Route::patch('/access-reviews/{reviewId}/items/{itemId}', [AccessReviewController::class, 'decide'])
            ->middleware('permission:access_reviews.manage');

        Route::post('/access-reviews/{reviewId}/complete', [AccessReviewController::class, 'complete'])
            ->middleware('permission:access_reviews.manage');

        Route::post('/access-reviews/{reviewId}/cancel', [AccessReviewController::class, 'cancel'])
            ->middleware('permission:access_reviews.manage');
    });
