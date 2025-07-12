import React, { useState, useRef, useEffect } from 'react'

const Dropdown = ({
  trigger,
  items = [],
  align = 'left',
  width = 'w-48',
  className = '',
  isOpen: controlledIsOpen,
  onToggle
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = onToggle || setInternalIsOpen

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, setIsOpen])

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div className={`
          absolute z-50 mt-2 ${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none
          ${alignmentClasses[align]}
          ${className}
        `}>
          <div className="py-1">
            {items.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={index} className="border-t border-gray-100 my-1" />
              }

              if (item.content) {
                return (
                  <div key={item.id || index} onClick={item.onClick}>
                    {item.content}
                  </div>
                )
              }

              return (
                <button
                  key={item.id || index}
                  onClick={item.onClick}
                  className={`
                    w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center
                    ${item.className || ''}
                  `}
                >
                  {item.icon && (
                    <span className="mr-3 flex-shrink-0">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
