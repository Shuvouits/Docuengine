<?php

use App\Http\Controllers\Api\Auth\AuthSessionController;
use App\Http\Controllers\Api\Auth\MfaController;
use App\Http\Controllers\Api\Auth\MfaLoginChallengeController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Api\Tenant\AccessReviewController;
use App\Http\Controllers\Api\Tenant\ArchiveController;
use App\Http\Controllers\Api\Tenant\AssetLayoutActivationController;
use App\Http\Controllers\Api\Tenant\AssetLayoutBuilderController;
use App\Http\Controllers\Api\Tenant\AssetLayoutController;
use App\Http\Controllers\Api\Tenant\AssetLayoutFieldController;
use App\Http\Controllers\Api\Tenant\AssetLayoutSectionController;
use App\Http\Controllers\Api\Tenant\AssetLayoutValidationController;
use App\Http\Controllers\Api\Tenant\AssetLayoutVersionController;
use App\Http\Controllers\Api\Tenant\AuditEventController;
use App\Http\Controllers\Api\Tenant\CompanyContextController;
use App\Http\Controllers\Api\Tenant\CompanyController;
use App\Http\Controllers\Api\Tenant\CompanyWorkspaceController;
use App\Http\Controllers\Api\Tenant\GlobalWorkspaceController;
use App\Http\Controllers\Api\Tenant\OptionListController;
use App\Http\Controllers\Api\Tenant\OptionListItemController;
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


/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post(
    '/auth/login',
    [AuthController::class, 'login']
)->middleware('throttle:10,1');

Route::post(
    '/auth/forgot-password',
    [PasswordResetController::class, 'forgotPassword']
);

Route::post(
    '/auth/password-reset/validate',
    [PasswordResetController::class, 'validateToken']
);

Route::post(
    '/auth/reset-password',
    [PasswordResetController::class, 'resetPassword']
);

Route::post(
    '/auth/mfa/challenge/verify',
    [MfaLoginChallengeController::class, 'verify']
)->middleware('throttle:10,1');


/*
|--------------------------------------------------------------------------
| Public Invitation Routes
|--------------------------------------------------------------------------
*/

Route::post(
    '/invitations/validate',
    [TenantInvitationController::class, 'validateInvitation']
);

Route::post(
    '/invitations/accept',
    [TenantInvitationController::class, 'accept']
);


/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
])
    ->prefix('auth')
    ->group(function () {
        Route::get(
            '/me',
            [AuthController::class, 'me']
        );

        Route::get(
            '/mfa/status',
            [MfaController::class, 'status']
        );

        Route::post(
            '/mfa/setup',
            [MfaController::class, 'setup']
        );

        Route::post(
            '/mfa/confirm',
            [MfaController::class, 'confirm']
        );

        Route::post(
            '/mfa/disable',
            [MfaController::class, 'disable']
        );

        Route::post(
            '/mfa/recovery-codes/regenerate',
            [MfaController::class, 'regenerateRecoveryCodes']
        );

        Route::get(
            '/sessions',
            [AuthSessionController::class, 'index']
        );

        Route::delete(
            '/sessions/{sessionId}',
            [AuthSessionController::class, 'destroy']
        );

        Route::post(
            '/sessions/logout-all',
            [AuthSessionController::class, 'logoutAll']
        );
    });


