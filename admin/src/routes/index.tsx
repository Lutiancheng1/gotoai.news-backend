import React from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import LoginPage from '@/pages/login'
import Dashboard from '@/pages/dashboard'
import UsersPage from '@/pages/users'
import NewsPage from '@/pages/news'
import TalentsPage from '@/pages/talents'
import SettingsPage from '@/pages/settings'
import CategoryPage from '@/pages/category'
import AppLayout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import Unauthorized from '@/pages/Unauthorized'
import FilesPage from '@/pages/settings/files'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'users',
        element: (
          <AuthGuard requiredRole="admin">
            <UsersPage />
          </AuthGuard>
        )
      },
      {
        path: 'news',
        element: <NewsPage />
      },
      {
        path: 'talents',
        element: <TalentsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'category',
        element: <CategoryPage />
      },
      {
        path: 'files',
        element: <FilesPage />
      },
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]
