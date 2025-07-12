import React from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Checkbox from '../ui/Checkbox'

const FormField = ({ 
  type = 'text', 
  name, 
  label, 
  value, 
  onChange, 
  onBlur,
  error, 
  required = false,
  disabled = false,
  placeholder,
  options = [],
  className = '',
  ...props 
}) => {
  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={className}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )

      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
              ${error 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
              }
              ${disabled 
                ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                : 'bg-white'
              }
              ${className}
            `}
            {...props}
          />
        )

      case 'checkbox':
        return (
          <Checkbox
            name={name}
            checked={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={className}
            {...props}
          />
        )

      default:
        return (
          <Input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={className}
            {...props}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      {label && type !== 'checkbox' && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'checkbox' ? (
        <div className="flex items-center">
          {renderField()}
          {label && (
            <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
      ) : (
        renderField()
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
