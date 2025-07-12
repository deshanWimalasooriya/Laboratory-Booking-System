import React from 'react'

const LoadingSkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  count = 1,
  variant = 'default'
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variants = {
    default: '',
    text: 'h-4',
    title: 'h-6',
    avatar: 'rounded-full',
    card: 'h-48',
    button: 'h-10'
  }

  const skeletonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${width}
    ${height}
    ${className}
  `

  if (count === 1) {
    return <div className={skeletonClasses} />
  }

  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, index) => (
        <div key={index} className={skeletonClasses} />
      ))}
    </div>
  )
}

export default LoadingSkeleton
