<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Security\SecurityEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityEventController extends Controller
{
    public function __construct(
        private SecurityEventService $securityEventService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'event_type' => [
                'nullable',
                'string',
                'max:100',
            ],
            'category' => [
                'nullable',
                'string',
                'max:50',
            ],
            'severity' => [
                'nullable',
                'in:info,warning,critical',
            ],
            'actor_user_id' => [
                'nullable',
                'uuid',
            ],
            'subject_user_id' => [
                'nullable',
                'uuid',
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
            'event_type' =>
                $validated['event_type'] ?? null,

            'category' =>
                $validated['category'] ?? null,

            'severity' =>
                $validated['severity'] ?? null,

            'actor_user_id' =>
                $validated['actor_user_id'] ?? null,

            'subject_user_id' =>
                $validated['subject_user_id'] ?? null,

            'from' =>
                $validated['from'] ?? null,

            'to' =>
                $validated['to'] ?? null,
        ];

        $events = $this
            ->securityEventService
            ->listTenantEvents(
                $tenantId,
                $filters,
                (int) ($validated['per_page'] ?? 25)
            );

        return response()->json([
            'message' => 'Security events retrieved successfully.',
            'data' => $events,
        ]);
    }

    public function show(
        string $tenantId,
        string $eventId
    ): JsonResponse {
        $event = $this
            ->securityEventService
            ->getTenantEvent(
                $tenantId,
                $eventId
            );

        return response()->json([
            'message' => 'Security event retrieved successfully.',
            'data' => [
                'event' => $event,
            ],
        ]);
    }
}