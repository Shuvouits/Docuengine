<?php

namespace App\Providers;

use App\Services\Tenant\TenantContext;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->scoped(TenantContext::class, function () {
            return new TenantContext();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Platform Owner Global Authorization Bypass
        |--------------------------------------------------------------------------
        |
        | Platform Owners are global DocuEngine administrators.
        |
        | They do not require tenant-specific Spatie roles or permissions.
        | All other users continue through normal tenant-aware RBAC checks.
        |
        */

        Gate::before(function ($user, string $ability) {
            if (
                $user->isActive() &&
                $user->isPlatformOwner()
            ) {
                return true;
            }

            return null;
        });
    }
}
