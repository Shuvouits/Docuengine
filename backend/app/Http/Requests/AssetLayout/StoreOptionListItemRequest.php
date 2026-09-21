<?php

namespace App\Http\Requests\AssetLayout;

use Illuminate\Foundation\Http\FormRequest;

class StoreOptionListItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => [
                'required',
                'string',
                'max:150',
            ],

            'value' => [
                'sometimes',
                'nullable',
                'string',
                'max:170',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'label.required' => 'Option item label is required.',
            'label.string' => 'Option item label must be a valid text value.',
            'label.max' => 'Option item label may not exceed 150 characters.',

            'value.string' => 'Option item value must be a valid text value.',
            'value.max' => 'Option item value may not exceed 170 characters.',

            'sort_order.integer' => 'Sort order must be an integer.',
            'sort_order.min' => 'Sort order cannot be negative.',

            'is_active.boolean' => 'Active status must be true or false.',
        ];
    }
}
