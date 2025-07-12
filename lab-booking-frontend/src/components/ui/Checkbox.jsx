import React from 'react'

const Checkbox = ({
  name,
  checked = false,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <input
      id={name}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      className={`
        h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    />
  )
}

export default Checkbox
