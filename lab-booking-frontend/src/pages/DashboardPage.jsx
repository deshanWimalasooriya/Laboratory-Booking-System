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
  BookOnline,
  Science,
  Biotech,
  TrendingUp,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBookings } from '../hooks/useBookings'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: bookings, isLoading, error } = useBookings({ limit: 5 })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  const stats = [
    {
      title: 'Active Bookings',
      value: bookings?.filter(b => b.status === 'confirmed').length || 0,
      icon: <BookOnline />,
      color: 'primary',
    },
    {
      title: 'Available Labs',
      value: '12',
      icon: <Science />,
      color: 'success',
    },
    {
      title: 'Equipment Items',
      value: '45',
      icon: <Biotech />,
      color: 'info',
    },
    {
      title: 'This Month',
      value: bookings?.length || 0,
      icon: <TrendingUp />,
      color: 'warning',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your laboratory bookings
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}.light`,
                      color: `${stat.color}.main`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bookings
              </Typography>
              {bookings?.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {bookings.slice(0, 5).map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {booking.lab?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.date} at {booking.timeSlot}
                        </Typography>
                      </Box>
                      <Chip
                        label={booking.status}
                        color={
                          booking.status === 'confirmed'
                            ? 'success'
                            : booking.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent bookings found
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/bookings')}>
                View All Bookings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<BookOnline />}
                  onClick={() => navigate('/bookings')}
                  fullWidth
                >
                  New Booking
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Science />}
                  onClick={() => navigate('/labs')}
                  fullWidth
                >
                  Browse Labs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Biotech />}
                  onClick={() => navigate('/equipment')}
                  fullWidth
                >
                  View Equipment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
