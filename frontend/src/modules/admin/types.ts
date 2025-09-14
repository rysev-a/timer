export interface PermissionType {
  id: string;
  name: string;
  label: string;
  app: string;
  action: string;
}

export interface RoleType {
  id: string;
  name: string;
  label: string;
  permissions: PermissionType[];
}

export interface UserType {
  id: string;
  email: string;
  roles: RoleType[];
  is_enabled: boolean;
  is_active: boolean;
}
