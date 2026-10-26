/** Role template keys from ROLE-001 (customizable later). */
export const ROLE_KEYS = [
  'main_admin',
  'manager',
  'agent',
  'marketing_editor',
  'external_partner',
  'viewer',
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

/**
 * Permission keys: `resource:action`.
 * Enforced in the API service layer (never only in the UI).
 */
export const PERMISSION_KEYS = [
  'properties:read',
  'properties:write',
  'properties:publish',
  'properties:delete',
  'catalog:read',
  'catalog:write',
  'calculators:read',
  'calculators:write',
  'inquiries:read',
  'inquiries:write',
  'contacts:read',
  'contacts:write',
  'users:read',
  'users:write',
  'roles:read',
  'roles:write',
  'content:read',
  'content:write',
  'content:publish',
  'reports:read',
  'reports:export',
  'finance:read',
  'audit:read',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

/** Default permission sets for each role template (R1 baseline). */
export const ROLE_PERMISSIONS: Record<RoleKey, readonly PermissionKey[]> = {
  main_admin: PERMISSION_KEYS,
  manager: [
    'properties:read',
    'properties:write',
    'properties:publish',
    'properties:delete',
    'catalog:read',
    'catalog:write',
    'calculators:read',
    'calculators:write',
    'inquiries:read',
    'inquiries:write',
    'contacts:read',
    'contacts:write',
    'users:read',
    'content:read',
    'content:write',
    'content:publish',
    'reports:read',
    'reports:export',
    'finance:read',
    'audit:read',
  ],
  agent: [
    'properties:read',
    'properties:write',
    'catalog:read',
    'calculators:read',
    'inquiries:read',
    'inquiries:write',
    'contacts:read',
    'contacts:write',
    'content:read',
    'reports:read',
  ],
  marketing_editor: [
    'properties:read',
    'catalog:read',
    'content:read',
    'content:write',
    'content:publish',
    'reports:read',
  ],
  external_partner: ['properties:read', 'content:read'],
  viewer: [
    'properties:read',
    'catalog:read',
    'calculators:read',
    'inquiries:read',
    'contacts:read',
    'content:read',
    'reports:read',
  ],
};
