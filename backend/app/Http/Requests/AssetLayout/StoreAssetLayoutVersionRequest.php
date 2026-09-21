<?php

namespace App\Http\Requests\AssetLayout;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetLayoutVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'change_summary' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}