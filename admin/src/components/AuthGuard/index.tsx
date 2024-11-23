import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user' | 'superAdmin'
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && !user?.role?.includes('admin')) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requiredRole === 'superAdmin' && user?.username !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default AuthGuard
