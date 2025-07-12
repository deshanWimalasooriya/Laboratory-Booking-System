import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../common/Badge'
import { formatDate, formatTime } from '../../utils/dateUtils'
import { BOOKING_STATUS } from '../../utils/constants'

const UpcomingBookings = ({ bookings = [], isLoading }) => {
  const navigate = useNavigate()

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return 'success'
      case BOOKING_STATUS.PENDING:
        return 'warning'
      case BOOKING_STATUS.APPROVED:
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/bookings')}
        >
          View All
        </Button>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.lab?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.date)} at {formatTime(booking.timeSlot)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {booking.purpose}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  count={getStatusText(booking.status)}
                  variant={getStatusColor(booking.status)}
                  showZero
                />
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">No upcoming bookings</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/labs')}
          >
            Book a Lab
          </Button>
        </div>
      )}
    </Card>
  )
}

export default UpcomingBookings
