import React from 'react'
import { Box, Container } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/auth/LoginForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoginForm />
      </Box>
    </Container>
  )
}

export default LoginPage
