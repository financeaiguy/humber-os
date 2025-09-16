import { UserRole, RolePermissions } from '@humber/types';
export declare function getUserPermissions(role: UserRole): RolePermissions;
export declare function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean;
export declare function canAccessRoute(role: UserRole, route: string): boolean;
//# sourceMappingURL=permissions.d.ts.map