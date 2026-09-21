<?php

namespace App\Http\Requests\AssetLayout;

use App\Models\AssetLayoutField;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetLayoutFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'field_type' => [
                'required',
                'string',
                Rule::in(AssetLayoutField::SUPPORTED_TYPES),
            ],

            'label' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'placeholder' => [
                'nullable',
                'string',
                'max:500',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'is_required' => [
                'sometimes',
                'boolean',
            ],

            'is_unique' => [
                'sometimes',
                'boolean',
            ],

            'is_visible' => [
                'sometimes',
                'boolean',
            ],

            'default_value' => [
                'sometimes',
                'nullable',
            ],

            'validation_rules' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'visibility_rules' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'settings' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'option_list_id' => [
                'sometimes',
                'nullable',
                'uuid',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' =>
                'Field name is required.',

            'name.string' =>
                'Field name must be valid text.',

            'name.max' =>
                'Field name may not exceed 150 characters.',

            'field_type.required' =>
                'Field type is required.',

            'field_type.in' =>
                'The selected field type is not supported.',

            'label.required' =>
                'Field label cannot be empty.',

            'label.string' =>
                'Field label must be valid text.',

            'label.max' =>
                'Field label may not exceed 150 characters.',

            'description.string' =>
                'Description must be valid text.',

            'description.max' =>
                'Description may not exceed 5000 characters.',

            'placeholder.string' =>
                'Placeholder must be valid text.',

            'placeholder.max' =>
                'Placeholder may not exceed 500 characters.',

            'sort_order.integer' =>
                'Sort order must be an integer.',

            'sort_order.min' =>
                'Sort order cannot be negative.',

            'is_required.boolean' =>
                'Required status must be true or false.',

            'is_unique.boolean' =>
                'Unique status must be true or false.',

            'is_visible.boolean' =>
                'Visibility status must be true or false.',

            'validation_rules.array' =>
                'Validation rules must be an object or array.',

            'visibility_rules.array' =>
                'Visibility rules must be an object or array.',

            'settings.array' =>
                'Field settings must be an object or array.',

            'option_list_id.uuid' =>
                'Option list ID must be a valid UUID.',
        ];
    }
}