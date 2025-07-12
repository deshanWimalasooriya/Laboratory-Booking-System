import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BookingsPage from './pages/BookingsPage'
import LabsPage from './pages/LabsPage'
import EquipmentPage from './pages/EquipmentPage'
import ProfilePage from './pages/ProfilePage'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/labs" element={<LabsPage />} />
                  <Route path="/equipment" element={<EquipmentPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  )
}

export default App
