import { useState, useCallback } from 'react'

export const useForm = ({ initialValues = {}, validate = () => ({}) }) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target
    const newValue = type === 'checkbox' ? checked : value

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }, [errors])

  const handleBlur = useCallback((event) => {
    const { name } = event.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate single field on blur
    const fieldErrors = validate(values)
    if (fieldErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }))
    }
  }, [values, validate])

  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      event.preventDefault()
      setIsSubmitting(true)

      // Validate all fields
      const validationErrors = validate(values)
      setErrors(validationErrors)

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
      setTouched(allTouched)

      // If no errors, submit the form
      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Form submission error:', error)
        }
      }

      setIsSubmitting(false)
    }
  }, [values, validate])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setFieldValue,
    setFieldError
  }
}
