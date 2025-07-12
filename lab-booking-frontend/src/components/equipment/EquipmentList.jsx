import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEquipment } from '../../hooks/useEquipment'
import { usePermissions } from '../../hooks/usePermissions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import EquipmentCard from './EquipmentCard'
import { EQUIPMENT_STATUS, PERMISSIONS } from '../../utils/constants'

const EquipmentList = () => {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    labId: '',
    type: ''
  })

  const { data: equipment, isLoading, error } = useEquipment(filters)

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
      labId: '',
      type: ''
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
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
          title="Failed to load equipment"
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
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage laboratory equipment and track availability
          </p>
        </div>
        {hasPermission(PERMISSIONS.MANAGE_EQUIPMENT) && (
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => navigate('/admin/equipment/new')}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Equipment
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search equipment..."
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
              {Object.entries(EQUIPMENT_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              placeholder="All Types"
            >
              <option value="">All Types</option>
              <option value="optical">Optical</option>
              <option value="mechanical">Mechanical</option>
              <option value="electronic">Electronic</option>
              <option value="analytical">Analytical</option>
              <option value="safety">Safety</option>
            </Select>
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
      {equipment && equipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onViewDetails={() => navigate(`/equipment/${item.id}`)}
              onEdit={() => navigate(`/admin/equipment/${item.id}/edit`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="No equipment found"
          description={
            Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'No equipment is currently available.'
          }
          action={Object.values(filters).some(f => f) ? clearFilters : undefined}
          actionText={Object.values(filters).some(f => f) ? "Clear Filters" : undefined}
        />
      )}
    </div>
  )
}

export default EquipmentList
