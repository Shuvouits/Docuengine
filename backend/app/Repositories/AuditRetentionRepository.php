<?php

namespace App\Repositories;

use App\Models\AuditEvent;
use Carbon\CarbonInterface;

class AuditRetentionRepository
{
    public function purgeOlderThan(
        CarbonInterface $cutoff,
        int $chunkSize = 1000
    ): int {
        $chunkSize = max(
            1,
            min($chunkSize, 5000)
        );

        $totalDeleted = 0;

        while (true) {
            $eventIds = AuditEvent::query()
                ->where(
                    'occurred_at',
                    '<',
                    $cutoff
                )
                ->orderBy('occurred_at')
                ->limit($chunkSize)
                ->pluck('id');

            if ($eventIds->isEmpty()) {
                break;
            }

            $deleted = AuditEvent::query()
                ->whereIn(
                    'id',
                    $eventIds
                )
                ->delete();

            $totalDeleted += $deleted;

            if ($deleted < $chunkSize) {
                break;
            }
        }

        return $totalDeleted;
    }

    public function countOlderThan(
        CarbonInterface $cutoff
    ): int {
        return AuditEvent::query()
            ->where(
                'occurred_at',
                '<',
                $cutoff
            )
            ->count();
    }
}