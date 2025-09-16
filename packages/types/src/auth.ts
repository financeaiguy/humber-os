export type UserRole = 'PARTNER_ADMIN' | 'PARTNER_OPERATOR' | 'ENGINEER_EMPLOYEE'

export type PartnerOrganization = {
  id: string
  name: string
  domain: string
  createdAt: Date
  updatedAt: Date
}

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  partnerId: string
  partner: PartnerOrganization
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
  partnerId: string
  partnerName: string
}

export type RolePermissions = {
  canViewAllPartners: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canManageProjects: boolean
  canViewTeam: boolean
  canManageClients: boolean
  canAccessBullPen: boolean
  canLogTime: boolean
  canViewKnowledge: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  PARTNER_ADMIN: {
    canViewAllPartners: false, // Only their own partner
    canManageUsers: true,
    canViewAnalytics: true,
    canManageProjects: true,
    canViewTeam: true,
    canManageClients: true,
    canAccessBullPen: true,
    canLogTime: true,
    canViewKnowledge: true,
  },
  PARTNER_OPERATOR: {
    canViewAllPartners: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageProjects: true,
    canViewTeam: true,
    canManageClients: false,
    canAccessBullPen: true,
    canLogTime: true,
    canViewKnowledge: true,
  },
  ENGINEER_EMPLOYEE: {
    canViewAllPartners: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageProjects: false,
    canViewTeam: false,
    canManageClients: false,
    canAccessBullPen: false,
    canLogTime: true,
    canViewKnowledge: true,
  },
}