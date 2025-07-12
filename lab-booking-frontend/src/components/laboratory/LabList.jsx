import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLabs } from '../../hooks/useLabs'
import { usePermissions } from '../../hooks/usePermissions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import LabCard from './LabCard'
import { LAB_TYPES, PERMISSIONS } from '../../utils/constants'

const LabList = () => {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    availability: ''
  })

  const { data: labs, isLoading, error } = useLabs(filters)

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      availability: ''
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
      <Card className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Failed to load laboratories</p>
          <p className="text-sm text-gray-600 mt-1">{error.message}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and manage laboratory facilities
          </p>
        </div>
        {hasPermission(PERMISSIONS.MANAGE_LABS) && (
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => navigate('/admin/labs/new')}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Laboratory
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search laboratories..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              placeholder="All Types"
            >
              <option value="">All Types</option>
              {Object.entries(LAB_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              placeholder="All Status"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
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
      {labs && labs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              onBookNow={() => navigate(`/booking/new?labId=${lab.id}`)}
              onViewDetails={() => navigate(`/labs/${lab.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No laboratories found</h3>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'No laboratories are currently available.'
            }
          </p>
          {Object.values(filters).some(f => f) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}

export default LabList
