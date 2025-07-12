import React from 'react'

const Card = ({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  hover = false,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const baseClasses = `
    bg-white rounded-lg border border-gray-200
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
    ${className}
  `

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

export default Card
