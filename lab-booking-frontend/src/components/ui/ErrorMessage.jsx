import React from 'react'
import { Alert, AlertTitle } from '@mui/material'

const ErrorMessage = ({ error, title = 'Error' }) => {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {error?.message || error || 'An unexpected error occurred'}
    </Alert>
  )
}

export default ErrorMessage
