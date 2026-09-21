<?php

namespace App\Services\AssetLayout;

use App\Repositories\AssetLayoutRepository;

class AssetLayoutBuilderService
{
    public function __construct(
        protected AssetLayoutRepository $assetLayoutRepository
    ) {
    }

    public function getBuilderData(
        string $tenantId,
        string $layoutId
    ): ?array {
        $layout = $this->assetLayoutRepository->findForBuilder(
            $tenantId,
            $layoutId
        );

        if (!$layout) {
            return null;
        }

        return [
            'id' => $layout->id,
            'tenant_id' => $layout->tenant_id,
            'name' => $layout->name,
            'slug' => $layout->slug,
            'description' => $layout->description,
            'status' => $layout->status,
            'current_version' => $layout->current_version,
            'is_template' => $layout->is_template,
            'is_active' => $layout->is_active,

            'sections' => $layout->sections
                ->map(function ($section) {
                    return [
                        'id' => $section->id,
                        'name' => $section->name,
                        'description' => $section->description,
                        'sort_order' => $section->sort_order,
                        'columns' => $section->columns,
                        'is_collapsible' => $section->is_collapsible,
                        'is_collapsed_by_default' => $section->is_collapsed_by_default,
                        'is_visible' => $section->is_visible,

                        'fields' => $section->fields
                            ->map(function ($field) {
                                return [
                                    'id' => $field->id,
                                    'name' => $field->name,
                                    'field_key' => $field->field_key,
                                    'field_type' => $field->field_type,
                                    'label' => $field->label,
                                    'description' => $field->description,
                                    'placeholder' => $field->placeholder,
                                    'sort_order' => $field->sort_order,
                                    'is_required' => $field->is_required,
                                    'is_unique' => $field->is_unique,
                                    'is_visible' => $field->is_visible,
                                    'default_value' => $field->default_value,
                                    'validation_rules' => $field->validation_rules,
                                    'visibility_rules' => $field->visibility_rules,
                                    'settings' => $field->settings,
                                    'option_list_id' => $field->option_list_id,

                                    'option_list' => $field->optionList
                                        ? [
                                            'id' => $field->optionList->id,
                                            'name' => $field->optionList->name,
                                            'slug' => $field->optionList->slug,
                                            'is_active' => $field->optionList->is_active,

                                            'items' => $field->optionList->items
                                                ->map(function ($item) {
                                                    return [
                                                        'id' => $item->id,
                                                        'label' => $item->label,
                                                        'value' => $item->value,
                                                        'sort_order' => $item->sort_order,
                                                        'is_active' => $item->is_active,
                                                    ];
                                                })
                                                ->values()
                                                ->all(),
                                        ]
                                        : null,
                                ];
                            })
                            ->values()
                            ->all(),
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}