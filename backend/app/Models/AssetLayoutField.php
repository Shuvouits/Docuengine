<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetLayoutField extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'asset_layout_fields';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'tenant_id',
        'asset_layout_id',
        'section_id',
        'name',
        'field_key',
        'field_type',
        'label',
        'description',
        'placeholder',
        'sort_order',
        'is_required',
        'is_unique',
        'is_visible',
        'default_value',
        'validation_rules',
        'visibility_rules',
        'settings',
        'option_list_id',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_required' => 'boolean',
            'is_unique' => 'boolean',
            'is_visible' => 'boolean',
            'default_value' => 'array',
            'validation_rules' => 'array',
            'visibility_rules' => 'array',
            'settings' => 'array',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Supported Field Types
    |--------------------------------------------------------------------------
    */

    public const TYPE_TEXT = 'text';
    public const TYPE_RICH_TEXT = 'rich_text';
    public const TYPE_NUMBER = 'number';
    public const TYPE_DATE = 'date';
    public const TYPE_URL = 'url';
    public const TYPE_EMAIL = 'email';
    public const TYPE_PHONE = 'phone';
    public const TYPE_CHECKBOX = 'checkbox';
    public const TYPE_SELECT = 'select';
    public const TYPE_MULTI_SELECT = 'multi_select';
    public const TYPE_FILE = 'file';
    public const TYPE_RELATIONSHIP = 'relationship';

    public const SUPPORTED_TYPES = [
        self::TYPE_TEXT,
        self::TYPE_RICH_TEXT,
        self::TYPE_NUMBER,
        self::TYPE_DATE,
        self::TYPE_URL,
        self::TYPE_EMAIL,
        self::TYPE_PHONE,
        self::TYPE_CHECKBOX,
        self::TYPE_SELECT,
        self::TYPE_MULTI_SELECT,
        self::TYPE_FILE,
        self::TYPE_RELATIONSHIP,
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function layout(): BelongsTo
    {
        return $this->belongsTo(
            AssetLayout::class,
            'asset_layout_id'
        );
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(
            AssetLayoutSection::class,
            'section_id'
        );
    }

    public function optionList(): BelongsTo
    {
        return $this->belongsTo(
            OptionList::class,
            'option_list_id'
        );
    }
}
