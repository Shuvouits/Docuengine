<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\AssetAttachment;
use App\Services\Asset\AssetAttachmentService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssetAttachmentController extends Controller
{
    public function __construct(
        private readonly AssetAttachmentService $assetAttachmentService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Asset Attachments
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'attachment_type' => [
                'nullable',
                Rule::in([
                    AssetAttachment::TYPE_FILE,
                    AssetAttachment::TYPE_PHOTO,
                ]),
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        try {
            $attachments = $this
                ->assetAttachmentService
                ->getAll(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    actor: $request->user('api'),
                    type: $validated['attachment_type']
                        ?? null,
                    perPage: (int) (
                        $validated['per_page']
                        ?? 25
                    )
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset attachments retrieved successfully.',

            'data' => [
                'attachments' =>
                    collect(
                        $attachments->items()
                    )
                        ->map(
                            fn (
                                AssetAttachment $attachment
                            ) =>
                                $this->formatAttachment(
                                    $attachment
                                )
                        )
                        ->values()
                        ->all(),

                'pagination' => [
                    'current_page' =>
                        $attachments->currentPage(),

                    'last_page' =>
                        $attachments->lastPage(),

                    'per_page' =>
                        $attachments->perPage(),

                    'total' =>
                        $attachments->total(),

                    'from' =>
                        $attachments->firstItem(),

                    'to' =>
                        $attachments->lastItem(),
                ],
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Single Asset Attachment
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        string $tenantId,
        string $assetId,
        string $attachmentId
    ): JsonResponse {
        try {
            $attachment = $this
                ->assetAttachmentService
                ->getById(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    attachmentId: $attachmentId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset attachment retrieved successfully.',

            'data' => [
                'attachment' =>
                    $this->formatAttachment(
                        $attachment
                    ),
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Asset Attachment
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        string $tenantId,
        string $assetId
    ): JsonResponse {
        $validated = $request->validate([
            'attachment_type' => [
                'required',
                Rule::in([
                    AssetAttachment::TYPE_FILE,
                    AssetAttachment::TYPE_PHOTO,
                ]),
            ],

            'file' => [
                'required',
                'file',
            ],
        ]);

        try {
            $attachment = $this
                ->assetAttachmentService
                ->upload(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    type: $validated['attachment_type'],
                    file: $request->file('file'),
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset attachment uploaded successfully.',

            'data' => [
                'attachment' =>
                    $this->formatAttachment(
                        $attachment
                    ),
            ],
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Download Asset Attachment
    |--------------------------------------------------------------------------
    */

    public function download(
        Request $request,
        string $tenantId,
        string $assetId,
        string $attachmentId
    ): StreamedResponse|JsonResponse {
        try {
            $downloadData = $this
                ->assetAttachmentService
                ->getDownloadData(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    attachmentId: $attachmentId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        $attachment =
            $downloadData['attachment'];

        $headers = [];

        if ($attachment->mime_type) {
            $headers['Content-Type'] =
                $attachment->mime_type;
        }

        return Storage::disk(
            $downloadData['disk']
        )->download(
            $downloadData['path'],
            $downloadData['download_name'],
            $headers
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Asset Attachment
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        string $tenantId,
        string $assetId,
        string $attachmentId
    ): JsonResponse {
        try {
            $this
                ->assetAttachmentService
                ->delete(
                    tenantId: $tenantId,
                    assetId: $assetId,
                    attachmentId: $attachmentId,
                    actor: $request->user('api')
                );
        } catch (DomainException $exception) {
            return response()->json([
                'message' =>
                    $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Asset attachment deleted successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Format Attachment
    |--------------------------------------------------------------------------
    */

    private function formatAttachment(
        AssetAttachment $attachment
    ): array {
        return [
            'id' =>
                $attachment->id,

            'tenant_id' =>
                $attachment->tenant_id,

            'asset_id' =>
                $attachment->asset_id,

            'attachment_type' =>
                $attachment->attachment_type,

            'original_name' =>
                $attachment->original_name,

            'stored_name' =>
                $attachment->stored_name,

            'mime_type' =>
                $attachment->mime_type,

            'extension' =>
                $attachment->extension,

            'size_bytes' =>
                $attachment->size_bytes,

            'size_kb' =>
                $attachment->sizeInKilobytes(),

            'size_mb' =>
                $attachment->sizeInMegabytes(),

            'uploaded_by' =>
                $attachment->uploaded_by,

            'uploader' =>
                $attachment->relationLoaded(
                    'uploader'
                ) &&
                $attachment->uploader
                    ? [
                        'id' =>
                            $attachment
                                ->uploader
                                ->id,

                        'name' =>
                            $attachment
                                ->uploader
                                ->name,

                        'email' =>
                            $attachment
                                ->uploader
                                ->email,
                    ]
                    : null,

            'created_at' =>
                $attachment
                    ->created_at
                    ?->toISOString(),

            'updated_at' =>
                $attachment
                    ->updated_at
                    ?->toISOString(),
        ];
    }
}
