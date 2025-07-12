import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import LoadingSpinner from '../common/LoadingSpinner'

const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/unauthorized' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission, hasAnyRole } = usePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Verifying permissions..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )
    
    if (!hasAllPermissions) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  return children
}

export default RoleBasedRoute