/*
|--------------------------------------------------------------------------
| Platform Owner Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'platform.owner',
])
    ->prefix('tenants')
    ->group(function () {
        Route::get(
            '/',
            [TenantController::class, 'index']
        );

        Route::post(
            '/',
            [TenantController::class, 'store']
        );

        Route::get(
            '/{id}',
            [TenantController::class, 'show']
        );

        Route::put(
            '/{id}',
            [TenantController::class, 'update']
        );

        Route::patch(
            '/{id}/activate',
            [TenantController::class, 'activate']
        );

        Route::patch(
            '/{id}/deactivate',
            [TenantController::class, 'deactivate']
        );

        Route::patch(
            '/{id}/suspend',
            [TenantController::class, 'suspend']
        );

        Route::patch(
            '/{id}/archive',
            [TenantController::class, 'archive']
        );

        Route::post(
            '/{tenantId}/admins',
            [TenantAdminController::class, 'store']
        );

        Route::delete(
            '/{id}',
            [TenantController::class, 'destroy']
        );
    });


/*
|--------------------------------------------------------------------------
| Tenant Configuration Routes
|--------------------------------------------------------------------------
|
| Feature configuration routes must NOT be protected by the feature itself.
| MSP Admin needs these routes to turn disabled features back on.
|
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
    'tenant.admin:tenantId',
])
    ->prefix('tenants/{tenantId}/configuration')
    ->group(function () {
        Route::get(
            '/',
            [TenantConfigurationController::class, 'show']
        );

        Route::patch(
            '/general',
            [TenantConfigurationController::class, 'updateGeneral']
        );

        Route::patch(
            '/settings',
            [TenantConfigurationController::class, 'updateSettings']
        );

        Route::patch(
            '/branding',
            [TenantConfigurationController::class, 'updateBranding']
        );

        Route::patch(
            '/feature-flags/{key}',
            [TenantConfigurationController::class, 'updateFeatureFlag']
        );

        Route::patch(
            '/terminology',
            [TenantConfigurationController::class, 'updateTerminology']
        );

        Route::patch(
            '/organization',
            [TenantConfigurationController::class, 'updateOrganization']
        );

        Route::post(
            '/branding/assets',
            [TenantConfigurationController::class, 'uploadBrandingAssets']
        );

        Route::get(
            '/regional-options',
            [TenantConfigurationController::class, 'regionalOptions']
        );
    });


/*
|--------------------------------------------------------------------------
| Tenant User Management Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
])
    ->prefix('tenants/{tenantId}/users')
    ->group(function () {
        Route::get(
            '/role-options',
            [TenantUserController::class, 'roleOptions']
        )->middleware([
            'permission:users.create',
            'permission:roles.assign',
        ]);

        Route::get(
            '/',
            [TenantUserController::class, 'index']
        )->middleware(
            'permission:users.view'
        );

        Route::get(
            '/{userId}',
            [TenantUserController::class, 'show']
        )->middleware(
            'permission:users.view'
        );

        Route::post(
            '/',
            [TenantUserController::class, 'store']
        )->middleware([
            'permission:users.create',
            'permission:roles.assign',
        ]);

        Route::patch(
            '/{userId}',
            [TenantUserController::class, 'update']
        )->middleware([
            'permission:users.update',
            'permission:roles.assign',
        ]);

        Route::patch(
            '/{userId}/suspend',
            [TenantUserController::class, 'suspend']
        )->middleware(
            'permission:users.suspend'
        );

        Route::patch(
            '/{userId}/activate',
            [TenantUserController::class, 'activate']
        )->middleware(
            'permission:users.activate'
        );
    });


/*
|--------------------------------------------------------------------------
| Tenant Invitation Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
])
    ->prefix('tenants/{tenantId}/invitations')
    ->group(function () {
        Route::get(
            '/',
            [TenantInvitationController::class, 'index']
        )->middleware(
            'permission:users.invite'
        );

        Route::post(
            '/',
            [TenantInvitationController::class, 'store']
        )->middleware([
            'permission:users.invite',
            'permission:roles.assign',
        ]);

        Route::get(
            '/{invitationId}',
            [TenantInvitationController::class, 'show']
        )->middleware(
            'permission:users.invite'
        );

        Route::patch(
            '/{invitationId}/revoke',
            [TenantInvitationController::class, 'revoke']
        )->middleware(
            'permission:users.invite'
        );

        Route::patch(
            '/{invitationId}/resend',
            [TenantInvitationController::class, 'resend']
        )->middleware([
            'permission:users.invite',
            'permission:roles.assign',
        ]);
    });


/*
|--------------------------------------------------------------------------
| Tenant Role Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
])
    ->prefix('tenants/{tenantId}/roles')
    ->group(function () {
        Route::get(
            '/permissions',
            [TenantRoleController::class, 'permissions']
        )->middleware(
            'permission:roles.view'
        );

        Route::get(
            '/',
            [TenantRoleController::class, 'index']
        )->middleware(
            'permission:roles.view'
        );

        Route::get(
            '/{roleId}',
            [TenantRoleController::class, 'show']
        )->middleware(
            'permission:roles.view'
        );

        Route::post(
            '/',
            [TenantRoleController::class, 'store']
        )->middleware(
            'permission:roles.create'
        );

        Route::patch(
            '/{roleId}',
            [TenantRoleController::class, 'update']
        )->middleware(
            'permission:roles.update'
        );

        Route::delete(
            '/{roleId}',
            [TenantRoleController::class, 'destroy']
        )->middleware(
            'permission:roles.delete'
        );
    });


/*
|--------------------------------------------------------------------------
| Tenant Security Group Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
])
    ->prefix('tenants/{tenantId}/security-groups')
    ->group(function () {
        Route::get(
            '/',
            [SecurityGroupController::class, 'index']
        )->middleware(
            'permission:security_groups.view'
        );

        Route::post(
            '/',
            [SecurityGroupController::class, 'store']
        )->middleware(
            'permission:security_groups.create'
        );

        Route::get(
            '/{groupId}',
            [SecurityGroupController::class, 'show']
        )->middleware(
            'permission:security_groups.view'
        );

        Route::patch(
            '/{groupId}',
            [SecurityGroupController::class, 'update']
        )->middleware(
            'permission:security_groups.update'
        );

        Route::delete(
            '/{groupId}',
            [SecurityGroupController::class, 'destroy']
        )->middleware(
            'permission:security_groups.delete'
        );

        Route::get(
            '/{groupId}/users',
            [SecurityGroupController::class, 'users']
        )->middleware(
            'permission:security_groups.view'
        );

        Route::post(
            '/{groupId}/users/{userId}',
            [SecurityGroupController::class, 'addUser']
        )->middleware(
            'permission:security_groups.assign'
        );

        Route::delete(
            '/{groupId}/users/{userId}',
            [SecurityGroupController::class, 'removeUser']
        )->middleware(
            'permission:security_groups.assign'
        );

        Route::patch(
            '/{groupId}/restore',
            [SecurityGroupController::class, 'restore']
        )->middleware(
            'permission:archive.restore'
        );

        Route::delete(
            '/{groupId}/permanent',
            [SecurityGroupController::class, 'permanentlyDelete']
        )->middleware(
            'permission:archive.delete_permanently'
        );
    });


/*
|--------------------------------------------------------------------------
| Security Group Resource Restriction Routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
])
    ->prefix(
        'tenants/{tenantId}/security-groups/{groupId}/restrictions'
    )
    ->group(function () {
        Route::get(
            '/',
            [SecurityGroupResourceRestrictionController::class, 'index']
        )->middleware(
            'permission:security_groups.view'
        );

        Route::post(
            '/',
            [SecurityGroupResourceRestrictionController::class, 'store']
        )->middleware(
            'permission:security_groups.update'
        );

        Route::get(
            '/{restrictionId}',
            [SecurityGroupResourceRestrictionController::class, 'show']
        )->middleware(
            'permission:security_groups.view'
        );

        Route::patch(
            '/{restrictionId}',
            [SecurityGroupResourceRestrictionController::class, 'update']
        )->middleware(
            'permission:security_groups.update'
        );

        Route::delete(
            '/{restrictionId}',
            [SecurityGroupResourceRestrictionController::class, 'destroy']
        )->middleware(
            'permission:security_groups.update'
        );
    });


/*
|--------------------------------------------------------------------------
| Tenant IP Access Routes
|--------------------------------------------------------------------------
|
| ip_access feature flag OFF = route access blocked.
|
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
    'tenant.feature:ip_access',
])
    ->prefix('tenants/{tenantId}/ip-access')
    ->group(function () {
        Route::get(
            '/',
            [TenantIpAccessController::class, 'index']
        )->middleware(
            'permission:security.ip_allowlist.view'
        );

        Route::patch(
            '/policy',
            [TenantIpAccessController::class, 'updatePolicy']
        )->middleware(
            'permission:security.ip_allowlist.manage'
        );

        Route::post(
            '/entries',
            [TenantIpAccessController::class, 'storeEntry']
        )->middleware(
            'permission:security.ip_allowlist.manage'
        );

        Route::patch(
            '/entries/{entryId}',
            [TenantIpAccessController::class, 'updateEntry']
        )->middleware(
            'permission:security.ip_allowlist.manage'
        );

        Route::delete(
            '/entries/{entryId}',
            [TenantIpAccessController::class, 'destroyEntry']
        )->middleware(
            'permission:security.ip_allowlist.manage'
        );
    });


/*
|--------------------------------------------------------------------------
| Security Events Routes
|--------------------------------------------------------------------------
|
| security_events feature flag OFF = route access blocked.
|
*/

