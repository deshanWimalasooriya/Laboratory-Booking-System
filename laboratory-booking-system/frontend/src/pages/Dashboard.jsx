// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Function to clear cookies (simple method)
  function clearAllCookies() {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    clearAllCookies();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        {user && (
          <div className="user-info">
            <img
              src={user.profilePic || "/default-profile.png"}
              alt="User Profile"
              className="profile-pic"
            />
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.role || "User"}</p>
            </div>
          </div>
        )}
        <h2>Lab Booking</h2>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {/* Conditionally show Book a Lab only if role === "instructor" */}
            {user && user.role === "instructor" && (
              <li><Link to="/book-lab">Book a Lab</Link></li>
            )}
            <li><Link to="/view-bookings">View Bookings</Link></li>
            <li>
              {/* Logout as a clickable element */}
              <button
                onClick={handleLogout}
                className="logout-button"
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#007bff",
                  textDecoration: "underline",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
              >
                Logout
              </button>
            </li>
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
