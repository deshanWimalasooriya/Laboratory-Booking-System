import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import { NotificationProvider } from './hooks/useNotifications'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleBasedRoute from './components/auth/RoleBasedRoute'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import BookingPage from './pages/booking/BookingPage'
import LabsPage from './pages/laboratory/LabsPage'
import EquipmentPage from './pages/equipment/EquipmentPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/error/NotFoundPage'
import { USER_ROLES, PERMISSIONS } from './utils/constants'

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/bookings/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<BookingPage />} />
                    <Route path="new" element={<BookingForm />} />
                    <Route path=":id" element={<BookingDetails />} />
                    <Route path=":id/edit" element={<BookingForm />} />
                    <Route path="calendar" element={<BookingCalendar />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/labs/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<LabsPage />} />
                    <Route path=":id" element={<LabDetails />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/equipment/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<EquipmentPage />} />
                    <Route path=":id" element={<EquipmentDetails />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <RoleBasedRoute
                  allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.LECTURE_IN_CHARGE]}
                  requiredPermissions={[PERMISSIONS.MANAGE_USERS]}
                >
                  <Routes>
                    <Route path="users" element={<UserManagement />} />
                    <Route path="labs" element={<LabManagement />} />
                    <Route path="equipment" element={<EquipmentManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<SystemSettings />} />
                  </Routes>
                </RoleBasedRoute>
              }
            />
            
            {/* Error routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </NotificationProvider>
    </ToastProvider>
  )
}

export default App
