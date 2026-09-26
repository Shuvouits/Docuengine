<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\Security\TenantRbacService;
use Illuminate\Console\Command;

class SyncTenantRbac extends Command
{
    protected $signature = 'rbac:sync-tenants';

    protected $description = 'Sync RBAC permissions and roles for all tenants';

    public function handle(
        TenantRbacService $tenantRbacService
    ): int {
        $tenants = Tenant::query()->get();

        if ($tenants->isEmpty()) {
            $this->warn('No tenants found.');

            return self::SUCCESS;
        }

        foreach ($tenants as $tenant) {
            $this->info(
                "Syncing: {$tenant->name} ({$tenant->id})"
            );

            $tenantRbacService->syncTenant($tenant);
        }

        $this->newLine();

        $this->info(
            "RBAC synced for {$tenants->count()} tenant(s)."
        );

        return self::SUCCESS;
    }
}
