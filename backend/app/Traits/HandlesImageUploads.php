<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

trait HandlesImageUploads
{
    /**
     * Upload an image directly inside the public folder.
     *
     * Example:
     * uploadImage($file, 'uploads/tenant-branding/123/logos');
     *
     * Returns:
     * uploads/tenant-branding/123/logos/abc123.png
     */
    public function uploadImage(
        UploadedFile $file,
        string $folder,
        ?string $oldPath = null,
        ?string $prefix = null
    ): string {
        $folder = trim($folder, '/');

        $destinationPath = public_path($folder);

        if (!File::exists($destinationPath)) {
            File::makeDirectory(
                $destinationPath,
                0755,
                true,
                true
            );
        }

        $extension = strtolower(
            $file->getClientOriginalExtension()
        );

        $fileName = sprintf(
            '%s%s.%s',
            $prefix ? Str::slug($prefix) . '-' : '',
            Str::uuid(),
            $extension
        );

        $file->move(
            $destinationPath,
            $fileName
        );

        $newPath = $folder . '/' . $fileName;

        if ($oldPath) {
            $this->deleteImage($oldPath);
        }

        return $newPath;
    }

    /**
     * Delete an image from the public folder.
     */
    public function deleteImage(?string $path): bool
    {
        if (!$path) {
            return false;
        }

        $path = ltrim($path, '/');

        /*
         * Protect against deleting files outside
         * our uploads directory.
         */
        if (!str_starts_with($path, 'uploads/')) {
            return false;
        }

        $fullPath = public_path($path);

        if (!File::exists($fullPath)) {
            return false;
        }

        return File::delete($fullPath);
    }

    /**
     * Convert stored relative path into browser-accessible URL.
     */
    public function imageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return asset(
            ltrim($path, '/')
        );
    }
}
