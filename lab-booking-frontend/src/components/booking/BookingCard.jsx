import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../common/Badge'
import { formatDate, formatTime, formatRelativeTime } from '../../utils/dateUtils'
import { BOOKING_STATUS, PERMISSIONS } from '../../utils/constants'

const BookingCard = ({ booking, onCancel, onEdit, onApprove, onReject }) => {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return 'success'
      case BOOKING_STATUS.APPROVED:
        return 'primary'
      case BOOKING_STATUS.PENDING:
        return 'warning'
      case BOOKING_STATUS.CANCELLED:
        return 'danger'
      case BOOKING_STATUS.REJECTED:
        return 'danger'
      case BOOKING_STATUS.COMPLETED:
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const canEdit = () => {
    return [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED].includes(booking.status) &&
           hasPermission(PERMISSIONS.MANAGE_OWN_BOOKINGS)
  }

  const canCancel = () => {
    return [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED, BOOKING_STATUS.CONFIRMED].includes(booking.status)
  }

  const canApprove = () => {
    return booking.status === BOOKING_STATUS.PENDING &&
           hasPermission(PERMISSIONS.APPROVE_BOOKINGS)
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {booking.lab?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {booking.lab?.location}
              </p>
            </div>
          </div>
        </div>
        <Badge
          count={getStatusText(booking.status)}
          variant={getStatusColor(booking.status)}
          showZero
        />
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</p>
          <p className="text-sm text-gray-900 mt-1">
            {formatDate(booking.date, 'MMM DD, YYYY')}
          </p>
          <p className="text-sm text-gray-600">
            {formatTime(booking.timeSlot)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participants</p>
          <p className="text-sm text-gray-900 mt-1">
            {booking.participants} students
          </p>
        </div>
      </div>

      {/* Purpose */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purpose</p>
        <p className="text-sm text-gray-900 mt-1 line-clamp-2">
          {booking.purpose}
        </p>
      </div>

      {/* Equipment */}
      {booking.equipment && booking.equipment.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipment</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {booking.equipment.slice(0, 3).map((eq, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {eq.name}
              </span>
            ))}
            {booking.equipment.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{booking.equipment.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 mb-4">
        <p>Booked by: {booking.user?.name}</p>
        <p>Created: {formatRelativeTime(booking.createdAt)}</p>
        {booking.approvedBy && (
          <p>Approved by: {booking.approvedBy.name}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/bookings/${booking.id}`)}
        >
          View Details
        </Button>

        {canEdit() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(booking)}
          >
            Edit
          </Button>
        )}

        {canApprove() && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(booking)}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(booking)}
            >
              Reject
            </Button>
          </>
        )}

        {canCancel() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(booking)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  )
}

export default BookingCard
