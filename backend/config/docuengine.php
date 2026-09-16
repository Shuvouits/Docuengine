<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Platform
    |--------------------------------------------------------------------------
    */

    'platform' => [
        'name' => env('DOCUENGINE_NAME', 'DocuEngine'),

        'environment' => env(
            'DOCUENGINE_ENVIRONMENT',
            env('APP_ENV', 'production')
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Defaults
    |--------------------------------------------------------------------------
    */

    'tenant_defaults' => [
        'locale' => env(
            'DOCUENGINE_DEFAULT_LOCALE',
            'en'
        ),

        'timezone' => env(
            'DOCUENGINE_DEFAULT_TIMEZONE',
            'UTC'
        ),

        'date_format' => env(
            'DOCUENGINE_DEFAULT_DATE_FORMAT',
            'Y-m-d'
        ),

        'time_format' => env(
            'DOCUENGINE_DEFAULT_TIME_FORMAT',
            'H:i'
        ),

        'week_start' => env(
            'DOCUENGINE_DEFAULT_WEEK_START',
            'monday'
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Registry
    |--------------------------------------------------------------------------
    |
    | These are tenant-level optional capabilities.
    |
    | Core functionality such as authentication, users, roles, MFA,
    | sessions and security groups should not be feature flags.
    |
    */

    'feature_flags' => [
        'client_portal' => false,
        'ai_assistant' => false,

        'access_reviews' => false,
        'ip_access' => false,
        'security_events' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Terminology Defaults
    |--------------------------------------------------------------------------
    */

    'terminology_defaults' => [
        'client' => 'Client',
        'company' => 'Company',
        'asset' => 'Asset',
        'contact' => 'Contact',
        'document' => 'Document',
        'knowledge_base' => 'Knowledge Base',
    ],

    /*
    |--------------------------------------------------------------------------
    | Supported Locales
    |--------------------------------------------------------------------------
    */

    'supported_locales' => [
        'en' => 'English',
        'en-US' => 'English (United States)',
        'en-GB' => 'English (United Kingdom)',
    ],

    /*
    |--------------------------------------------------------------------------
    | Date Formats
    |--------------------------------------------------------------------------
    */

    'date_formats' => [
        'Y-m-d' => '2026-09-06',
        'd-m-Y' => '06-09-2026',
        'm-d-Y' => '09-06-2026',
        'd/m/Y' => '06/09/2026',
        'm/d/Y' => '09/06/2026',
    ],

    /*
    |--------------------------------------------------------------------------
    | Time Formats
    |--------------------------------------------------------------------------
    */

    'time_formats' => [
        'H:i' => '24 Hour (14:30)',
        'h:i A' => '12 Hour (02:30 PM)',
    ],

    /*
    |--------------------------------------------------------------------------
    | Week Start Options
    |--------------------------------------------------------------------------
    */

    'week_start_options' => [
        'monday' => 'Monday',
        'sunday' => 'Sunday',
    ],

];
