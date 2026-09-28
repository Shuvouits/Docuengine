<?php

namespace App\Repositories;

use App\Models\AssetFieldValue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AssetFieldValueRepository
{
    /*
    |--------------------------------------------------------------------------
    | Base Tenant Query
    |--------------------------------------------------------------------------
    */

    public function queryForTenant(
        string $tenantId
    ): Builder {
        return AssetFieldValue::query()
            ->forTenant($tenantId);
    }

    /*
    |--------------------------------------------------------------------------
    | Values For Asset
    |--------------------------------------------------------------------------
    */

    public function getForAsset(
        string $tenantId,
        string $assetId
    ): Collection {
        return $this
            ->queryForTenant(
                $tenantId
            )
            ->forAsset(
                $assetId
            )
            ->with([
                'layoutField',
            ])
            ->orderBy(
                'created_at'
            )
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Find One Asset Field Value
    |--------------------------------------------------------------------------
    */

    public function findByAssetAndField(
        string $tenantId,
        string $assetId,
        string $fieldId
    ): ?AssetFieldValue {
        return $this
            ->queryForTenant(
                $tenantId
            )
            ->where(
                'asset_id',
                $assetId
            )
            ->where(
                'asset_layout_field_id',
                $fieldId
            )
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create(
        array $data
    ): AssetFieldValue {
        return AssetFieldValue::query()
            ->create(
                $data
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        AssetFieldValue $fieldValue,
        array $data
    ): AssetFieldValue {
        $fieldValue->fill(
            $data
        );

        $fieldValue->save();

        return $fieldValue
            ->refresh();
    }

    /*
    |--------------------------------------------------------------------------
    | Create Or Update
    |--------------------------------------------------------------------------
    */

    public function updateOrCreate(
        string $tenantId,
        string $assetId,
        string $fieldId,
        array $data
    ): AssetFieldValue {
        return AssetFieldValue::query()
            ->updateOrCreate(
                [
                    'tenant_id' =>
                        $tenantId,

                    'asset_id' =>
                        $assetId,

                    'asset_layout_field_id' =>
                        $fieldId,
                ],
                $data
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete One Value
    |--------------------------------------------------------------------------
    */

    public function delete(
        AssetFieldValue $fieldValue
    ): bool {
        return (bool)
            $fieldValue->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Asset Field Values
    |--------------------------------------------------------------------------
    */

    public function deleteForAsset(
        string $tenantId,
        string $assetId
    ): int {
        return $this
            ->queryForTenant(
                $tenantId
            )
            ->where(
                'asset_id',
                $assetId
            )
            ->delete();
    }

    /*
    |--------------------------------------------------------------------------
    | Field Value Exists
    |--------------------------------------------------------------------------
    */

    public function existsForAssetAndField(
        string $tenantId,
        string $assetId,
        string $fieldId
    ): bool {
        return $this
            ->queryForTenant(
                $tenantId
            )
            ->where(
                'asset_id',
                $assetId
            )
            ->where(
                'asset_layout_field_id',
                $fieldId
            )
            ->exists();
    }

    /*
    |--------------------------------------------------------------------------
    | Unique Field Value Check
    |--------------------------------------------------------------------------
    */

    public function uniqueValueExists(
        string $tenantId,
        string $fieldId,
        string $valueColumn,
        mixed $value,
        ?string $excludeAssetId = null
    ): bool {
        $allowedColumns = [
            'value_text',
            'value_number',
            'value_datetime',
            'value_boolean',
        ];

        if (
            !in_array(
                $valueColumn,
                $allowedColumns,
                true
            )
        ) {
            return false;
        }

        $query = $this
            ->queryForTenant(
                $tenantId
            )
            ->where(
                'asset_layout_field_id',
                $fieldId
            )
            ->where(
                $valueColumn,
                $value
            );

        if ($excludeAssetId) {
            $query->where(
                'asset_id',
                '!=',
                $excludeAssetId
            );
        }

        return $query->exists();
    }
}
