<?php

namespace App\Console\Commands;

use App\Services\Audit\AuditRetentionService;
use Illuminate\Console\Command;

class PurgeAuditEvents extends Command
{
    protected $signature = 'audit:retention
                            {--preview : Show retention status without deleting audit events}';

    protected $description =
        'Apply the configured audit event retention policy.';

    public function __construct(
        private AuditRetentionService $auditRetentionService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if ($this->option('preview')) {
            $result = $this
                ->auditRetentionService
                ->preview();

            $this->info(
                'Audit retention preview'
            );

            $this->table(
                [
                    'Setting',
                    'Value',
                ],
                [
                    [
                        'Enabled',
                        $result['enabled']
                            ? 'Yes'
                            : 'No',
                    ],
                    [
                        'Retention Days',
                        $result['retention_days'],
                    ],
                    [
                        'Chunk Size',
                        $result['chunk_size'],
                    ],
                    [
                        'Cutoff',
                        $result['cutoff'],
                    ],
                    [
                        'Expired Records',
                        $result['expired_count'],
                    ],
                ]
            );

            return self::SUCCESS;
        }

        $result = $this
            ->auditRetentionService
            ->purge();

        $this->info(
            'Audit retention process completed.'
        );

        $this->table(
            [
                'Setting',
                'Value',
            ],
            [
                [
                    'Enabled',
                    $result['enabled']
                        ? 'Yes'
                        : 'No',
                ],
                [
                    'Status',
                    $result['status'],
                ],
                [
                    'Retention Days',
                    $result['retention_days'],
                ],
                [
                    'Cutoff',
                    $result['cutoff'],
                ],
                [
                    'Eligible Records',
                    $result['eligible_count'],
                ],
                [
                    'Deleted Records',
                    $result['deleted_count'],
                ],
            ]
        );

        return self::SUCCESS;
    }
}