import React from 'react'

const Badge = ({
  count,
  max = 99,
  showZero = false,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  if (!showZero && (!count || count === 0)) {
    return null
  }

  const displayCount = count > max ? `${max}+` : count

  const variants = {
    default: 'bg-red-500 text-white',
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white'
  }

  const sizes = {
    sm: 'h-4 min-w-[16px] text-xs px-1',
    md: 'h-5 min-w-[20px] text-xs px-1.5',
    lg: 'h-6 min-w-[24px] text-sm px-2'
  }

  return (
    <span className={`
      inline-flex items-center justify-center rounded-full font-medium
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {displayCount}
    </span>
  )
}

export default Badge