Route::prefix(
    'tenants/{tenantId}/security-events'
)
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
        'tenant.feature:security_events',
        'permission:security.events.view',
    ])
    ->group(function () {
        Route::get(
            '/',
            [SecurityEventController::class, 'index']
        );

        Route::get(
            '/{eventId}',
            [SecurityEventController::class, 'show']
        );
    });


/*
|--------------------------------------------------------------------------
| Access Review Routes
|--------------------------------------------------------------------------
|
| access_reviews feature flag OFF = route access blocked.
|
*/

Route::prefix('tenants/{tenantId}')
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
        'tenant.feature:access_reviews',
    ])
    ->group(function () {
        Route::get(
            '/access-reviews',
            [AccessReviewController::class, 'index']
        )->middleware(
            'permission:access_reviews.view'
        );

        Route::get(
            '/access-reviews/{reviewId}',
            [AccessReviewController::class, 'show']
        )->middleware(
            'permission:access_reviews.view'
        );

        Route::post(
            '/access-reviews',
            [AccessReviewController::class, 'store']
        )->middleware(
            'permission:access_reviews.manage'
        );

        Route::post(
            '/access-reviews/{reviewId}/start',
            [AccessReviewController::class, 'start']
        )->middleware(
            'permission:access_reviews.manage'
        );

        Route::patch(
            '/access-reviews/{reviewId}/items/{itemId}',
            [AccessReviewController::class, 'decide']
        )->middleware(
            'permission:access_reviews.manage'
        );

        Route::post(
            '/access-reviews/{reviewId}/complete',
            [AccessReviewController::class, 'complete']
        )->middleware(
            'permission:access_reviews.manage'
        );

        Route::post(
            '/access-reviews/{reviewId}/cancel',
            [AccessReviewController::class, 'cancel']
        )->middleware(
            'permission:access_reviews.manage'
        );
    });


