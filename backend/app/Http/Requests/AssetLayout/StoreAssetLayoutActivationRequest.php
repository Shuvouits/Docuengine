<?php

namespace App\Http\Requests\AssetLayout;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetLayoutActivationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => [
                'required',
                'uuid',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => 'Company ID is required.',
            'company_id.uuid' => 'Company ID must be a valid UUID.',
        ];
    }
}