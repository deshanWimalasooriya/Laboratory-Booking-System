import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material'
import {
  Science,
  LocationOn,
  People,
  BookOnline,
} from '@mui/icons-material'
import { useLabs } from '../hooks/useLabs'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

const LabsPage = () => {
  const { data: labs, isLoading, error } = useLabs()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  const getLabTypeColor = (type) => {
    switch (type) {
      case 'computer':
        return 'primary'
      case 'chemistry':
        return 'warning'
      case 'physics':
        return 'info'
      case 'biology':
        return 'success'
      case 'engineering':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Laboratories
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Browse and book laboratory facilities
      </Typography>

      {labs?.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {labs.map((lab) => (
            <Grid item xs={12} md={6} lg={4} key={lab.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {lab.name}
                    </Typography>
                    <Chip
                      label={lab.type}
                      color={getLabTypeColor(lab.type)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lab.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {lab.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {lab.capacity} students
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Science sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {lab.equipment?.length || 0} equipment items
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<BookOnline />}
                    fullWidth
                    onClick={() => {/* Handle booking */}}
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No laboratories found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are currently no laboratories available for booking.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default LabsPage
