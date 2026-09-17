<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Services\Archive\ArchiveService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    public function __construct(
        protected ArchiveService $archiveService
    ) {
    }

    public function index(
        Request $request,
        string $tenantId
    ): JsonResponse {
        $validated = $request->validate([
            'resource_type' => [
                'nullable',
                'string',
                'max:120',
            ],

            'search' => [
                'nullable',
                'string',
                'max:255',
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $filters = [
            'resource_type' =>
                $validated['resource_type'] ?? null,

            'search' =>
                $validated['search'] ?? null,
        ];

        $entries = $this
            ->archiveService
            ->listArchived(
                $tenantId,
                $filters,
                (int) (
                    $validated['per_page']
                    ?? 25
                )
            );

        return response()->json([
            'message' =>
                'Archived resources retrieved successfully.',

            'data' => $entries,
        ]);
    }

    public function show(
        Request $request,
        string $tenantId,
        string $archiveEntryId
    ): JsonResponse {
        try {
            $archiveEntry = $this
                ->archiveService
                ->viewArchived(
                    $tenantId,
                    $archiveEntryId,
                    $request->user('api'),
                    $request->ip(),
                    $request->userAgent(),
                    $request->method(),
                    $request->path()
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 404);
        }

        return response()->json([
            'message' =>
                'Archived resource retrieved successfully.',

            'data' => [
                'archive_entry' =>
                    $archiveEntry,
            ],
        ]);
    }
}
