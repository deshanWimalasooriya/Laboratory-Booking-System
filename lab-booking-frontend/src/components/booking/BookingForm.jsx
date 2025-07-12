import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { bookingService } from '../../services/bookingService'
import { labService } from '../../services/labService'
import { equipmentService } from '../../services/equipmentService'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import { TIME_SLOTS } from '../../utils/constants'
import { formatDate } from '../../utils/dateUtils'

const BookingForm = ({ bookingId = null, onSuccess }) => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [labs, setLabs] = useState([])
  const [equipment, setEquipment] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setValues,
    setFieldValue
  } = useForm({
    initialValues: {
      labId: '',
      date: '',
      timeSlot: '',
      purpose: '',
      equipmentIds: [],
      participants: 1,
      notes: ''
    },
    validate: (values) => {
      const errors = {}
      
      if (!values.labId) {
        errors.labId = 'Laboratory is required'
      }
      
      if (!values.date) {
        errors.date = 'Date is required'
      } else if (new Date(values.date) < new Date().setHours(0, 0, 0, 0)) {
        errors.date = 'Date cannot be in the past'
      }
      
      if (!values.timeSlot) {
        errors.timeSlot = 'Time slot is required'
      }
      
      if (!values.purpose.trim()) {
        errors.purpose = 'Purpose is required'
      } else if (values.purpose.length < 10) {
        errors.purpose = 'Purpose must be at least 10 characters'
      }
      
      if (values.participants < 1) {
        errors.participants = 'At least 1 participant is required'
      }
      
      return errors
    }
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [labsData, equipmentData] = await Promise.all([
          labService.getLabs(),
          equipmentService.getEquipment()
        ])
        
        setLabs(labsData)
        setEquipment(equipmentData)
        
        // If editing, load booking data
        if (bookingId) {
          const booking = await bookingService.getBookingById(bookingId)
          setValues({
            labId: booking.labId,
            date: formatDate(booking.date, 'YYYY-MM-DD'),
            timeSlot: booking.timeSlot,
            purpose: booking.purpose,
            equipmentIds: booking.equipmentIds || [],
            participants: booking.participants || 1,
            notes: booking.notes || ''
          })
        }
      } catch (error) {
        showToast('Failed to load data', 'error')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [bookingId])

  // Load available slots when lab or date changes
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (values.labId && values.date) {
        try {
          const slots = await bookingService.getAvailableSlots(values.labId, values.date)
          setAvailableSlots(slots)
        } catch (error) {
          console.error('Failed to load available slots:', error)
          setAvailableSlots([])
        }
      }
    }

    loadAvailableSlots()
  }, [values.labId, values.date])

  const handleEquipmentChange = (equipmentId, checked) => {
    const currentIds = values.equipmentIds || []
    const newIds = checked
      ? [...currentIds, equipmentId]
      : currentIds.filter(id => id !== equipmentId)
    
    setFieldValue('equipmentIds', newIds)
  }

  const onSubmit = async (formData) => {
    setIsLoading(true)
    try {
      if (bookingId) {
        await bookingService.updateBooking(bookingId, formData)
        showToast('Booking updated successfully', 'success')
      } else {
        await bookingService.createBooking(formData)
        showToast('Booking created successfully', 'success')
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/bookings')
      }
    } catch (error) {
      showToast(error.message || 'Failed to save booking', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card className="p-6">
        <LoadingSpinner message="Loading form data..." />
      </Card>
    )
  }

  const selectedLab = labs.find(lab => lab.id === values.labId)
  const labEquipment = equipment.filter(eq => eq.labId === values.labId)

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {bookingId ? 'Edit Booking' : 'New Booking'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details to {bookingId ? 'update' : 'create'} your laboratory booking
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Laboratory *
            </label>
            <Select
              name="labId"
              value={values.labId}
              onChange={handleChange}
              error={errors.labId}
              placeholder="Select a laboratory"
            >
              <option value="">Select a laboratory</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.name} - {lab.location}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <Input
              name="date"
              type="date"
              value={values.date}
              onChange={handleChange}
              error={errors.date}
              min={formatDate(new Date(), 'YYYY-MM-DD')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slot *
            </label>
            <Select
              name="timeSlot"
              value={values.timeSlot}
              onChange={handleChange}
              error={errors.timeSlot}
              placeholder="Select time slot"
              disabled={!values.labId || !values.date}
            >
              <option value="">Select time slot</option>
              {TIME_SLOTS.map(slot => (
                <option 
                  key={slot.value} 
                  value={slot.value}
                  disabled={!availableSlots.includes(slot.value)}
                >
                  {slot.label} {!availableSlots.includes(slot.value) ? '(Unavailable)' : ''}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Participants *
            </label>
            <Input
              name="participants"
              type="number"
              value={values.participants}
              onChange={handleChange}
              error={errors.participants}
              min="1"
              max={selectedLab?.capacity || 50}
            />
            {selectedLab && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum capacity: {selectedLab.capacity} students
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose *
          </label>
          <textarea
            name="purpose"
            value={values.purpose}
            onChange={handleChange}
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.purpose ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Describe the purpose of your booking..."
          />
          {errors.purpose && (
            <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
          )}
        </div>

        {labEquipment.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Required Equipment
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labEquipment.map(eq => (
                <div key={eq.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`equipment-${eq.id}`}
                    checked={values.equipmentIds?.includes(eq.id) || false}
                    onChange={(e) => handleEquipmentChange(eq.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`equipment-${eq.id}`} className="ml-2 text-sm text-gray-700">
                    {eq.name}
                    {eq.status !== 'available' && (
                      <span className="text-red-500 ml-1">({eq.status})</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={values.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information or special requirements..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bookings')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              bookingId ? 'Update Booking' : 'Create Booking'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default BookingForm
