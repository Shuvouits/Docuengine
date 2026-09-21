<?php

namespace App\Services\AssetLayout;

use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AssetLayoutActivationRepository;
use App\Repositories\CompanyRepository;
use App\Services\Audit\AuditEventService;

class AssetLayoutActivationService
{
    public function __construct(
        protected AssetLayoutActivationRepository $activationRepository,
        protected CompanyRepository $companyRepository,
        protected AssetLayoutValidationService $validationService,
        protected AuditEventService $auditEventService
    ) {
    }

    public function activate(
        string $tenantId,
        string $layoutId,
        string $companyId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        $company = $this->companyRepository->findById(
            $tenantId,
            $companyId
        );

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Company not found.',
                'activation' => null,
            ];
        }

        if (!$company->isActive()) {
            return [
                'success' => false,
                'message' => 'Only active companies can receive asset layouts.',
                'activation' => null,
            ];
        }

        $validation = $this->validationService->validate(
            $tenantId,
            $layoutId
        );

        if (!$validation['valid']) {
            $layoutNotFound = collect($validation['errors'])
                ->contains(
                    fn (array $error) =>
                        ($error['code'] ?? null) === 'layout_not_found'
                );

            return [
                'success' => false,
                'message' => $layoutNotFound
                    ? 'Asset layout not found.'
                    : 'Asset layout must be valid before activation.',
                'activation' => null,
                'validation_errors' => $validation['errors'],
            ];
        }

        $existing = $this->activationRepository
            ->findByLayoutAndCompany(
                $tenantId,
                $layoutId,
                $companyId
            );

        if ($existing && $existing->is_active) {
            return [
                'success' => true,
                'message' => 'Asset layout is already active for this company.',
                'activation' => $existing,
            ];
        }

        if ($existing) {
            $activation = $this->activationRepository->update(
                $existing,
                [
                    'is_active' => true,
                    'activated_at' => now(),
                    'activated_by' => $actor->id,
                    'deactivated_at' => null,
                    'deactivated_by' => null,
                    'updated_by' => $actor->id,
                ]
            );

            $this->auditEventService->record(
                tenantId: $tenantId,
                actor: $actor,
                action: AuditEvent::ACTION_REACTIVATED,
                category: AuditEvent::CATEGORY_RESOURCE,
                targetType: 'asset_layout',
                targetId: $layoutId,
                targetLabel: $activation->layout?->name
                    ?? 'Asset Layout',
                description: 'Asset layout was reactivated for a company.',
                changes: [
                    'is_active' => [
                        'from' => false,
                        'to' => true,
                    ],
                ],
                metadata: [
                    'activation_id' => $activation->id,
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                ],
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return [
                'success' => true,
                'message' => 'Asset layout reactivated successfully.',
                'activation' => $activation,
            ];
        }

        $activation = $this->activationRepository->create([
            'tenant_id' => $tenantId,
            'asset_layout_id' => $layoutId,
            'company_id' => $companyId,
            'is_active' => true,
            'activated_at' => now(),
            'activated_by' => $actor->id,
            'created_by' => $actor->id,
            'updated_by' => $actor->id,
        ]);

        $activation->load([
            'layout',
            'company',
        ]);

        $this->auditEventService->record(
            tenantId: $tenantId,
            actor: $actor,
            action: AuditEvent::ACTION_ACTIVATED,
            category: AuditEvent::CATEGORY_RESOURCE,
            targetType: 'asset_layout',
            targetId: $layoutId,
            targetLabel: $activation->layout?->name
                ?? 'Asset Layout',
            description: 'Asset layout was activated for a company.',
            changes: [
                'is_active' => [
                    'from' => null,
                    'to' => true,
                ],
            ],
            metadata: [
                'activation_id' => $activation->id,
                'company_id' => $company->id,
                'company_name' => $company->name,
            ],
            ipAddress: $ipAddress,
            userAgent: $userAgent,
            requestMethod: $requestMethod,
            requestPath: $requestPath
        );

        return [
            'success' => true,
            'message' => 'Asset layout activated successfully.',
            'activation' => $activation,
        ];
    }

    public function deactivate(
        string $tenantId,
        string $layoutId,
        string $companyId,
        User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): array {
        $activation = $this->activationRepository
            ->findByLayoutAndCompany(
                $tenantId,
                $layoutId,
                $companyId
            );

        if (!$activation) {
            return [
                'success' => false,
                'message' => 'Asset layout activation not found.',
                'activation' => null,
            ];
        }

        if (!$activation->is_active) {
            return [
                'success' => true,
                'message' => 'Asset layout is already inactive for this company.',
                'activation' => $activation,
            ];
        }

        $activation = $this->activationRepository->update(
            $activation,
            [
                'is_active' => false,
                'deactivated_at' => now(),
                'deactivated_by' => $actor->id,
                'updated_by' => $actor->id,
            ]
        );

        $this->auditEventService->record(
            tenantId: $tenantId,
            actor: $actor,
            action: AuditEvent::ACTION_DEACTIVATED,
            category: AuditEvent::CATEGORY_RESOURCE,
            targetType: 'asset_layout',
            targetId: $layoutId,
            targetLabel: $activation->layout?->name
                ?? 'Asset Layout',
            description: 'Asset layout was deactivated for a company.',
            changes: [
                'is_active' => [
                    'from' => true,
                    'to' => false,
                ],
            ],
            metadata: [
                'activation_id' => $activation->id,
                'company_id' => $companyId,
            ],
            ipAddress: $ipAddress,
            userAgent: $userAgent,
            requestMethod: $requestMethod,
            requestPath: $requestPath
        );

        return [
            'success' => true,
            'message' => 'Asset layout deactivated successfully.',
            'activation' => $activation,
        ];
    }

    public function getCompanyActivations(
        string $tenantId,
        string $companyId
    ): array {
        $company = $this->companyRepository->findById(
            $tenantId,
            $companyId
        );

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Company not found.',
                'activations' => [],
                'count' => 0,
            ];
        }

        $activations = $this->activationRepository
            ->getAllByCompany(
                $tenantId,
                $companyId
            );

        return [
            'success' => true,
            'message' => 'Company asset layout activations retrieved successfully.',
            'activations' => $activations,
            'count' => $activations->count(),
        ];
    }
}
