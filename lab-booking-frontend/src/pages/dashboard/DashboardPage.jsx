import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useBookings } from '../../hooks/useBookings'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import DashboardStats from '../../components/dashboard/DashboardStats'
import UpcomingBookings from '../../components/dashboard/UpcomingBookings'
import QuickActions from '../../components/dashboard/QuickActions'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DashboardPage = () => {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: upcomingBookings, isLoading: bookingsLoading } = useBookings({
    status: 'confirmed',
    upcoming: true,
    limit: 5
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your laboratory bookings today.
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats stats={stats} isLoading={statsLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <UpcomingBookings 
              bookings={upcomingBookings} 
              isLoading={bookingsLoading} 
            />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
