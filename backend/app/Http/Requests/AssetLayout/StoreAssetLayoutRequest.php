<?php

namespace App\Http\Requests\AssetLayout;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetLayoutRequest extends FormRequest
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

            'is_template' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Asset layout name is required.',
            'name.string' => 'Asset layout name must be valid text.',
            'name.max' => 'Asset layout name may not exceed 150 characters.',

            'description.string' => 'Description must be valid text.',
            'description.max' => 'Description may not exceed 5000 characters.',

            'is_template.boolean' => 'Template status must be true or false.',
        ];
    }
}