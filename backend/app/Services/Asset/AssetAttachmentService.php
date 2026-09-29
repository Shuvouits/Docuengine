<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetAttachment;
use App\Models\User;
use App\Repositories\AssetAttachmentRepository;
use App\Repositories\AssetRepository;
use App\Services\Company\CompanyAccessService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AssetAttachmentService
{
    private const FILE_MAX_BYTES = 26214400; // 25 MB
    private const PHOTO_MAX_BYTES = 10485760; // 10 MB

    private const FILE_MIME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream',
    ];

    private const PHOTO_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    public function __construct(
        private readonly AssetRepository $assetRepository,
        private readonly AssetAttachmentRepository $assetAttachmentRepository,
        private readonly CompanyAccessService $companyAccessService
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | List Attachments
    |--------------------------------------------------------------------------
    */

    public function getAll(
        string $tenantId,
        string $assetId,
        User $actor,
        ?string $type = null,
        int $perPage = 25
    ): LengthAwarePaginator {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $asset->company_id
            );

        if ($type !== null) {
            $this->validateAttachmentType(
                $type
            );
        }

        return $this
            ->assetAttachmentRepository
            ->paginateForAsset(
                tenantId: $tenantId,
                assetId: $assetId,
                type: $type,
                perPage: $perPage
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Single Attachment
    |--------------------------------------------------------------------------
    */

    public function getById(
        string $tenantId,
        string $assetId,
        string $attachmentId,
        User $actor
    ): AssetAttachment {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireView(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $attachment = $this
            ->assetAttachmentRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $attachmentId
            );

        if (!$attachment) {
            throw new DomainException(
                'Asset attachment not found.'
            );
        }

        return $attachment;
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Attachment
    |--------------------------------------------------------------------------
    */

    public function upload(
        string $tenantId,
        string $assetId,
        string $type,
        UploadedFile $file,
        User $actor
    ): AssetAttachment {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $this->validateAttachmentType(
            $type
        );

        $this->validateUploadedFile(
            $file,
            $type
        );

        $disk = (string) config(
            'filesystems.default',
            'local'
        );

        $originalName = trim(
            $file->getClientOriginalName()
        );

        if ($originalName === '') {
            $originalName = 'attachment';
        }

        $mimeType = $file->getMimeType();

        $extension = strtolower(
            (string) (
                $file->guessExtension()
                ?: $file->getClientOriginalExtension()
            )
        );

        $storedName = (string) Str::uuid();

        if ($extension !== '') {
            $storedName .= '.' . $extension;
        }

        $directory = implode(
            '/',
            [
                'tenants',
                $tenantId,
                'assets',
                $assetId,
                $type === AssetAttachment::TYPE_PHOTO
                    ? 'photos'
                    : 'files',
            ]
        );

        $path = $file->storeAs(
            $directory,
            $storedName,
            $disk
        );

        if (!$path) {
            throw new DomainException(
                'Unable to store the uploaded attachment.'
            );
        }

        try {
            $attachment = $this
                ->assetAttachmentRepository
                ->create([
                    'tenant_id' =>
                        $tenantId,

                    'asset_id' =>
                        $assetId,

                    'attachment_type' =>
                        $type,

                    'original_name' =>
                        $originalName,

                    'stored_name' =>
                        $storedName,

                    'disk' =>
                        $disk,

                    'path' =>
                        $path,

                    'mime_type' =>
                        $mimeType,

                    'extension' =>
                        $extension !== ''
                            ? $extension
                            : null,

                    'size_bytes' =>
                        (int) $file->getSize(),

                    'uploaded_by' =>
                        $actor->id,
                ]);
        } catch (Throwable $exception) {
            Storage::disk($disk)
                ->delete($path);

            throw $exception;
        }

        /*
        |--------------------------------------------------------------------------
        | Touch Parent Asset
        |--------------------------------------------------------------------------
        |
        | Adding a file/photo is an Asset change.
        | This keeps "Recently Updated Assets" accurate.
        |
        */

        $this
            ->assetRepository
            ->update(
                $asset,
                [
                    'updated_by' =>
                        $actor->id,
                ]
            );

        return $attachment;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Attachment
    |--------------------------------------------------------------------------
    */

    public function delete(
        string $tenantId,
        string $assetId,
        string $attachmentId,
        User $actor
    ): void {
        $asset = $this->requireAsset(
            $tenantId,
            $assetId
        );

        $this
            ->companyAccessService
            ->requireEdit(
                $tenantId,
                $actor,
                $asset->company_id
            );

        $attachment = $this
            ->assetAttachmentRepository
            ->findByTenantAssetAndId(
                $tenantId,
                $assetId,
                $attachmentId
            );

        if (!$attachment) {
            throw new DomainException(
                'Asset attachment not found.'
            );
        }

        $disk = $attachment->disk;
        $path = $attachment->path;

        $deleted = $this
            ->assetAttachmentRepository
            ->delete(
                $attachment
            );

        if (!$deleted) {
            throw new DomainException(
                'Unable to delete the asset attachment.'
            );
        }

        if (
            $path &&
            Storage::disk($disk)->exists($path)
        ) {
            Storage::disk($disk)
                ->delete($path);
        }

        $this
            ->assetRepository
            ->update(
                $asset,
                [
                    'updated_by' =>
                        $actor->id,
                ]
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Download Information
    |--------------------------------------------------------------------------
    */

    public function getDownloadData(
        string $tenantId,
        string $assetId,
        string $attachmentId,
        User $actor
    ): array {
        $attachment = $this->getById(
            $tenantId,
            $assetId,
            $attachmentId,
            $actor
        );

        if (
            !Storage::disk(
                $attachment->disk
            )->exists(
                $attachment->path
            )
        ) {
            throw new DomainException(
                'Attachment file could not be found in storage.'
            );
        }

        return [
            'attachment' =>
                $attachment,

            'disk' =>
                $attachment->disk,

            'path' =>
                $attachment->path,

            'download_name' =>
                $attachment->original_name,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Require Asset
    |--------------------------------------------------------------------------
    */

    private function requireAsset(
        string $tenantId,
        string $assetId
    ): Asset {
        $asset = $this
            ->assetRepository
            ->findByTenantAndId(
                $tenantId,
                $assetId
            );

        if (!$asset) {
            throw new DomainException(
                'Asset not found.'
            );
        }

        return $asset;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Attachment Type
    |--------------------------------------------------------------------------
    */

    private function validateAttachmentType(
        string $type
    ): void {
        if (
            !in_array(
                $type,
                [
                    AssetAttachment::TYPE_FILE,
                    AssetAttachment::TYPE_PHOTO,
                ],
                true
            )
        ) {
            throw ValidationException::withMessages([
                'attachment_type' => [
                    'Attachment type must be file or photo.',
                ],
            ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Uploaded File
    |--------------------------------------------------------------------------
    */

    private function validateUploadedFile(
        UploadedFile $file,
        string $type
    ): void {
        if (!$file->isValid()) {
            throw ValidationException::withMessages([
                'file' => [
                    'The uploaded file is invalid.',
                ],
            ]);
        }

        $size = (int) $file->getSize();

        if ($size <= 0) {
            throw ValidationException::withMessages([
                'file' => [
                    'The uploaded file is empty.',
                ],
            ]);
        }

        $mimeType = $file->getMimeType();

        if (
            $type === AssetAttachment::TYPE_PHOTO
        ) {
            if ($size > self::PHOTO_MAX_BYTES) {
                throw ValidationException::withMessages([
                    'file' => [
                        'Photos may not be greater than 10 MB.',
                    ],
                ]);
            }

            if (
                !$mimeType ||
                !in_array(
                    $mimeType,
                    self::PHOTO_MIME_TYPES,
                    true
                )
            ) {
                throw ValidationException::withMessages([
                    'file' => [
                        'Photo must be a JPG, PNG, WEBP, or GIF image.',
                    ],
                ]);
            }

            return;
        }

        if ($size > self::FILE_MAX_BYTES) {
            throw ValidationException::withMessages([
                'file' => [
                    'Files may not be greater than 25 MB.',
                ],
            ]);
        }

        if (
            !$mimeType ||
            !in_array(
                $mimeType,
                self::FILE_MIME_TYPES,
                true
            )
        ) {
            throw ValidationException::withMessages([
                'file' => [
                    'This file type is not supported.',
                ],
            ]);
        }
    }
}
