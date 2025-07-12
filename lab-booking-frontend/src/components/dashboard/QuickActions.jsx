import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { PERMISSIONS } from '../../utils/constants'

const QuickActions = () => {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()

  const actions = [
    {
      title: 'New Booking',
      description: 'Book a laboratory for your class or research',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => navigate('/booking/new'),
      permission: PERMISSIONS.CREATE_BOOKINGS,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Browse Labs',
      description: 'Explore available laboratories and equipment',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      onClick: () => navigate('/labs'),
      permission: PERMISSIONS.VIEW_LABS,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Schedule',
      description: 'Check laboratory schedules and availability',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => navigate('/schedule'),
      permission: PERMISSIONS.VIEW_BOOKINGS,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Equipment Status',
      description: 'Monitor equipment availability and maintenance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigate('/equipment'),
      permission: PERMISSIONS.VIEW_EQUIPMENT,
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove system users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      onClick: () => navigate('/admin/users'),
      permission: PERMISSIONS.MANAGE_USERS,
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      title: 'Analytics',
      description: 'View usage statistics and reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => navigate('/admin/analytics'),
      permission: PERMISSIONS.VIEW_ANALYTICS,
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ]

  const filteredActions = actions.filter(action => 
    !action.permission || hasPermission(action.permission)
  )

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`
              p-4 rounded-lg text-white text-left transition-colors
              ${action.color}
            `}
          >
            <div className="flex items-center mb-2">
              {action.icon}
              <h4 className="ml-2 font-medium">{action.title}</h4>
            </div>
            <p className="text-sm opacity-90">{action.description}</p>
          </button>
        ))}
      </div>
    </Card>
  )
}

export default QuickActions
