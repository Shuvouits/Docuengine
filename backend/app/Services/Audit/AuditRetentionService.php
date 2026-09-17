<?php

namespace App\Services\Audit;

use App\Repositories\AuditRetentionRepository;
use DomainException;

class AuditRetentionService
{
    public function __construct(
        private AuditRetentionRepository $auditRetentionRepository
    ) {
    }

    public function getPolicy(): array
    {
        $enabled = (bool) config(
            'audit.retention.enabled',
            true
        );

        $days = (int) config(
            'audit.retention.days',
            365
        );

        $chunkSize = (int) config(
            'audit.retention.chunk_size',
            1000
        );

        if ($days < 1) {
            throw new DomainException(
                'Audit retention days must be at least 1.'
            );
        }

        $chunkSize = max(
            1,
            min($chunkSize, 5000)
        );

        $cutoff = now()
            ->subDays($days);

        return [
            'enabled' => $enabled,
            'days' => $days,
            'chunk_size' => $chunkSize,
            'cutoff' => $cutoff,
        ];
    }

    public function preview(): array
    {
        $policy = $this->getPolicy();

        $expiredCount = $this
            ->auditRetentionRepository
            ->countOlderThan(
                $policy['cutoff']
            );

        return [
            'enabled' =>
                $policy['enabled'],

            'retention_days' =>
                $policy['days'],

            'chunk_size' =>
                $policy['chunk_size'],

            'cutoff' =>
                $policy['cutoff']->toISOString(),

            'expired_count' =>
                $expiredCount,
        ];
    }

    public function purge(): array
    {
        $policy = $this->getPolicy();

        if (!$policy['enabled']) {
            return [
                'enabled' => false,
                'retention_days' =>
                    $policy['days'],
                'cutoff' =>
                    $policy['cutoff']->toISOString(),
                'eligible_count' => 0,
                'deleted_count' => 0,
                'status' => 'disabled',
            ];
        }

        $eligibleCount = $this
            ->auditRetentionRepository
            ->countOlderThan(
                $policy['cutoff']
            );

        if ($eligibleCount === 0) {
            return [
                'enabled' => true,
                'retention_days' =>
                    $policy['days'],
                'cutoff' =>
                    $policy['cutoff']->toISOString(),
                'eligible_count' => 0,
                'deleted_count' => 0,
                'status' => 'nothing_to_purge',
            ];
        }

        $deletedCount = $this
            ->auditRetentionRepository
            ->purgeOlderThan(
                $policy['cutoff'],
                $policy['chunk_size']
            );

        return [
            'enabled' => true,
            'retention_days' =>
                $policy['days'],
            'cutoff' =>
                $policy['cutoff']->toISOString(),
            'eligible_count' =>
                $eligibleCount,
            'deleted_count' =>
                $deletedCount,
            'status' => 'completed',
        ];
    }
}