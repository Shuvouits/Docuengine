<?php

namespace App\Services\AssetLayout;

use App\Models\AssetLayoutField;
use App\Models\AssetLayoutSection;
use App\Repositories\AssetLayoutFieldRepository;
use App\Repositories\AssetLayoutRepository;
use App\Repositories\AssetLayoutSectionRepository;
use App\Repositories\OptionListRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AssetLayoutFieldService
{
    public function __construct(
        private readonly AssetLayoutRepository $assetLayoutRepository,
        private readonly AssetLayoutSectionRepository $assetLayoutSectionRepository,
        private readonly AssetLayoutFieldRepository $assetLayoutFieldRepository,
        private readonly OptionListRepository $optionListRepository
    ) {
    }

    public function getAll(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): Collection {
        $this->ensureSectionExists(
            $tenantId,
            $layoutId,
            $sectionId
        );

        return $this->assetLayoutFieldRepository
            ->getAllBySection(
                $tenantId,
                $layoutId,
                $sectionId
            );
    }

    public function getById(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): AssetLayoutField {
        $this->ensureSectionExists(
            $tenantId,
            $layoutId,
            $sectionId
        );

        $field = $this->assetLayoutFieldRepository
            ->findById(
                $tenantId,
                $layoutId,
                $sectionId,
                $fieldId
            );

        if (!$field) {
            throw (new ModelNotFoundException())
                ->setModel(
                    AssetLayoutField::class,
                    [$fieldId]
                );
        }

        return $field;
    }

    public function create(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $userId,
        array $data
    ): AssetLayoutField {
        $this->ensureSectionExists(
            $tenantId,
            $layoutId,
            $sectionId
        );

        $fieldType = $data['field_type'];

        $this->validateFieldType($fieldType);

        $optionListId = $this->resolveOptionListId(
            tenantId: $tenantId,
            fieldType: $fieldType,
            optionListId: $data['option_list_id'] ?? null
        );

        $sortOrder = $data['sort_order']
            ?? $this->assetLayoutFieldRepository
                ->getNextSortOrder(
                    $tenantId,
                    $layoutId,
                    $sectionId
                );

        $fieldKey = $this->generateUniqueFieldKey(
            $tenantId,
            $layoutId,
            $data['name']
        );

        $field = $this->assetLayoutFieldRepository
            ->create([
                'tenant_id' => $tenantId,
                'asset_layout_id' => $layoutId,
                'section_id' => $sectionId,

                'name' => $data['name'],
                'field_key' => $fieldKey,
                'field_type' => $fieldType,
                'label' => $data['label'] ?? $data['name'],

                'description' => $data['description'] ?? null,
                'placeholder' => $data['placeholder'] ?? null,

                'sort_order' => $sortOrder,

                'is_required' => $data['is_required'] ?? false,
                'is_unique' => $data['is_unique'] ?? false,
                'is_visible' => $data['is_visible'] ?? true,

                'default_value' => $data['default_value'] ?? null,
                'validation_rules' => $data['validation_rules'] ?? null,
                'visibility_rules' => $data['visibility_rules'] ?? null,
                'settings' => $data['settings'] ?? null,

                'option_list_id' => $optionListId,

                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

        return $field->load('optionList.items');
    }

    public function update(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId,
        string $userId,
        array $data
    ): AssetLayoutField {
        $field = $this->getById(
            $tenantId,
            $layoutId,
            $sectionId,
            $fieldId
        );

        $fieldType = $data['field_type']
            ?? $field->field_type;

        $this->validateFieldType($fieldType);

        $optionListId = array_key_exists('option_list_id', $data)
            || array_key_exists('field_type', $data)
                ? $this->resolveOptionListId(
                    tenantId: $tenantId,
                    fieldType: $fieldType,
                    optionListId: $data['option_list_id']
                        ?? $field->option_list_id
                )
                : $field->option_list_id;

        $updateData = [];

        if (array_key_exists('name', $data)) {
            $updateData['name'] = $data['name'];
        }

        /*
         * field_key intentionally stays stable.
         * Renaming a field must not silently change its internal key.
         */

        if (array_key_exists('field_type', $data)) {
            $updateData['field_type'] = $fieldType;
        }

        if (array_key_exists('label', $data)) {
            $updateData['label'] = $data['label'];
        }

        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }

        if (array_key_exists('placeholder', $data)) {
            $updateData['placeholder'] = $data['placeholder'];
        }

        if (array_key_exists('sort_order', $data)) {
            $updateData['sort_order'] = $data['sort_order'];
        }

        if (array_key_exists('is_required', $data)) {
            $updateData['is_required'] = $data['is_required'];
        }

        if (array_key_exists('is_unique', $data)) {
            $updateData['is_unique'] = $data['is_unique'];
        }

        if (array_key_exists('is_visible', $data)) {
            $updateData['is_visible'] = $data['is_visible'];
        }

        if (array_key_exists('default_value', $data)) {
            $updateData['default_value'] = $data['default_value'];
        }

        if (array_key_exists('validation_rules', $data)) {
            $updateData['validation_rules'] =
                $data['validation_rules'];
        }

        if (array_key_exists('visibility_rules', $data)) {
            $updateData['visibility_rules'] =
                $data['visibility_rules'];
        }

        if (array_key_exists('settings', $data)) {
            $updateData['settings'] = $data['settings'];
        }

        if (
            array_key_exists('option_list_id', $data)
            || array_key_exists('field_type', $data)
        ) {
            $updateData['option_list_id'] = $optionListId;
        }

        $updateData['updated_by'] = $userId;

        return $this->assetLayoutFieldRepository
            ->update(
                $field,
                $updateData
            );
    }

    public function delete(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): void {
        $field = $this->getById(
            $tenantId,
            $layoutId,
            $sectionId,
            $fieldId
        );

        $this->assetLayoutFieldRepository
            ->delete($field);
    }

    public function restore(
        string $tenantId,
        string $layoutId,
        string $sectionId,
        string $fieldId
    ): AssetLayoutField {
        $this->ensureSectionExists(
            $tenantId,
            $layoutId,
            $sectionId
        );

        $field = $this->assetLayoutFieldRepository
            ->restore(
                $tenantId,
                $layoutId,
                $sectionId,
                $fieldId
            );

        if (!$field) {
            throw (new ModelNotFoundException())
                ->setModel(
                    AssetLayoutField::class,
                    [$fieldId]
                );
        }

        return $field;
    }

    private function ensureSectionExists(
        string $tenantId,
        string $layoutId,
        string $sectionId
    ): AssetLayoutSection {
        $layout = $this->assetLayoutRepository
            ->findById(
                $tenantId,
                $layoutId
            );

        if (!$layout) {
            throw (new ModelNotFoundException())
                ->setModel(
                    \App\Models\AssetLayout::class,
                    [$layoutId]
                );
        }

        $section = $this->assetLayoutSectionRepository
            ->findById(
                $tenantId,
                $layoutId,
                $sectionId
            );

        if (!$section) {
            throw (new ModelNotFoundException())
                ->setModel(
                    AssetLayoutSection::class,
                    [$sectionId]
                );
        }

        return $section;
    }

    private function validateFieldType(
        string $fieldType
    ): void {
        if (
            !in_array(
                $fieldType,
                AssetLayoutField::SUPPORTED_TYPES,
                true
            )
        ) {
            throw ValidationException::withMessages([
                'field_type' => [
                    'The selected field type is not supported.',
                ],
            ]);
        }
    }

    private function resolveOptionListId(
        string $tenantId,
        string $fieldType,
        ?string $optionListId
    ): ?string {
        $usesOptionList = in_array(
            $fieldType,
            [
                AssetLayoutField::TYPE_SELECT,
                AssetLayoutField::TYPE_MULTI_SELECT,
            ],
            true
        );

        if (!$usesOptionList) {
            return null;
        }

        if (!$optionListId) {
            throw ValidationException::withMessages([
                'option_list_id' => [
                    'An option list is required for select and multi-select fields.',
                ],
            ]);
        }

        $optionList = $this->optionListRepository
            ->findById(
                $tenantId,
                $optionListId
            );

        if (!$optionList) {
            throw ValidationException::withMessages([
                'option_list_id' => [
                    'The selected option list was not found.',
                ],
            ]);
        }

        return $optionList->id;
    }

    private function generateUniqueFieldKey(
        string $tenantId,
        string $layoutId,
        string $name
    ): string {
        $baseKey = Str::slug(
            $name,
            '_'
        );

        if ($baseKey === '') {
            $baseKey = 'field';
        }

        $fieldKey = $baseKey;
        $counter = 2;

        while (
            $this->assetLayoutFieldRepository
                ->findByFieldKey(
                    $tenantId,
                    $layoutId,
                    $fieldKey
                )
        ) {
            $fieldKey = $baseKey . '_' . $counter;

            $counter++;
        }

        return $fieldKey;
    }
}