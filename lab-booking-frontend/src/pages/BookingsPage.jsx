import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material'
import { useBookings, useDeleteBooking } from '../hooks/useBookings'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatDate, formatDateTime } from '../utils/dateUtils'

const BookingsPage = () => {
  const { data: bookings, isLoading, error } = useBookings()
  const deleteBookingMutation = useDeleteBooking()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  const handleDeleteClick = (booking) => {
    setSelectedBooking(booking)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteBookingMutation.mutateAsync(selectedBooking.id)
      setDeleteDialogOpen(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleViewClick = (booking) => {
    setSelectedBooking(booking)
    setViewDialogOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'completed':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Bookings</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* Handle new booking */}}
        >
          New Booking
        </Button>
      </Box>

      {bookings?.length > 0 ? (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} lg={4} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {booking.lab?.name}
                    </Typography>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Date:</strong> {formatDate(booking.date)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Time:</strong> {booking.timeSlot}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Purpose:</strong> {booking.purpose}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Created:</strong> {formatDateTime(booking.createdAt)}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(booking)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {/* Handle edit */}}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(booking)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You haven't made any laboratory bookings yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ mt: 2 }}
              onClick={() => {/* Handle new booking */}}
            >
              Create Your First Booking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Booking Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Laboratory:</strong> {selectedBooking.lab?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date:</strong> {formatDate(selectedBooking.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Time Slot:</strong> {selectedBooking.timeSlot}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Purpose:</strong> {selectedBooking.purpose}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedBooking.status}
                  color={getStatusColor(selectedBooking.status)}
                  size="small"
                />
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Created:</strong> {formatDateTime(selectedBooking.createdAt)}
              </Typography>
              {selectedBooking.equipment?.length > 0 && (
                <Typography variant="body1" gutterBottom>
                  <strong>Equipment:</strong>{' '}
                  {selectedBooking.equipment.map(eq => eq.name).join(', ')}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking"
        message={`Are you sure you want to delete the booking for ${selectedBooking?.lab?.name}?`}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  )
}

export default BookingsPage
