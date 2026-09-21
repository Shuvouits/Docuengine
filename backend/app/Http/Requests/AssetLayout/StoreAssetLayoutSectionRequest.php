<?php

namespace App\Http\Requests\AssetLayout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetLayoutSectionRequest extends FormRequest
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

            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'columns' => [
                'sometimes',
                'integer',
                Rule::in([1, 2, 3]),
            ],

            'is_collapsible' => [
                'sometimes',
                'boolean',
            ],

            'is_collapsed_by_default' => [
                'sometimes',
                'boolean',
            ],

            'is_visible' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' =>
                'Section name is required.',

            'name.string' =>
                'Section name must be valid text.',

            'name.max' =>
                'Section name may not exceed 150 characters.',

            'description.string' =>
                'Description must be valid text.',

            'description.max' =>
                'Description may not exceed 5000 characters.',

            'sort_order.integer' =>
                'Sort order must be an integer.',

            'sort_order.min' =>
                'Sort order cannot be negative.',

            'columns.integer' =>
                'Columns must be an integer.',

            'columns.in' =>
                'Columns must be 1, 2, or 3.',

            'is_collapsible.boolean' =>
                'Collapsible status must be true or false.',

            'is_collapsed_by_default.boolean' =>
                'Collapsed by default status must be true or false.',

            'is_visible.boolean' =>
                'Visibility status must be true or false.',
        ];
    }
}