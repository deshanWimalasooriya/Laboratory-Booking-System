import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material'
import { Search, Biotech } from '@mui/icons-material'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

const EquipmentPage = () => {
  // Mock data for now - replace with actual hook when equipment service is ready
  const isLoading = false
  const error = null
  const equipment = [
    {
      id: 1,
      name: 'Microscope - Olympus CX23',
      type: 'optical',
      lab: 'Biology Lab A',
      status: 'available',
      description: 'High-quality optical microscope for biological studies',
    },
    {
      id: 2,
      name: 'Centrifuge - Eppendorf 5424',
      type: 'mechanical',
      lab: 'Chemistry Lab B',
      status: 'in-use',
      description: 'High-speed centrifuge for sample preparation',
    },
    {
      id: 3,
      name: 'Spectrophotometer - UV-Vis',
      type: 'analytical',
      lab: 'Chemistry Lab A',
      status: 'available',
      description: 'UV-Visible spectrophotometer for chemical analysis',
    },
  ]

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'in-use':
        return 'warning'
      case 'maintenance':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'optical':
        return 'primary'
      case 'mechanical':
        return 'info'
      case 'analytical':
        return 'secondary'
      case 'electronic':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Laboratory Equipment
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Browse available equipment across all laboratories
      </Typography>

      <Box sx={{ mt: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search equipment..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {equipment?.length > 0 ? (
        <Grid container spacing={3}>
          {equipment.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={item.type}
                      color={getTypeColor(item.type)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Biotech sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Located in: {item.lab}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No equipment found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There is currently no equipment available for viewing.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default EquipmentPage
