import React, { useState } from 'react'
import { useAnalytics } from '../../hooks/useAnalytics'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatDate, subtractDays } from '../../utils/dateUtils'

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30')
  const [selectedMetric, setSelectedMetric] = useState('bookings')

  const endDate = new Date()
  const startDate = subtractDays(endDate, parseInt(dateRange))

  const { data: analytics, isLoading } = useAnalytics({
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    metric: selectedMetric
  })

  const metrics = [
    { value: 'bookings', label: 'Bookings Overview' },
    { value: 'labs', label: 'Laboratory Utilization' },
    { value: 'equipment', label: 'Equipment Usage' },
    { value: 'users', label: 'User Activity' }
  ]

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ]

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner message="Loading analytics..." />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            System usage statistics and insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-4">
          <Select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-48"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </Select>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalBookings || 0}
              </p>
              <p className="text-sm text-green-600">
                +{analytics?.bookingGrowth || 0}% from last period
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.activeUsers || 0}
              </p>
              <p className="text-sm text-green-600">
                +{analytics?.userGrowth || 0}% from last period
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lab Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.labUtilization || 0}%
              </p>
              <p className="text-sm text-blue-600">
                Average across all labs
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Equipment Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.equipmentUsage || 0}%
              </p>
              <p className="text-sm text-orange-600">
                Average utilization rate
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder - Booking trends over time</p>
          </div>
        </Card>

        {/* Popular Labs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Popular Labs
          </h3>
          <div className="space-y-3">
            {analytics?.popularLabs?.slice(0, 5).map((lab, index) => (
              <div key={lab.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {lab.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(lab.bookings / analytics.totalBookings) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {lab.bookings}
                  </span>
                </div>
              </div>
            )) || []}
          </div>
        </Card>

        {/* Peak Hours */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Peak Booking Hours
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart placeholder - Hourly booking distribution</p>
          </div>
        </Card>

        {/* User Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Activity by Role
          </h3>
          <div className="space-y-3">
            {analytics?.usersByRole?.map((role) => (
              <div key={role.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {role.name.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(role.count / analytics.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {role.count}
                  </span>
                </div>
              </div>
            )) || []}
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Download detailed analytics reports
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              Export CSV
            </Button>
            <Button variant="outline">
              Export PDF
            </Button>
            <Button>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Analytics
