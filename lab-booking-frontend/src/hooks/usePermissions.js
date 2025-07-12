import { useAuth } from './useAuth'
import { USER_ROLES, PERMISSIONS } from '../utils/constants'

export const usePermissions = () => {
  const { user } = useAuth()

  const rolePermissions = {
    [USER_ROLES.ADMIN]: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_LABS,
      PERMISSIONS.MANAGE_EQUIPMENT,
      PERMISSIONS.MANAGE_BOOKINGS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.SYSTEM_SETTINGS
    ],
    [USER_ROLES.LECTURE_IN_CHARGE]: [
      PERMISSIONS.MANAGE_LABS,
      PERMISSIONS.MANAGE_EQUIPMENT,
      PERMISSIONS.APPROVE_BOOKINGS,
      PERMISSIONS.VIEW_ANALYTICS
    ],
    [USER_ROLES.TECHNICAL_OFFICER]: [
      PERMISSIONS.MANAGE_EQUIPMENT,
      PERMISSIONS.APPROVE_BOOKINGS,
      PERMISSIONS.VIEW_BOOKINGS
    ],
    [USER_ROLES.INSTRUCTOR]: [
      PERMISSIONS.CREATE_BOOKINGS,
      PERMISSIONS.VIEW_BOOKINGS,
      PERMISSIONS.MANAGE_OWN_BOOKINGS
    ],
    [USER_ROLES.STUDENT]: [
      PERMISSIONS.CREATE_BOOKINGS,
      PERMISSIONS.VIEW_OWN_BOOKINGS,
      PERMISSIONS.MANAGE_OWN_BOOKINGS
    ]
  }

  const hasPermission = (permission) => {
    if (!user || !user.role) return false
    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  const isAdmin = () => hasRole(USER_ROLES.ADMIN)
  const isLectureInCharge = () => hasRole(USER_ROLES.LECTURE_IN_CHARGE)
  const isTechnicalOfficer = () => hasRole(USER_ROLES.TECHNICAL_OFFICER)
  const isInstructor = () => hasRole(USER_ROLES.INSTRUCTOR)
  const isStudent = () => hasRole(USER_ROLES.STUDENT)

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isLectureInCharge,
    isTechnicalOfficer,
    isInstructor,
    isStudent,
    userPermissions: rolePermissions[user?.role] || []
  }
}
