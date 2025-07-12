import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookings, useDeleteBooking, useUpdateBooking } from '../../hooks/useBookings'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../hooks/useToast'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import ConfirmDialog from '../common/ConfirmDialog'
import BookingCard from './BookingCard'
import { BOOKING_STATUS, PERMISSIONS } from '../../utils/constants'

const BookingList = () => {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { showToast } = useToast()
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    labId: ''
  })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', booking: null })

  const { data: bookings, isLoading, error } = useBookings(filters)
  const deleteBookingMutation = useDeleteBooking()
  const updateBookingMutation = useUpdateBooking()

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      labId: ''
    })
  }

  const handleCancel = (booking) => {
    setConfirmDialog({
      open: true,
      type: 'cancel',
      booking,
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel the booking for ${booking.lab?.name}?`
    })
  }

  const handleApprove = (booking) => {
    setConfirmDialog({
      open: true,
      type: 'approve',
      booking,
      title: 'Approve Booking',
      message: `Are you sure you want to approve the booking for ${booking.lab?.name}?`
    })
  }

  const handleReject = (booking) => {
    setConfirmDialog({
      open: true,
      type: 'reject',
      booking,
      title: 'Reject Booking',
      message: `Are you sure you want to reject the booking for ${booking.lab?.name}?`
    })
  }

  const handleConfirmAction = async () => {
    const { type, booking } = confirmDialog
    
    try {
      switch (type) {
        case 'cancel':
          await updateBookingMutation.mutateAsync({
            id: booking.id,
            data: { status: BOOKING_STATUS.CANCELLED }
          })
          showToast('Booking cancelled successfully', 'success')
          break
        case 'approve':
          await updateBookingMutation.mutateAsync({
            id: booking.id,
            data: { status: BOOKING_STATUS.APPROVED }
          })
          showToast('Booking approved successfully', 'success')
          break
        case 'reject':
          await updateBookingMutation.mutateAsync({
            id: booking.id,
            data: { status: BOOKING_STATUS.REJECTED }
          })
          showToast('Booking rejected successfully', 'success')
          break
        case 'delete':
          await deleteBookingMutation.mutateAsync(booking.id)
          showToast('Booking deleted successfully', 'success')
          break
      }
    } catch (error) {
      showToast(error.message || `Failed to ${type} booking`, 'error')
    } finally {
      setConfirmDialog({ open: false, type: '', booking: null })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-6">
              <LoadingSpinner size="sm" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Failed to load bookings"
          description={error.message}
          action={() => window.location.reload()}
          actionText="Try Again"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your laboratory bookings and reservations
          </p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_BOOKINGS) && (
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => navigate('/booking/new')}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Booking
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Search bookings..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              placeholder="All Status"
            >
              <option value="">All Status</option>
              {Object.entries(BOOKING_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {bookings && bookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={() => handleCancel(booking)}
              onEdit={() => navigate(`/booking/${booking.id}/edit`)}
              onApprove={() => handleApprove(booking)}
              onReject={() => handleReject(booking)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="No bookings found"
          description={
            Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'You haven\'t made any laboratory bookings yet.'
          }
          action={
            Object.values(filters).some(f => f) 
              ? clearFilters 
              : () => navigate('/booking/new')
          }
          actionText={
            Object.values(filters).some(f => f) 
              ? "Clear Filters" 
              : "Create Your First Booking"
          }
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', booking: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
        severity={confirmDialog.type === 'delete' || confirmDialog.type === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  )
}

export default BookingList
