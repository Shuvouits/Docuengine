<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Audit\AuditEventService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditEventController extends Controller
{
    public function __construct(
        private AuditEventService $auditEventService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Global Tenant Audit Log
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'action' => [
                'nullable',
                'string',
                'max:100',
            ],

            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            'actor_user_id' => [
                'nullable',
                'uuid',
            ],

            'target_type' => [
                'nullable',
                'string',
                'max:120',
            ],

            'target_id' => [
                'nullable',
                'string',
                'max:100',
            ],

            'from' => [
                'nullable',
                'date',
            ],

            'to' => [
                'nullable',
                'date',
                'after_or_equal:from',
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $filters = [
            'action' =>
                $validated['action'] ?? null,

            'category' =>
                $validated['category'] ?? null,

            'actor_user_id' =>
                $validated['actor_user_id'] ?? null,

            'target_type' =>
                $validated['target_type'] ?? null,

            'target_id' =>
                $validated['target_id'] ?? null,

            'from' =>
                $validated['from'] ?? null,

            'to' =>
                $validated['to'] ?? null,
        ];

        $events = $this
            ->auditEventService
            ->listTenantEvents(
                $tenantId,
                $filters,
                (int) (
                    $validated['per_page']
                    ?? 25
                )
            );

        return response()->json([
            'message' =>
                'Audit events retrieved successfully.',

            'data' => $events,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Audit Event Details
    |--------------------------------------------------------------------------
    */

    public function show(
        string $tenantId,
        string $eventId
    ): JsonResponse {
        try {
            $event = $this
                ->auditEventService
                ->getTenantEvent(
                    $tenantId,
                    $eventId
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Audit event retrieved successfully.',

            'data' => [
                'event' => $event,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Per-record Activity Timeline
    |--------------------------------------------------------------------------
    */

    public function activity(
        Request $request,
        string $tenantId,
        string $targetType,
        string $targetId
    ): JsonResponse {
        $validated = $request->validate([
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $events = $this
            ->auditEventService
            ->getTargetActivity(
                $tenantId,
                $targetType,
                $targetId,
                (int) (
                    $validated['per_page']
                    ?? 25
                )
            );

        return response()->json([
            'message' =>
                'Record activity retrieved successfully.',

            'data' => $events,
        ]);
    }


    public function export(
    Request $request,
    string $tenantId
): \Symfony\Component\HttpFoundation\StreamedResponse {
    $validated = $request->validate([
        'action' => [
            'nullable',
            'string',
            'max:100',
        ],

        'category' => [
            'nullable',
            'string',
            'max:100',
        ],

        'actor_user_id' => [
            'nullable',
            'string',
            'max:100',
        ],

        'target_type' => [
            'nullable',
            'string',
            'max:120',
        ],

        'target_id' => [
            'nullable',
            'string',
            'max:100',
        ],

        'from' => [
            'nullable',
            'date',
        ],

        'to' => [
            'nullable',
            'date',
            'after_or_equal:from',
        ],
    ]);

    $events = $this
        ->auditEventService
        ->exportTenantEvents(
            tenantId: $tenantId,
            filters: $validated,
            actor: $request->user('api'),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            requestMethod: $request->method(),
            requestPath: $request->path()
        );

    $fileName =
        'audit-log-' .
        now()->format('Y-m-d-His') .
        '.csv';

    return response()->streamDownload(
        function () use ($events) {
            $handle = fopen(
                'php://output',
                'w'
            );

            fputcsv(
                $handle,
                [
                    'Event ID',
                    'Occurred At',
                    'Tenant ID',
                    'Actor User ID',
                    'Actor Name',
                    'Actor Email',
                    'Action',
                    'Category',
                    'Target Type',
                    'Target ID',
                    'Target Label',
                    'Description',
                    'IP Address',
                    'User Agent',
                    'Request Method',
                    'Request Path',
                    'Changes',
                    'Metadata',
                ]
            );

            foreach ($events as $event) {
                $actorSnapshot =
                    $event->actor_snapshot ?? [];

                fputcsv(
                    $handle,
                    [
                        $this->csvSafe(
                            $event->id
                        ),

                        $this->csvSafe(
                            $event->occurred_at?->toISOString()
                        ),

                        $this->csvSafe(
                            $event->tenant_id
                        ),

                        $this->csvSafe(
                            $event->actor_user_id
                        ),

                        $this->csvSafe(
                            $actorSnapshot['name']
                                ?? null
                        ),

                        $this->csvSafe(
                            $actorSnapshot['email']
                                ?? null
                        ),

                        $this->csvSafe(
                            $event->action
                        ),

                        $this->csvSafe(
                            $event->category
                        ),

                        $this->csvSafe(
                            $event->target_type
                        ),

                        $this->csvSafe(
                            $event->target_id
                        ),

                        $this->csvSafe(
                            $event->target_label
                        ),

                        $this->csvSafe(
                            $event->description
                        ),

                        $this->csvSafe(
                            $event->ip_address
                        ),

                        $this->csvSafe(
                            $event->user_agent
                        ),

                        $this->csvSafe(
                            $event->request_method
                        ),

                        $this->csvSafe(
                            $event->request_path
                        ),

                        $this->csvSafe(
                            $event->changes
                                ? json_encode(
                                    $event->changes,
                                    JSON_UNESCAPED_UNICODE |
                                    JSON_UNESCAPED_SLASHES
                                )
                                : null
                        ),

                        $this->csvSafe(
                            $event->metadata
                                ? json_encode(
                                    $event->metadata,
                                    JSON_UNESCAPED_UNICODE |
                                    JSON_UNESCAPED_SLASHES
                                )
                                : null
                        ),
                    ]
                );
            }

            fclose($handle);
        },
        $fileName,
        [
            'Content-Type' =>
                'text/csv; charset=UTF-8',

            'Cache-Control' =>
                'no-store, no-cache, must-revalidate',

            'Pragma' =>
                'no-cache',
        ]
    );
}



private function csvSafe(
    mixed $value
): string {
    if ($value === null) {
        return '';
    }

    $value = (string) $value;

    if (
        $value !== '' &&
        in_array(
            $value[0],
            [
                '=',
                '+',
                '-',
                '@',
            ],
            true
        )
    ) {
        return "'" . $value;
    }

    return $value;
}




}
