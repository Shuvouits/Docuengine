<?php

namespace App\Http\Middleware;

use App\Repositories\TenantConfigurationRepository;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantFeatureEnabled
{
    public function __construct(
        private TenantConfigurationRepository $tenantConfigurationRepository
    ) {
    }

    public function handle(
        Request $request,
        Closure $next,
        string $feature
    ): Response {
        $tenantId = (string) $request->route('tenantId');

        if ($tenantId === '') {
            return response()->json([
                'message' => 'Tenant context is required.',
            ], 400);
        }

        $registeredFeatures = config(
            'docuengine.feature_flags',
            []
        );

        if (!array_key_exists($feature, $registeredFeatures)) {
            return response()->json([
                'message' => 'Invalid feature flag configuration.',
                'feature' => $feature,
            ], 500);
        }

        $enabled = $this
            ->tenantConfigurationRepository
            ->isFeatureEnabled(
                $tenantId,
                $feature
            );

        if (!$enabled) {
            return response()->json([
                'message' => 'This feature is disabled for this organization.',
                'feature' => $feature,
            ], 403);
        }

        return $next($request);
    }
}
