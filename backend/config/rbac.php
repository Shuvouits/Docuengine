<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Permission Definitions
    |--------------------------------------------------------------------------
    */

    'permissions' => [

        /*
        |--------------------------------------------------------------------------
        | User Management
        |--------------------------------------------------------------------------
        */

        'users.view',
        'users.invite',
        'users.create',
        'users.update',
        'users.suspend',
        'users.activate',
        'users.delete',

        /*
        |--------------------------------------------------------------------------
        | Roles & Permissions
        |--------------------------------------------------------------------------
        */

        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'roles.assign',

        /*
        |--------------------------------------------------------------------------
        | Security Groups
        |--------------------------------------------------------------------------
        */

        'security_groups.view',
        'security_groups.create',
        'security_groups.update',
        'security_groups.delete',
        'security_groups.assign',

        /*
        |--------------------------------------------------------------------------
        | Organization Configuration
        |--------------------------------------------------------------------------
        */

        'organization.view',
        'organization.update',

        /*
        |--------------------------------------------------------------------------
        | Security & Access
        |--------------------------------------------------------------------------
        */

        'security.sessions.view',
        'security.sessions.revoke',

        'security.events.view',

        'security.mfa.manage',

        'security.ip_allowlist.view',
        'security.ip_allowlist.manage',

        'access_reviews.view',
        'access_reviews.manage',

        /*
        |--------------------------------------------------------------------------
        | Module 4 - Audit & Activity
        |--------------------------------------------------------------------------
        */

        'audit.view',
        'audit.export',

        /*
        |--------------------------------------------------------------------------
        | Module 4 - Archive & Recovery
        |--------------------------------------------------------------------------
        */

        'archive.view',
        'archive.restore',
        'archive.delete_permanently',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Tenant Roles
    |--------------------------------------------------------------------------
    |
    | Platform Owner is NOT defined here.
    |
    | Platform Owner remains a global DocuEngine-level account using:
    |
    | users.is_platform_owner = true
    |
    */

    'roles' => [

        /*
        |--------------------------------------------------------------------------
        | MSP Admin
        |--------------------------------------------------------------------------
        */

        'msp_admin' => [
            'name' => 'MSP Admin',

            'permissions' => '*',
        ],

        /*
        |--------------------------------------------------------------------------
        | Editor
        |--------------------------------------------------------------------------
        */

        'editor' => [
            'name' => 'Editor',

            'permissions' => [
                'users.view',
                'organization.view',

                'audit.view',

                'archive.view',
                'archive.restore',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Author
        |--------------------------------------------------------------------------
        */

        'author' => [
            'name' => 'Author',

            'permissions' => [
                'organization.view',

                'archive.view',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Read-only Technician
        |--------------------------------------------------------------------------
        */

        'read_only_technician' => [
            'name' => 'Read-only Technician',

            'permissions' => [
                'users.view',
                'roles.view',
                'security_groups.view',
                'organization.view',
                'security.events.view',

                'audit.view',
                'archive.view',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | Portal Member
        |--------------------------------------------------------------------------
        */

        'portal_member' => [
            'name' => 'Portal Member',

            'permissions' => [],
        ],
    ],

];
