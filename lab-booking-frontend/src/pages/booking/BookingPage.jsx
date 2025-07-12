import React from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import BookingList from '../../components/booking/BookingList'

const BookingPage = () => {
  return (
    <DashboardLayout>
      <BookingList />
    </DashboardLayout>
  )
}

export default BookingPage
