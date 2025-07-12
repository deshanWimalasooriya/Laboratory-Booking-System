import React, { useState } from 'react'
import { useSchedule } from '../../hooks/useSchedule'
import { useLabs } from '../../hooks/useLabs'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDate, getWeekDays, addDays, subtractDays } from '../../utils/dateUtils'
import { TIME_SLOTS } from '../../utils/constants'

const ScheduleView = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLab, setSelectedLab] = useState('')
  const [view, setView] = useState('week') // week, day

  const { data: labs } = useLabs()
  const { data: schedule, isLoading } = useSchedule({
    labId: selectedLab,
    startDate: formatDate(currentDate),
    view
  })

  const weekDays = getWeekDays(currentDate)

  const navigateWeek = (direction) => {
    const newDate = addDays(currentDate, direction * 7)
    setCurrentDate(newDate)
  }

  const navigateDay = (direction) => {
    const newDate = addDays(currentDate, direction)
    setCurrentDate(newDate)
  }

  const getBookingForSlot = (date, timeSlot, labId = null) => {
    if (!schedule) return null
    
    return schedule.find(booking => 
      formatDate(booking.date) === formatDate(date) &&
      booking.timeSlot === timeSlot &&
      (!labId || booking.labId === labId)
    )
  }

  const getBookingColor = (booking) => {
    if (!booking) return ''
    
    switch (booking.status) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'approved':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner message="Loading schedule..." />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-sm text-gray-600">
            View laboratory schedules and availability
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'week' ? navigateWeek(-1) : navigateDay(-1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <h2 className="text-lg font-semibold text-gray-900">
              {view === 'week' 
                ? `Week of ${formatDate(weekDays[0], 'MMM DD')} - ${formatDate(weekDays[6], 'MMM DD, YYYY')}`
                : formatDate(currentDate, 'MMMM DD, YYYY')
              }
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'week' ? navigateWeek(1) : navigateDay(1)}
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
            
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={view === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className="rounded-r-none"
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
                className="rounded-l-none"
              >
                Day
              </Button>
            </div>
            
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

      {/* Schedule Grid */}
      <Card className="p-6">
        {view === 'week' ? (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[800px]">
              {/* Time column header */}
              <div className="p-3 text-center text-sm font-medium text-gray-500">
                Time
              </div>
              
              {/* Day headers */}
              {weekDays.map(day => (
                <div key={day.toString()} className="p-3 text-center text-sm font-medium text-gray-500">
                  <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-xs text-gray-400">{day.getDate()}</div>
                </div>
              ))}
              
              {/* Time slots */}
              {TIME_SLOTS.map(timeSlot => (
                <React.Fragment key={timeSlot.value}>
                  {/* Time label */}
                  <div className="p-3 text-sm font-medium text-gray-600 border-r border-gray-200">
                    {timeSlot.label}
                  </div>
                  
                  {/* Day slots */}
                  {weekDays.map(day => {
                    const booking = getBookingForSlot(day, timeSlot.value, selectedLab)
                    
                    return (
                      <div
                        key={`${day.toString()}-${timeSlot.value}`}
                        className={`
                          p-2 min-h-[60px] border border-gray-200 text-xs
                          ${booking ? `${getBookingColor(booking)} cursor-pointer` : 'hover:bg-gray-50'}
                        `}
                        onClick={() => booking && console.log('View booking:', booking)}
                      >
                        {booking && (
                          <div className="space-y-1">
                            <div className="font-medium truncate">
                              {booking.lab?.name || 'Unknown Lab'}
                            </div>
                            <div className="truncate">
                              {booking.user?.name}
                            </div>
                            <div className="truncate text-xs opacity-75">
                              {booking.purpose?.substring(0, 30)}...
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Day view */}
            <div className="grid grid-cols-1 gap-2">
              {TIME_SLOTS.map(timeSlot => {
                const bookings = labs?.map(lab => ({
                  lab,
                  booking: getBookingForSlot(currentDate, timeSlot.value, lab.id)
                })) || []
                
                return (
                  <div key={timeSlot.value} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20 text-sm font-medium text-gray-600">
                      {timeSlot.label}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {bookings.map(({ lab, booking }) => (
                        <div
                          key={lab.id}
                          className={`
                            p-3 rounded border text-sm
                            ${booking 
                              ? `${getBookingColor(booking)} cursor-pointer` 
                              : 'bg-gray-50 border-gray-200'
                            }
                          `}
                          onClick={() => booking && console.log('View booking:', booking)}
                        >
                          <div className="font-medium">{lab.name}</div>
                          {booking ? (
                            <div className="text-xs mt-1">
                              <div>{booking.user?.name}</div>
                              <div className="truncate">{booking.purpose}</div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1">Available</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
            <span>Available</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ScheduleView
