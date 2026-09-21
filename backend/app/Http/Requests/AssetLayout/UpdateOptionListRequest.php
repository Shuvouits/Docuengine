<?php

namespace App\Http\Requests\AssetLayout;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOptionListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
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
            'name.required' => 'Option list name is required.',
            'name.string' => 'Option list name must be a valid text value.',
            'name.max' => 'Option list name may not exceed 150 characters.',

            'description.string' => 'Description must be a valid text value.',

            'is_active.boolean' => 'Active status must be true or false.',
        ];
    }
}
