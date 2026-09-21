<?php

namespace App\Services\AssetLayout;

use App\Repositories\AssetLayoutRepository;

class AssetLayoutValidationService
{
    public function __construct(
        protected AssetLayoutRepository $assetLayoutRepository
    ) {
    }

    /**
     * Validate whether an asset layout is structurally ready.
     */
    public function validate(string $tenantId, string $layoutId): array
    {
        $layout = $this->assetLayoutRepository->findForValidation(
            $tenantId,
            $layoutId
        );

        if (!$layout) {
            return [
                'valid' => false,
                'errors' => [
                    [
                        'code' => 'layout_not_found',
                        'message' => 'Asset layout not found.',
                    ],
                ],
            ];
        }

        $errors = [];

        $visibleSections = $layout->sections
            ->where('is_visible', true);

        if ($visibleSections->isEmpty()) {
            $errors[] = [
                'code' => 'layout_has_no_visible_sections',
                'message' => 'The asset layout must contain at least one visible section.',
            ];
        }

        foreach ($visibleSections as $section) {
            $visibleFields = $section->fields
                ->where('is_visible', true);

            if ($visibleFields->isEmpty()) {
                $errors[] = [
                    'code' => 'section_has_no_visible_fields',
                    'section_id' => $section->id,
                    'message' => "Section '{$section->name}' must contain at least one visible field.",
                ];
            }

            foreach ($visibleFields as $field) {
                $requiresOptionList = in_array(
                    $field->field_type,
                    ['select', 'multi_select'],
                    true
                );

                if (!$requiresOptionList) {
                    continue;
                }

                if (!$field->option_list_id) {
                    $errors[] = [
                        'code' => 'field_requires_option_list',
                        'section_id' => $section->id,
                        'field_id' => $field->id,
                        'message' => "Field '{$field->name}' requires an option list.",
                    ];

                    continue;
                }

                if (!$field->optionList) {
                    $errors[] = [
                        'code' => 'field_option_list_missing',
                        'section_id' => $section->id,
                        'field_id' => $field->id,
                        'message' => "The option list for field '{$field->name}' could not be found.",
                    ];

                    continue;
                }

                if (!$field->optionList->is_active) {
                    $errors[] = [
                        'code' => 'field_option_list_inactive',
                        'section_id' => $section->id,
                        'field_id' => $field->id,
                        'message' => "The option list for field '{$field->name}' is inactive.",
                    ];
                }

                $activeItems = $field->optionList->items
                    ->where('is_active', true);

                if ($activeItems->isEmpty()) {
                    $errors[] = [
                        'code' => 'field_option_list_has_no_active_items',
                        'section_id' => $section->id,
                        'field_id' => $field->id,
                        'message' => "The option list for field '{$field->name}' must contain at least one active item.",
                    ];
                }
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }
}