/*
|--------------------------------------------------------------------------
| Module 5 - Asset Layouts / Option Lists / Company Layouts
|--------------------------------------------------------------------------
|
| asset_layouts feature flag controls the complete Module 5 feature family.
|
| Feature OFF:
| - Asset Layouts blocked
| - Option Lists blocked
| - Sections / Fields blocked
| - Builder / Validation blocked
| - Versions blocked
| - Company Layout activation blocked
|
*/

Route::prefix('tenants/{tenantId}')
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
        'tenant.feature:asset_layouts',
    ])
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Module 5 - Option Lists
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/option-lists',
            [OptionListController::class, 'index']
        )->middleware(
            'permission:option_lists.view'
        );

        Route::post(
            '/option-lists',
            [OptionListController::class, 'store']
        )->middleware(
            'permission:option_lists.manage'
        );

        Route::get(
            '/option-lists/{optionListId}',
            [OptionListController::class, 'show']
        )->middleware(
            'permission:option_lists.view'
        );

        Route::patch(
            '/option-lists/{optionListId}',
            [OptionListController::class, 'update']
        )->middleware(
            'permission:option_lists.manage'
        );

        Route::delete(
            '/option-lists/{optionListId}',
            [OptionListController::class, 'destroy']
        )->middleware(
            'permission:option_lists.manage'
        );

        Route::post(
            '/option-lists/{optionListId}/restore',
            [OptionListController::class, 'restore']
        )->middleware(
            'permission:option_lists.manage'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Option List Items
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/option-lists/{optionListId}/items',
            [OptionListItemController::class, 'index']
        )->middleware(
            'permission:option_lists.view'
        );

        Route::post(
            '/option-lists/{optionListId}/items',
            [OptionListItemController::class, 'store']
        )->middleware(
            'permission:option_lists.manage'
        );

        Route::get(
            '/option-lists/{optionListId}/items/{itemId}',
            [OptionListItemController::class, 'show']
        )->middleware(
            'permission:option_lists.view'
        );

        Route::patch(
            '/option-lists/{optionListId}/items/{itemId}',
            [OptionListItemController::class, 'update']
        )->middleware(
            'permission:option_lists.manage'
        );

        Route::delete(
            '/option-lists/{optionListId}/items/{itemId}',
            [OptionListItemController::class, 'destroy']
        )->middleware(
            'permission:option_lists.manage'
        );

        Route::post(
            '/option-lists/{optionListId}/items/{itemId}/restore',
            [OptionListItemController::class, 'restore']
        )->middleware(
            'permission:option_lists.manage'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Asset Layouts
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/asset-layouts',
            [AssetLayoutController::class, 'index']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::post(
            '/asset-layouts',
            [AssetLayoutController::class, 'store']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::get(
            '/asset-layouts/{layoutId}',
            [AssetLayoutController::class, 'show']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::patch(
            '/asset-layouts/{layoutId}',
            [AssetLayoutController::class, 'update']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::delete(
            '/asset-layouts/{layoutId}',
            [AssetLayoutController::class, 'destroy']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::post(
            '/asset-layouts/{layoutId}/restore',
            [AssetLayoutController::class, 'restore']
        )->middleware(
            'permission:asset_layouts.manage'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Asset Layout Sections
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/asset-layouts/{layoutId}/sections',
            [AssetLayoutSectionController::class, 'index']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::post(
            '/asset-layouts/{layoutId}/sections',
            [AssetLayoutSectionController::class, 'store']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::get(
            '/asset-layouts/{layoutId}/sections/{sectionId}',
            [AssetLayoutSectionController::class, 'show']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::patch(
            '/asset-layouts/{layoutId}/sections/{sectionId}',
            [AssetLayoutSectionController::class, 'update']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::delete(
            '/asset-layouts/{layoutId}/sections/{sectionId}',
            [AssetLayoutSectionController::class, 'destroy']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::post(
            '/asset-layouts/{layoutId}/sections/{sectionId}/restore',
            [AssetLayoutSectionController::class, 'restore']
        )->middleware(
            'permission:asset_layouts.manage'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Asset Layout Fields
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/asset-layouts/{layoutId}/sections/{sectionId}/fields',
            [AssetLayoutFieldController::class, 'index']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::post(
            '/asset-layouts/{layoutId}/sections/{sectionId}/fields',
            [AssetLayoutFieldController::class, 'store']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::get(
            '/asset-layouts/{layoutId}/sections/{sectionId}/fields/{fieldId}',
            [AssetLayoutFieldController::class, 'show']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::patch(
            '/asset-layouts/{layoutId}/sections/{sectionId}/fields/{fieldId}',
            [AssetLayoutFieldController::class, 'update']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::delete(
            '/asset-layouts/{layoutId}/sections/{sectionId}/fields/{fieldId}',
            [AssetLayoutFieldController::class, 'destroy']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::post(
            '/asset-layouts/{layoutId}/sections/{sectionId}/fields/{fieldId}/restore',
            [AssetLayoutFieldController::class, 'restore']
        )->middleware(
            'permission:asset_layouts.manage'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Validation / Builder
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/asset-layouts/{layoutId}/validate',
            [AssetLayoutValidationController::class, 'validateLayout']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::get(
            '/asset-layouts/{layoutId}/builder',
            [AssetLayoutBuilderController::class, 'show']
        )->middleware(
            'permission:asset_layouts.view'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Versions
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/asset-layouts/{layoutId}/versions',
            [AssetLayoutVersionController::class, 'store']
        )->middleware(
            'permission:asset_layouts.manage'
        );

        Route::get(
            '/asset-layouts/{layoutId}/versions',
            [AssetLayoutVersionController::class, 'index']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::get(
            '/asset-layouts/{layoutId}/versions/{versionId}',
            [AssetLayoutVersionController::class, 'show']
        )->middleware(
            'permission:asset_layouts.view'
        );


        /*
        |--------------------------------------------------------------------------
        | Module 5 - Company Layout Activation
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/companies/{companyId}/asset-layout-activations',
            [AssetLayoutActivationController::class, 'companyIndex']
        )->middleware(
            'permission:asset_layouts.view'
        );

        Route::post(
            '/asset-layouts/{layoutId}/activate',
            [AssetLayoutActivationController::class, 'activate']
        )->middleware(
            'permission:asset_layouts.activate'
        );

        Route::post(
            '/asset-layouts/{layoutId}/deactivate',
            [AssetLayoutActivationController::class, 'deactivate']
        )->middleware(
            'permission:asset_layouts.activate'
        );
    });


/*
|--------------------------------------------------------------------------
| Module 4 - Audit & Activity Routes
|--------------------------------------------------------------------------
*/

Route::prefix(
    'tenants/{tenantId}/audit-events'
)
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
        'permission:audit.view',
    ])
    ->group(function () {
        Route::get(
            '/',
            [AuditEventController::class, 'index']
        );

        Route::get(
            '/export',
            [AuditEventController::class, 'export']
        )->middleware(
            'permission:audit.export'
        );

        Route::get(
            '/activity/{targetType}/{targetId}',
            [AuditEventController::class, 'activity']
        );

        Route::get(
            '/{eventId}',
            [AuditEventController::class, 'show']
        )->whereUuid('eventId');
    });


/*
|--------------------------------------------------------------------------
| Module 4 - Archive / Museum Routes
|--------------------------------------------------------------------------
*/

Route::prefix(
    'tenants/{tenantId}/archive'
)
    ->middleware([
        'auth:api',
        'auth.session',
        'tenant.resolve:tenantId',
        'permission:archive.view',
    ])
    ->group(function () {
        Route::get(
            '/',
            [ArchiveController::class, 'index']
        );

        Route::get(
            '/{archiveEntryId}',
            [ArchiveController::class, 'show']
        );
    });


/*
|--------------------------------------------------------------------------
| Module 3 - Companies
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:api', 'auth.session', 'tenant.resolve:tenantId'])
    ->prefix('tenants/{tenantId}/companies')
    ->group(function () {
        Route::get('/summary', [CompanyController::class, 'summary'])
            ->middleware('permission:companies.view');

        Route::get('/options', [CompanyController::class, 'options'])
            ->middleware('permission:companies.view');

        Route::get('/', [CompanyController::class, 'index'])
            ->middleware('permission:companies.view');

        Route::post('/', [CompanyController::class, 'store'])
            ->middleware('permission:companies.create');

        Route::get('/{companyId}', [CompanyController::class, 'show'])
            ->middleware('permission:companies.view');

        Route::patch('/{companyId}', [CompanyController::class, 'update'])
            ->middleware('permission:companies.update');

        Route::delete('/{companyId}', [CompanyController::class, 'destroy'])
            ->middleware('permission:companies.archive');

        Route::post('/{companyId}/restore', [CompanyController::class, 'restore'])
            ->middleware('permission:companies.restore');

        Route::get('/{companyId}/workspace', [CompanyWorkspaceController::class, 'show'])
            ->middleware('permission:companies.view');
    });


/*
|--------------------------------------------------------------------------
| Module 3 - Global Workspace
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
    'permission:companies.view',
])
    ->prefix('tenants/{tenantId}/workspace')
    ->group(function () {
        Route::get('/', [GlobalWorkspaceController::class, 'index']);
    });


/*
|--------------------------------------------------------------------------
| Module 3 - Company Context
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:api',
    'auth.session',
    'tenant.resolve:tenantId',
    'permission:companies.view',
])
    ->prefix('tenants/{tenantId}/company-context')
    ->group(function () {
        Route::get('/', [CompanyContextController::class, 'show']);

        Route::patch('/', [CompanyContextController::class, 'update']);
    });
