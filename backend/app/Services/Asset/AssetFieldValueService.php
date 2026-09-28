<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetLayoutField;
use App\Repositories\AssetFieldValueRepository;
use App\Repositories\OptionListItemRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class AssetFieldValueService
{
    public function __construct(
        private readonly AssetFieldValueRepository $assetFieldValueRepository,
        private readonly OptionListItemRepository $optionListItemRepository
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Create Asset Field Values
    |--------------------------------------------------------------------------
    */

    public function createValues(
        string $tenantId,
        Asset $asset,
        Collection $fields,
        array $values,
        string $userId
    ): void {
        $this->ensureNoUnknownFields(
            $fields,
            $values
        );

        foreach ($fields as $field) {
            $hasInput = array_key_exists(
                $field->field_key,
                $values
            );

            $value = $hasInput
                ? $values[$field->field_key]
                : $field->default_value;

            if (
                !$hasInput &&
                $field->default_value === null
            ) {
                if ($field->is_required) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} is required."
                    );
                }

                continue;
            }

            if ($this->isEmptyValue($value)) {
                if ($field->is_required) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} is required."
                    );
                }

                continue;
            }

            $this->saveFieldValue(
                tenantId: $tenantId,
                asset: $asset,
                field: $field,
                value: $value,
                userId: $userId
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Asset Field Values
    |--------------------------------------------------------------------------
    */

    public function updateValues(
        string $tenantId,
        Asset $asset,
        Collection $fields,
        array $values,
        string $userId
    ): void {
        $this->ensureNoUnknownFields(
            $fields,
            $values
        );

        $fieldsByKey = $fields
            ->keyBy('field_key');

        foreach ($values as $fieldKey => $value) {
            /** @var AssetLayoutField|null $field */
            $field = $fieldsByKey->get(
                $fieldKey
            );

            if (!$field) {
                continue;
            }

            if ($this->isEmptyValue($value)) {
                if ($field->is_required) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} is required."
                    );
                }

                $existing = $this
                    ->assetFieldValueRepository
                    ->findByAssetAndField(
                        $tenantId,
                        $asset->id,
                        $field->id
                    );

                if ($existing) {
                    $this
                        ->assetFieldValueRepository
                        ->delete(
                            $existing
                        );
                }

                continue;
            }

            $this->saveFieldValue(
                tenantId: $tenantId,
                asset: $asset,
                field: $field,
                value: $value,
                userId: $userId
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Save One Field Value
    |--------------------------------------------------------------------------
    */

    private function saveFieldValue(
        string $tenantId,
        Asset $asset,
        AssetLayoutField $field,
        mixed $value,
        string $userId
    ): void {
        $storage = $this->normalizeForStorage(
            $tenantId,
            $field,
            $value
        );

        if ($field->is_unique) {
            $this->validateUniqueValue(
                tenantId: $tenantId,
                asset: $asset,
                field: $field,
                storage: $storage
            );
        }

        $existing = $this
            ->assetFieldValueRepository
            ->findByAssetAndField(
                $tenantId,
                $asset->id,
                $field->id
            );

        $payload = [
            'field_key' =>
                $field->field_key,

            'field_type' =>
                $field->field_type,

            'value_text' =>
                $storage['value_text'],

            'value_number' =>
                $storage['value_number'],

            'value_datetime' =>
                $storage['value_datetime'],

            'value_boolean' =>
                $storage['value_boolean'],

            'value_json' =>
                $storage['value_json'],

            'data_source' =>
                'manual',

            'source_provider' =>
                null,

            'source_reference' =>
                null,

            'updated_by' =>
                $userId,
        ];

        if ($existing) {
            $this
                ->assetFieldValueRepository
                ->update(
                    $existing,
                    $payload
                );

            return;
        }

        $payload['tenant_id'] =
            $tenantId;

        $payload['asset_id'] =
            $asset->id;

        $payload['asset_layout_field_id'] =
            $field->id;

        $payload['created_by'] =
            $userId;

        $this
            ->assetFieldValueRepository
            ->create(
                $payload
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Value For Storage
    |--------------------------------------------------------------------------
    */

    private function normalizeForStorage(
        string $tenantId,
        AssetLayoutField $field,
        mixed $value
    ): array {
        $storage = [
            'value_text' => null,
            'value_number' => null,
            'value_datetime' => null,
            'value_boolean' => null,
            'value_json' => null,
        ];

        switch ($field->field_type) {
            case AssetLayoutField::TYPE_TEXT:
            case AssetLayoutField::TYPE_RICH_TEXT:
            case AssetLayoutField::TYPE_PHONE:
                $storage['value_text'] =
                    $this->normalizeString(
                        $field,
                        $value
                    );

                break;

            case AssetLayoutField::TYPE_URL:
                $text = $this->normalizeString(
                    $field,
                    $value
                );

                if (
                    filter_var(
                        $text,
                        FILTER_VALIDATE_URL
                    ) === false
                ) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} must be a valid URL."
                    );
                }

                $storage['value_text'] =
                    $text;

                break;

            case AssetLayoutField::TYPE_EMAIL:
                $text = strtolower(
                    $this->normalizeString(
                        $field,
                        $value
                    )
                );

                if (
                    filter_var(
                        $text,
                        FILTER_VALIDATE_EMAIL
                    ) === false
                ) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} must be a valid email address."
                    );
                }

                $storage['value_text'] =
                    $text;

                break;

            case AssetLayoutField::TYPE_NUMBER:
                if (!is_numeric($value)) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} must be a number."
                    );
                }

                $storage['value_number'] =
                    $value;

                break;

            case AssetLayoutField::TYPE_DATE:
                $storage['value_datetime'] =
                    $this->normalizeDate(
                        $field,
                        $value
                    );

                break;

            case AssetLayoutField::TYPE_CHECKBOX:
                $storage['value_boolean'] =
                    $this->normalizeBoolean(
                        $field,
                        $value
                    );

                break;

            case AssetLayoutField::TYPE_SELECT:
                $selectedValue =
                    $this->normalizeString(
                        $field,
                        $value
                    );

                $this->validateOptionValue(
                    $tenantId,
                    $field,
                    $selectedValue
                );

                $storage['value_text'] =
                    $selectedValue;

                break;

            case AssetLayoutField::TYPE_MULTI_SELECT:
                if (!is_array($value)) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} must contain a list of selected values."
                    );
                }

                $selectedValues = array_values(
                    array_unique(
                        array_map(
                            fn ($item) =>
                                trim((string) $item),
                            $value
                        )
                    )
                );

                foreach ($selectedValues as $selectedValue) {
                    if ($selectedValue === '') {
                        $this->throwFieldError(
                            $field,
                            "{$field->label} contains an invalid option."
                        );
                    }

                    $this->validateOptionValue(
                        $tenantId,
                        $field,
                        $selectedValue
                    );
                }

                $storage['value_json'] =
                    $selectedValues;

                break;

            case AssetLayoutField::TYPE_FILE:
            case AssetLayoutField::TYPE_RELATIONSHIP:
                if (!is_array($value)) {
                    $this->throwFieldError(
                        $field,
                        "{$field->label} must contain structured data."
                    );
                }

                $storage['value_json'] =
                    $value;

                break;

            default:
                $this->throwFieldError(
                    $field,
                    "The field type for {$field->label} is not supported."
                );
        }

        return $storage;
    }

    /*
    |--------------------------------------------------------------------------
    | Option List Validation
    |--------------------------------------------------------------------------
    */

    private function validateOptionValue(
        string $tenantId,
        AssetLayoutField $field,
        string $value
    ): void {
        if (!$field->option_list_id) {
            $this->throwFieldError(
                $field,
                "{$field->label} does not have a configured option list."
            );
        }

        $item = $this
            ->optionListItemRepository
            ->findByValue(
                $tenantId,
                $field->option_list_id,
                $value
            );

        if (
            !$item ||
            !$item->is_active
        ) {
            $this->throwFieldError(
                $field,
                "The selected value for {$field->label} is invalid."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Unique Value Validation
    |--------------------------------------------------------------------------
    */

    private function validateUniqueValue(
        string $tenantId,
        Asset $asset,
        AssetLayoutField $field,
        array $storage
    ): void {
        $column = null;
        $value = null;

        if ($storage['value_text'] !== null) {
            $column =
                'value_text';

            $value =
                $storage['value_text'];
        } elseif (
            $storage['value_number'] !== null
        ) {
            $column =
                'value_number';

            $value =
                $storage['value_number'];
        } elseif (
            $storage['value_datetime'] !== null
        ) {
            $column =
                'value_datetime';

            $value =
                $storage['value_datetime'];
        } elseif (
            $storage['value_boolean'] !== null
        ) {
            $column =
                'value_boolean';

            $value =
                $storage['value_boolean'];
        }

        if (!$column) {
            $this->throwFieldError(
                $field,
                "Unique validation is not supported for {$field->label}'s field type."
            );
        }

        $exists = $this
            ->assetFieldValueRepository
            ->uniqueValueExists(
                tenantId: $tenantId,
                fieldId: $field->id,
                valueColumn: $column,
                value: $value,
                excludeAssetId: $asset->id
            );

        if ($exists) {
            $this->throwFieldError(
                $field,
                "{$field->label} must be unique."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Unknown Field Protection
    |--------------------------------------------------------------------------
    */

    private function ensureNoUnknownFields(
        Collection $fields,
        array $values
    ): void {
        $allowedKeys = $fields
            ->pluck('field_key')
            ->all();

        foreach (
            array_keys($values)
            as $fieldKey
        ) {
            if (
                !in_array(
                    $fieldKey,
                    $allowedKeys,
                    true
                )
            ) {
                throw ValidationException::withMessages([
                    "fields.{$fieldKey}" => [
                        'This field does not belong to the selected Asset Layout.',
                    ],
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | String Normalization
    |--------------------------------------------------------------------------
    */

    private function normalizeString(
        AssetLayoutField $field,
        mixed $value
    ): string {
        if (
            is_array($value) ||
            is_object($value)
        ) {
            $this->throwFieldError(
                $field,
                "{$field->label} must be text."
            );
        }

        $value = trim(
            (string) $value
        );

        if ($value === '') {
            $this->throwFieldError(
                $field,
                "{$field->label} cannot be empty."
            );
        }

        return $value;
    }

    /*
    |--------------------------------------------------------------------------
    | Date Normalization
    |--------------------------------------------------------------------------
    */

    private function normalizeDate(
        AssetLayoutField $field,
        mixed $value
    ): Carbon {
        if (
            is_array($value) ||
            is_object($value)
        ) {
            $this->throwFieldError(
                $field,
                "{$field->label} must be a valid date."
            );
        }

        $value = trim(
            (string) $value
        );

        try {
            $date = Carbon::createFromFormat(
                'Y-m-d',
                $value
            );
        } catch (\Throwable) {
            $date = null;
        }

        if (
            !$date ||
            $date->format('Y-m-d') !==
                $value
        ) {
            $this->throwFieldError(
                $field,
                "{$field->label} must use the YYYY-MM-DD format."
            );
        }

        return $date->startOfDay();
    }

    /*
    |--------------------------------------------------------------------------
    | Boolean Normalization
    |--------------------------------------------------------------------------
    */

    private function normalizeBoolean(
        AssetLayoutField $field,
        mixed $value
    ): bool {
        if (is_bool($value)) {
            return $value;
        }

        if (
            in_array(
                $value,
                [
                    1,
                    '1',
                    'true',
                    'yes',
                    'on',
                ],
                true
            )
        ) {
            return true;
        }

        if (
            in_array(
                $value,
                [
                    0,
                    '0',
                    'false',
                    'no',
                    'off',
                ],
                true
            )
        ) {
            return false;
        }

        $this->throwFieldError(
            $field,
            "{$field->label} must be true or false."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Empty Value Check
    |--------------------------------------------------------------------------
    */

    private function isEmptyValue(
        mixed $value
    ): bool {
        if ($value === null) {
            return true;
        }

        if (
            is_string($value) &&
            trim($value) === ''
        ) {
            return true;
        }

        if (
            is_array($value) &&
            count($value) === 0
        ) {
            return true;
        }

        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | Validation Error
    |--------------------------------------------------------------------------
    */

    private function throwFieldError(
        AssetLayoutField $field,
        string $message
    ): never {
        throw ValidationException::withMessages([
            "fields.{$field->field_key}" => [
                $message,
            ],
        ]);
    }
}
