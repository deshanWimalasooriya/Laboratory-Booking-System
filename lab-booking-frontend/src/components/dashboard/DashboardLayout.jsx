import React, { useState } from 'react'
import Header from '../common/Header'
import Sidebar from '../common/Sidebar'

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={handleMenuToggle} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <main className="flex-1 lg:ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
