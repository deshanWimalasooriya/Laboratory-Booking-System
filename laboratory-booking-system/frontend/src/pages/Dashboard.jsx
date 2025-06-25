// src/pages/Dashboard.jsx
import React from "react";
import "../styles/Dashboard.css"; // Assuming you have a CSS file for styling

function Dashboard() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Lab Booking</h2>
        <nav>
          <ul>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Book a Lab</a></li>
            <li><a href="#">View Bookings</a></li>
            <li><a href="#">Logout</a></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">
        <h1>Welcome to the Laboratory Booking System</h1>
        <p>You can now book labs, view schedules, and manage your reservations.</p>
        <div className="card-grid">
          <div className="card">
            <h3>Upcoming Bookings</h3>
            <p>Check your reserved lab sessions.</p>
          </div>
          <div className="card">
            <h3>Book New Lab</h3>
            <p>Submit a booking request for any available lab.</p>
          </div>
          <div className="card">
            <h3>Manage Profile</h3>
            <p>Update your profile and preferences.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
