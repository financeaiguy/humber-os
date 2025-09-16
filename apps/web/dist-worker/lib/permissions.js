import { ROLE_PERMISSIONS } from '@humber/types';
export function getUserPermissions(role) {
    return ROLE_PERMISSIONS[role];
}
export function hasPermission(role, permission) {
    const permissions = getUserPermissions(role);
    return permissions[permission];
}
export function canAccessRoute(role, route) {
    const permissions = getUserPermissions(role);
    switch (route) {
        case '/analytics':
            return permissions.canViewAnalytics;
        case '/projects':
        case '/projects/new':
            return permissions.canManageProjects;
        case '/team':
            return permissions.canViewTeam;
        case '/clients':
            return permissions.canManageClients;
        case '/bull-pen':
            return permissions.canAccessBullPen;
        case '/time':
            return permissions.canLogTime;
        case '/knowledge':
            return permissions.canViewKnowledge;
        default:
            return true;
    }
}
//# sourceMappingURL=permissions.js.map