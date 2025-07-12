import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../common/Badge'
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/dateUtils'
import { USER_ROLES } from '../../utils/constants'

const UserTable = ({ users, onEdit, onDelete, onActivate, onDeactivate }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'danger'
      case USER_ROLES.LECTURE_IN_CHARGE:
        return 'primary'
      case USER_ROLES.TECHNICAL_OFFICER:
        return 'warning'
      case USER_ROLES.INSTRUCTOR:
        return 'success'
      case USER_ROLES.STUDENT:
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'danger'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const formatRoleName = (role) => {
    return role.replace('_', ' ').toUpperCase()
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      src={user.profileImage}
                      alt={user.name}
                      size="sm"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                      {user.studentId && (
                        <div className="text-xs text-gray-400">
                          ID: {user.studentId}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    count={formatRoleName(user.role)}
                    variant={getRoleBadgeColor(user.role)}
                    showZero
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    count={user.status.toUpperCase()}
                    variant={getStatusBadgeColor(user.status)}
                    showZero
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRelativeTime(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </Button>
                    
                    {user.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeactivate(user)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onActivate(user)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        Activate
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default UserTable
