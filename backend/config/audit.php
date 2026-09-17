<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Audit Retention
    |--------------------------------------------------------------------------
    |
    | Audit events are immutable during their normal lifecycle.
    | Records older than the configured retention period may be removed
    | only by the dedicated retention process.
    |
    */

    'retention' => [

        'enabled' => env(
            'AUDIT_RETENTION_ENABLED',
            true
        ),

        'days' => (int) env(
            'AUDIT_RETENTION_DAYS',
            365
        ),

        'chunk_size' => (int) env(
            'AUDIT_RETENTION_CHUNK_SIZE',
            1000
        ),

    ],

];