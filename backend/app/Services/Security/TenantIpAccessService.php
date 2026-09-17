<?php

namespace App\Services\Security;

use App\Models\AuditEvent;
use App\Models\TenantIpAccessPolicy;
use App\Models\TenantIpAllowlistEntry;
use App\Models\User;
use App\Repositories\TenantIpAccessRepository;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TenantIpAccessService
{
    public function __construct(
        private TenantIpAccessRepository $tenantIpAccessRepository,
        private AuditEventService $auditEventService
    ) {
    }

    public function getPolicy(
        string $tenantId
    ): array {
        $policy = $this
            ->tenantIpAccessRepository
            ->findPolicyByTenant(
                $tenantId
            );

        return [
            'enabled' => $policy?->enabled ?? false,
            'updated_by' => $policy?->updated_by,
            'updated_at' => $policy?->updated_at,
        ];
    }

    public function updatePolicy(
        string $tenantId,
        bool $enabled,
        User $actor,
        ?string $requestIp = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): TenantIpAccessPolicy {
        $beforePolicy = $this
            ->tenantIpAccessRepository
            ->findPolicyByTenant(
                $tenantId
            );

        $beforeEnabled = (bool) (
            $beforePolicy?->enabled ?? false
        );

        if ($enabled) {
            if (
                !$this
                    ->tenantIpAccessRepository
                    ->hasActiveEntries(
                        $tenantId
                    )
            ) {
                throw new DomainException(
                    'Add at least one active IP allowlist entry before enabling IP restrictions.'
                );
            }

            $this->ensureCurrentIpIsAllowed(
                $tenantId,
                $requestIp
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $enabled,
            $actor,
            $requestIp,
            $userAgent,
            $requestMethod,
            $requestPath,
            $beforeEnabled
        ) {
            $policy = $this
                ->tenantIpAccessRepository
                ->createOrUpdatePolicy(
                    $tenantId,
                    [
                        'enabled' => $enabled,
                        'updated_by' => $actor->id,
                    ]
                );

            $afterEnabled = (bool) $policy->enabled;

            if ($beforeEnabled !== $afterEnabled) {
                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'ip_access_policy',
                    targetId: (string) $policy->id,
                    targetLabel: 'IP Access Policy',
                    description: 'IP access policy was updated.',
                    changes: [
                        'enabled' => [
                            'from' => $beforeEnabled,
                            'to' => $afterEnabled,
                        ],
                    ],
                    metadata: null,
                    ipAddress: $requestIp,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
            }

            return $policy;
        });
    }

    public function listEntries(
        string $tenantId
    ): Collection {
        return $this
            ->tenantIpAccessRepository
            ->allEntriesByTenant(
                $tenantId
            );
    }

    public function createEntry(
        string $tenantId,
        User $actor,
        string $ipOrCidr,
        ?string $label = null,
        bool $isActive = true,
        ?string $requestIp = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): TenantIpAllowlistEntry {
        $normalizedValue = $this
            ->normalizeIpOrCidr(
                $ipOrCidr
            );

        $existing = $this
            ->tenantIpAccessRepository
            ->findEntryByTenantAndValue(
                $tenantId,
                $normalizedValue
            );

        if ($existing) {
            throw new DomainException(
                'This IP address or CIDR range already exists in the allowlist.'
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $actor,
            $normalizedValue,
            $label,
            $isActive,
            $requestIp,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $entry = $this
                ->tenantIpAccessRepository
                ->createEntry(
                    $tenantId,
                    [
                        'label' => $this->normalizeLabel(
                            $label
                        ),
                        'ip_or_cidr' => $normalizedValue,
                        'is_active' => $isActive,
                        'created_by' => $actor->id,
                    ]
                );

            $this->auditEventService->record(
                tenantId: $tenantId,
                actor: $actor,
                action: AuditEvent::ACTION_CREATED,
                category: AuditEvent::CATEGORY_ACCESS,
                targetType: 'ip_allowlist_entry',
                targetId: (string) $entry->id,
                targetLabel: $entry->label
                    ?: $entry->ip_or_cidr,
                description: 'IP allowlist entry was created.',
                changes: [
                    'label' => [
                        'from' => null,
                        'to' => $entry->label,
                    ],
                    'ip_or_cidr' => [
                        'from' => null,
                        'to' => $entry->ip_or_cidr,
                    ],
                    'is_active' => [
                        'from' => null,
                        'to' => (bool) $entry->is_active,
                    ],
                ],
                metadata: null,
                ipAddress: $requestIp,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );

            return $entry;
        });
    }

    public function updateEntry(
        string $tenantId,
        string $entryId,
        array $data,
        User $actor,
        ?string $requestIp = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): TenantIpAllowlistEntry {
        $entry = $this
            ->tenantIpAccessRepository
            ->findEntryByTenantAndId(
                $tenantId,
                $entryId
            );

        if (!$entry) {
            throw new DomainException(
                'IP allowlist entry not found.'
            );
        }

        $before = [
            'label' => $entry->label,
            'ip_or_cidr' => $entry->ip_or_cidr,
            'is_active' => (bool) $entry->is_active,
        ];

        $updates = [];

        if (
            array_key_exists(
                'ip_or_cidr',
                $data
            )
        ) {
            $normalizedValue = $this
                ->normalizeIpOrCidr(
                    $data['ip_or_cidr']
                );

            $existing = $this
                ->tenantIpAccessRepository
                ->findEntryByTenantAndValue(
                    $tenantId,
                    $normalizedValue
                );

            if (
                $existing &&
                $existing->id !== $entry->id
            ) {
                throw new DomainException(
                    'This IP address or CIDR range already exists in the allowlist.'
                );
            }

            $updates['ip_or_cidr'] =
                $normalizedValue;
        }

        if (
            array_key_exists(
                'label',
                $data
            )
        ) {
            $updates['label'] =
                $this->normalizeLabel(
                    $data['label']
                );
        }

        if (
            array_key_exists(
                'is_active',
                $data
            )
        ) {
            $updates['is_active'] =
                (bool) $data['is_active'];
        }

        if (empty($updates)) {
            return $entry;
        }

        $changesAccessRule =
            $entry->is_active &&
            (
                array_key_exists(
                    'ip_or_cidr',
                    $updates
                ) ||
                (
                    array_key_exists(
                        'is_active',
                        $updates
                    ) &&
                    !$updates['is_active']
                )
            );

        if ($changesAccessRule) {
            $this->ensureCurrentIpRemainsAllowed(
                $tenantId,
                $entry,
                $updates,
                $requestIp
            );
        }

        return DB::transaction(function () use (
            $tenantId,
            $entry,
            $updates,
            $before,
            $actor,
            $requestIp,
            $userAgent,
            $requestMethod,
            $requestPath
        ) {
            $updatedEntry = $this
                ->tenantIpAccessRepository
                ->updateEntry(
                    $entry,
                    $updates
                );

            $after = [
                'label' => $updatedEntry->label,
                'ip_or_cidr' => $updatedEntry->ip_or_cidr,
                'is_active' =>
                    (bool) $updatedEntry->is_active,
            ];

            $changes = [];

            foreach (
                $before as $field => $value
            ) {
                if ($value !== $after[$field]) {
                    $changes[$field] = [
                        'from' => $value,
                        'to' => $after[$field],
                    ];
                }
            }

            if (!empty($changes)) {
                $this->auditEventService->record(
                    tenantId: $tenantId,
                    actor: $actor,
                    action: AuditEvent::ACTION_UPDATED,
                    category: AuditEvent::CATEGORY_ACCESS,
                    targetType: 'ip_allowlist_entry',
                    targetId:
                        (string) $updatedEntry->id,
                    targetLabel:
                        $updatedEntry->label
                        ?: $updatedEntry->ip_or_cidr,
                    description:
                        'IP allowlist entry was updated.',
                    changes: $changes,
                    metadata: null,
                    ipAddress: $requestIp,
                    userAgent: $userAgent,
                    requestMethod: $requestMethod,
                    requestPath: $requestPath
                );
            }

            return $updatedEntry;
        });
    }

    public function deleteEntry(
        string $tenantId,
        string $entryId,
        User $actor,
        ?string $requestIp = null,
        ?string $userAgent = null,
        ?string $requestMethod = null,
        ?string $requestPath = null
    ): void {
        $entry = $this
            ->tenantIpAccessRepository
            ->findEntryByTenantAndId(
                $tenantId,
                $entryId
            );

        if (!$entry) {
            throw new DomainException(
                'IP allowlist entry not found.'
            );
        }

        if ($entry->is_active) {
            $this->ensureCurrentIpRemainsAllowed(
                $tenantId,
                $entry,
                [],
                $requestIp,
                true
            );
        }

        $snapshot = [
            'label' => $entry->label,
            'ip_or_cidr' => $entry->ip_or_cidr,
            'is_active' => (bool) $entry->is_active,
        ];

        DB::transaction(function () use (
            $tenantId,
            $entry,
            $actor,
            $requestIp,
            $userAgent,
            $requestMethod,
            $requestPath,
            $snapshot
        ) {
            $this
                ->tenantIpAccessRepository
                ->deleteEntry(
                    $entry
                );

            $this->auditEventService->record(
                tenantId: $tenantId,
                actor: $actor,
                action: AuditEvent::ACTION_DELETED,
                category: AuditEvent::CATEGORY_ACCESS,
                targetType: 'ip_allowlist_entry',
                targetId: (string) $entry->id,
                targetLabel:
                    $snapshot['label']
                    ?: $snapshot['ip_or_cidr'],
                description:
                    'IP allowlist entry was deleted.',
                changes: [
                    'deleted' => [
                        'from' => false,
                        'to' => true,
                    ],
                ],
                metadata: $snapshot,
                ipAddress: $requestIp,
                userAgent: $userAgent,
                requestMethod: $requestMethod,
                requestPath: $requestPath
            );
        });
    }

    private function ensureCurrentIpIsAllowed(
        string $tenantId,
        ?string $requestIp
    ): void {
        $requestIp = $this
            ->validatedRequestIp(
                $requestIp
            );

        $entries = $this
            ->tenantIpAccessRepository
            ->activeEntriesByTenant(
                $tenantId
            );

        foreach ($entries as $entry) {
            if (
                $this->ipMatchesRule(
                    $requestIp,
                    $entry->ip_or_cidr
                )
            ) {
                return;
            }
        }

        throw new DomainException(
            'Your current IP address is not covered by an active allowlist entry.'
        );
    }

    private function ensureCurrentIpRemainsAllowed(
        string $tenantId,
        TenantIpAllowlistEntry $targetEntry,
        array $updates,
        ?string $requestIp,
        bool $deleting = false
    ): void {
        $policy = $this
            ->tenantIpAccessRepository
            ->findPolicyByTenant(
                $tenantId
            );

        if (!$policy?->enabled) {
            return;
        }

        $requestIp = $this
            ->validatedRequestIp(
                $requestIp
            );

        $entries = $this
            ->tenantIpAccessRepository
            ->activeEntriesByTenant(
                $tenantId
            );

        foreach ($entries as $entry) {
            if (
                $entry->id ===
                $targetEntry->id
            ) {
                if ($deleting) {
                    continue;
                }

                $isActive = array_key_exists(
                    'is_active',
                    $updates
                )
                    ? (bool) $updates['is_active']
                    : (bool) $entry->is_active;

                if (!$isActive) {
                    continue;
                }

                $rule =
                    $updates['ip_or_cidr']
                    ?? $entry->ip_or_cidr;
            } else {
                $rule = $entry->ip_or_cidr;
            }

            if (
                $this->ipMatchesRule(
                    $requestIp,
                    $rule
                )
            ) {
                return;
            }
        }

        throw new DomainException(
            'This change would remove your current IP address from the active allowlist. Add another matching entry or disable IP restrictions first.'
        );
    }

    private function validatedRequestIp(
        ?string $requestIp
    ): string {
        $requestIp = trim(
            (string) $requestIp
        );

        if (
            $requestIp === '' ||
            filter_var(
                $requestIp,
                FILTER_VALIDATE_IP
            ) === false
        ) {
            throw new DomainException(
                'The current request IP address could not be validated.'
            );
        }

        $packed = inet_pton(
            $requestIp
        );

        if ($packed === false) {
            throw new DomainException(
                'The current request IP address could not be validated.'
            );
        }

        return inet_ntop(
            $packed
        );
    }

    private function normalizeLabel(
        ?string $label
    ): ?string {
        if ($label === null) {
            return null;
        }

        $label = trim($label);

        return $label !== ''
            ? $label
            : null;
    }

    private function normalizeIpOrCidr(
        string $value
    ): string {
        $value = trim($value);

        if ($value === '') {
            throw new DomainException(
                'An IP address or CIDR range is required.'
            );
        }

        if (
            !str_contains(
                $value,
                '/'
            )
        ) {
            if (
                filter_var(
                    $value,
                    FILTER_VALIDATE_IP
                ) === false
            ) {
                throw new DomainException(
                    'The IP address is invalid.'
                );
            }

            $packed = inet_pton(
                $value
            );

            if ($packed === false) {
                throw new DomainException(
                    'The IP address is invalid.'
                );
            }

            return inet_ntop(
                $packed
            );
        }

        $parts = explode(
            '/',
            $value
        );

        if (count($parts) !== 2) {
            throw new DomainException(
                'The CIDR range is invalid.'
            );
        }

        $ip = trim(
            $parts[0]
        );

        $prefix = trim(
            $parts[1]
        );

        if (
            filter_var(
                $ip,
                FILTER_VALIDATE_IP
            ) === false
        ) {
            throw new DomainException(
                'The CIDR IP address is invalid.'
            );
        }

        if (
            $prefix === '' ||
            !ctype_digit($prefix)
        ) {
            throw new DomainException(
                'The CIDR prefix is invalid.'
            );
        }

        $packed = inet_pton(
            $ip
        );

        if ($packed === false) {
            throw new DomainException(
                'The CIDR range is invalid.'
            );
        }

        $prefixLength = (int) $prefix;

        $maxPrefix =
            strlen($packed) * 8;

        if (
            $prefixLength < 0 ||
            $prefixLength > $maxPrefix
        ) {
            throw new DomainException(
                'The CIDR prefix is outside the valid range.'
            );
        }

        $bytes = unpack(
            'C*',
            $packed
        );

        $remainingBits =
            $prefixLength;

        foreach (
            $bytes as $index => $byte
        ) {
            if ($remainingBits >= 8) {
                $remainingBits -= 8;

                continue;
            }

            if ($remainingBits <= 0) {
                $bytes[$index] = 0;

                continue;
            }

            $mask = (
                0xFF <<
                (8 - $remainingBits)
            ) & 0xFF;

            $bytes[$index] =
                $byte & $mask;

            $remainingBits = 0;
        }

        $networkPacked = pack(
            'C*',
            ...array_values(
                $bytes
            )
        );

        $networkAddress =
            inet_ntop(
                $networkPacked
            );

        if ($networkAddress === false) {
            throw new DomainException(
                'The CIDR range is invalid.'
            );
        }

        return $networkAddress
            . '/'
            . $prefixLength;
    }

    public function isIpAllowed(
        string $tenantId,
        string $ipAddress
    ): bool {
        $policy = $this
            ->tenantIpAccessRepository
            ->findPolicyByTenant(
                $tenantId
            );

        if (!$policy?->enabled) {
            return true;
        }

        if (
            filter_var(
                $ipAddress,
                FILTER_VALIDATE_IP
            ) === false
        ) {
            return false;
        }

        $entries = $this
            ->tenantIpAccessRepository
            ->activeEntriesByTenant(
                $tenantId
            );

        foreach ($entries as $entry) {
            if (
                $this->ipMatchesRule(
                    $ipAddress,
                    $entry->ip_or_cidr
                )
            ) {
                return true;
            }
        }

        return false;
    }

    private function ipMatchesRule(
        string $ipAddress,
        string $rule
    ): bool {
        if (
            !str_contains(
                $rule,
                '/'
            )
        ) {
            $requestIp = inet_pton(
                $ipAddress
            );

            $allowedIp = inet_pton(
                $rule
            );

            if (
                $requestIp === false ||
                $allowedIp === false
            ) {
                return false;
            }

            return hash_equals(
                $allowedIp,
                $requestIp
            );
        }

        [$network, $prefix] = explode(
            '/',
            $rule,
            2
        );

        $requestIp = inet_pton(
            $ipAddress
        );

        $networkIp = inet_pton(
            $network
        );

        if (
            $requestIp === false ||
            $networkIp === false ||
            strlen($requestIp) !==
                strlen($networkIp)
        ) {
            return false;
        }

        $prefixLength = (int) $prefix;

        $maxBits =
            strlen($requestIp) * 8;

        if (
            $prefixLength < 0 ||
            $prefixLength > $maxBits
        ) {
            return false;
        }

        $fullBytes = intdiv(
            $prefixLength,
            8
        );

        $remainingBits =
            $prefixLength % 8;

        if ($fullBytes > 0) {
            if (
                substr(
                    $requestIp,
                    0,
                    $fullBytes
                ) !==
                substr(
                    $networkIp,
                    0,
                    $fullBytes
                )
            ) {
                return false;
            }
        }

        if ($remainingBits === 0) {
            return true;
        }

        $mask = (
            0xFF <<
            (8 - $remainingBits)
        ) & 0xFF;

        return (
            ord(
                $requestIp[$fullBytes]
            ) & $mask
        ) === (
            ord(
                $networkIp[$fullBytes]
            ) & $mask
        );
    }
}