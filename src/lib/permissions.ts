// Permission types and role-based access control

import type { OrganizerRole } from '@prisma/client';

// All available permissions in the system
export type Permission =
  // Organization
  | 'org:settings:view'
  | 'org:settings:edit'
  | 'org:billing:manage'
  | 'org:team:view'
  | 'org:team:invite'
  | 'org:team:manage'
  // Events
  | 'event:create'
  | 'event:edit'
  | 'event:delete'
  | 'event:view'
  // Landing page
  | 'landing:edit'
  | 'landing:view'
  // Form builder
  | 'form:edit'
  | 'form:view'
  // Registrations
  | 'registration:view'
  | 'registration:manage'
  | 'registration:email'
  // Finance
  | 'finance:view'
  | 'finance:refund';

// Permission matrix for each role
export const ROLE_PERMISSIONS: Record<OrganizerRole, Permission[]> = {
  OWNER: [
    // Organization
    'org:settings:view',
    'org:settings:edit',
    'org:billing:manage',
    'org:team:view',
    'org:team:invite',
    'org:team:manage',
    // Events
    'event:create',
    'event:edit',
    'event:delete',
    'event:view',
    // Landing page
    'landing:edit',
    'landing:view',
    // Form builder
    'form:edit',
    'form:view',
    // Registrations
    'registration:view',
    'registration:manage',
    'registration:email',
    // Finance
    'finance:view',
    'finance:refund',
  ],
  ADMIN: [
    // Organization
    'org:settings:view',
    'org:settings:edit',
    'org:team:view',
    'org:team:invite',
    // Events
    'event:create',
    'event:edit',
    'event:delete',
    'event:view',
    // Landing page
    'landing:edit',
    'landing:view',
    // Form builder
    'form:edit',
    'form:view',
    // Registrations
    'registration:view',
    'registration:manage',
    'registration:email',
    // Finance
    'finance:view',
    'finance:refund',
  ],
  SITE_MANAGER: [
    // Organization
    'org:settings:view',
    // Events
    'event:view',
    // Landing page
    'landing:edit',
    'landing:view',
    // Form builder
    'form:view',
    // Registrations
    'registration:view',
  ],
  FINANCE_MANAGER: [
    // Organization
    'org:settings:view',
    'org:billing:manage',
    // Events
    'event:view',
    // Landing page
    'landing:view',
    // Form builder
    'form:view',
    // Registrations
    'registration:view',
    // Finance
    'finance:view',
    'finance:refund',
  ],
  REGISTRATION_MANAGER: [
    // Organization
    'org:settings:view',
    // Events
    'event:view',
    // Landing page
    'landing:view',
    // Form builder
    'form:edit',
    'form:view',
    // Registrations
    'registration:view',
    'registration:manage',
    'registration:email',
  ],
  VIEWER: [
    // Organization
    'org:settings:view',
    // Events
    'event:view',
    // Landing page
    'landing:view',
    // Form builder
    'form:view',
    // Registrations
    'registration:view',
    // Finance
    'finance:view',
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: OrganizerRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Get all permissions for a role
export function getPermissions(role: OrganizerRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// Check if a role has any of the given permissions
export function hasAnyPermission(role: OrganizerRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

// Check if a role has all of the given permissions
export function hasAllPermissions(role: OrganizerRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<OrganizerRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  SITE_MANAGER: 'Site Manager',
  FINANCE_MANAGER: 'Finance Manager',
  REGISTRATION_MANAGER: 'Registration Manager',
  VIEWER: 'Viewer',
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS: Record<OrganizerRole, string> = {
  OWNER: 'Full access including billing and team management',
  ADMIN: 'Full event management, no billing access',
  SITE_MANAGER: 'Landing page design only',
  FINANCE_MANAGER: 'Payment and finance operations only',
  REGISTRATION_MANAGER: 'Registration management only',
  VIEWER: 'Read-only access to everything',
};

// Get roles that can be assigned by a given role
export function getAssignableRoles(role: OrganizerRole): OrganizerRole[] {
  switch (role) {
    case 'OWNER':
      return ['ADMIN', 'SITE_MANAGER', 'FINANCE_MANAGER', 'REGISTRATION_MANAGER', 'VIEWER'];
    case 'ADMIN':
      return ['SITE_MANAGER', 'FINANCE_MANAGER', 'REGISTRATION_MANAGER', 'VIEWER'];
    default:
      return [];
  }
}

// Check if a role can manage another role
export function canManageRole(managerRole: OrganizerRole, targetRole: OrganizerRole): boolean {
  if (managerRole === 'OWNER') return targetRole !== 'OWNER';
  if (managerRole === 'ADMIN') return !['OWNER', 'ADMIN'].includes(targetRole);
  return false;
}
