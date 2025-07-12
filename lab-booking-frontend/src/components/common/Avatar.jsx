import React from 'react'

const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  className = '',
  fallback = null 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  }

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full bg-gray-300 text-gray-600
    font-medium overflow-hidden
    ${sizeClasses[size]}
    ${className}
  `

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={baseClasses}
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
      />
    )
  }

  const initials = alt
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={baseClasses}>
      {fallback || initials || '?'}
    </div>
  )
}

export default Avatar
