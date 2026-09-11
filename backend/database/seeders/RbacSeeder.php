<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Services\Security\TenantRbacService;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Clear Spatie Permission Cache
        |--------------------------------------------------------------------------
        */

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | RBAC Service
        |--------------------------------------------------------------------------
        */

        $rbacService =
            app(TenantRbacService::class);

        /*
        |--------------------------------------------------------------------------
        | Sync Every Existing Tenant
        |--------------------------------------------------------------------------
        |
        | Soft-deleted tenants are automatically excluded by Eloquent
        | if the Tenant model uses SoftDeletes.
        |
        */

        Tenant::query()
            ->orderBy('created_at')
            ->each(function (Tenant $tenant) use ($rbacService) {

                $this->command?->info(
                    "Syncing RBAC for tenant: {$tenant->name}"
                );

                $rbacService->syncTenant(
                    $tenant
                );

            });

        /*
        |--------------------------------------------------------------------------
        | Final Permission Cache Reset
        |--------------------------------------------------------------------------
        */

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        $this->command?->info(
            'Tenant RBAC synchronization completed.'
        );
    }
}
