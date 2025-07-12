import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookings } from '../../hooks/useBookings'
import { useLabs } from '../../hooks/useLabs'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import Badge from '../common/Badge'
import { formatDate, getMonthDays, addDays, subtractDays } from '../../utils/dateUtils'
import { BOOKING_STATUS } from '../../utils/constants'

const BookingCalendar = () => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLab, setSelectedLab] = useState('')
  const [view, setView] = useState('month') // month, week

  const { data: labs } = useLabs()
  const { data: bookings, isLoading } = useBookings({
    dateFrom: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)),
    dateTo: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)),
    labId: selectedLab
  })

  const monthDays = useMemo(() => {
    return getMonthDays(currentDate)
  }, [currentDate])

  const getBookingsForDate = (date) => {
    if (!bookings) return []
    return bookings.filter(booking => 
      formatDate(booking.date) === formatDate(date)
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return 'success'
      case BOOKING_STATUS.APPROVED:
        return 'primary'
      case BOOKING_STATUS.PENDING:
        return 'warning'
      default:
        return 'default'
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (date) => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  const isPastDate = (date) => {
    const today = new Date()
    return date < today.setHours(0, 0, 0, 0)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner message="Loading calendar..." />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage laboratory bookings by date
          </p>
        </div>
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
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              placeholder="All Labs"
              className="w-48"
            >
              <option value="">All Laboratories</option>
              {labs?.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6">
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {monthDays.map((date, index) => {
            const dayBookings = getBookingsForDate(date)
            const isCurrentDay = isToday(date)
            const isPast = isPastDate(date)
            
            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                  ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                  ${isPast ? 'bg-gray-50 text-gray-400' : ''}
                `}
                onClick={() => !isPast && navigate(`/booking/new?date=${formatDate(date)}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-sm font-medium
                    ${isCurrentDay ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'}
                  `}>
                    {date.getDate()}
                  </span>
                  {dayBookings.length > 0 && (
                    <Badge count={dayBookings.length} size="sm" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${getStatusColor(booking.status) === 'success' ? 'bg-green-100 text-green-800' : ''}
                        ${getStatusColor(booking.status) === 'primary' ? 'bg-blue-100 text-blue-800' : ''}
                        ${getStatusColor(booking.status) === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/bookings/${booking.id}`)
                      }}
                    >
                      {booking.timeSlot} - {booking.lab?.name}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default BookingCalendar
