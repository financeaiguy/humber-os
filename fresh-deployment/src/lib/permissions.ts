import { UserRole, ROLE_PERMISSIONS, RolePermissions } from '@humber/types'

export function getUserPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role]
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getUserPermissions(role)
  return permissions[permission]
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const permissions = getUserPermissions(role)
  
  switch (route) {
    case '/analytics':
      return permissions.canViewAnalytics
    case '/projects':
    case '/projects/new':
      return permissions.canManageProjects
    case '/team':
      return permissions.canViewTeam
    case '/clients':
      return permissions.canManageClients
    case '/bull-pen':
      return permissions.canAccessBullPen
    case '/time':
      return permissions.canLogTime
    case '/knowledge':
      return permissions.canViewKnowledge
    default:
      return true // Home page and other basic routes
  }
}