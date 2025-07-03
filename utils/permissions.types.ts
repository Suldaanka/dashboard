// TypeScript types for roles and permissions

export type RoleName =
  | 'ADMIN'
  | 'WAITER'
  | 'STAFF'
  | 'KITCHEN';

export type PermissionName =
  | 'dashboard'
  | 'rooms'
  | 'reservation'
  | 'menu'
  | 'tables'
  | 'orders'
  | 'expenses'
  | 'users'
  | 'employees'
  | 'settings';

export interface RolePermission {
  role: RoleName;
  permissions: PermissionName[];
}