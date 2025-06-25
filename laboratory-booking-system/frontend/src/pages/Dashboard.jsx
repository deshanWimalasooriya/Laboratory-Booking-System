import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/", { replace: true });
    setUser(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="labreserve-dashboard-bg">
      <aside className={`labreserve-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">
            <svg width="36" height="36" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="#2563eb"/>
              <path d="M28 15L32 35H24L28 15Z" fill="#fff"/>
              <circle cx="28" cy="39" r="2" fill="#fff"/>
            </svg>
            {sidebarOpen && <span className="sidebar-title">LabReserve</span>}
          </span>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(open => !open)}>
            <span className="hamburger"></span>
          </button>
        </div>
        {user && (
          <div className="sidebar-user">
            <img src={user.profilePic || "/default-profile.png"} alt="User" />
            {sidebarOpen && (
              <div>
                <h3>{user.name}</h3>
                <p>{user.role || "User"}</p>
              </div>
            )}
          </div>
        )}
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            {sidebarOpen && "Dashboard"}
          </Link>
          {user?.role === "instructor" && (
            <Link to="/book-lab" className="nav-item">
              <span className="nav-icon">🧪</span>
              {sidebarOpen && "Book a Lab"}
            </Link>
          )}
          <Link to="/view-bookings" className="nav-item">
            <span className="nav-icon">📅</span>
            {sidebarOpen && "View Bookings"}
          </Link>
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && "Logout"}
          </button>
        </nav>
        {sidebarOpen && (
          <div className="sidebar-footer">
            <Link to="/settings" className="sidebar-settings">
              <span className="nav-icon">⚙️</span> Settings
            </Link>
          </div>
        )}
      </aside>
      <main className="labreserve-main">
        <header className="main-header">
          <input className="main-search" type="text" placeholder="Search labs, bookings..." />
          <div className="main-user">
            <span className="main-user-greet">
              Good Morning, {user?.name?.split(" ")[0] || "User"}!
            </span>
            <img src={user?.profilePic || "/default-profile.png"} alt="User" className="main-user-pic" />
          </div>
        </header>
        
        <section className="main-section">
          <h2>Upcoming Bookings</h2>
          <div className="booking-list">
            <div className="booking-item">
              <span className="booking-lab">Physics Lab</span>
              <span className="booking-date">27 June 2025, 10:00 AM</span>
              <span className="booking-status confirmed">Confirmed</span>
            </div>
            <div className="booking-item">
              <span className="booking-lab">Chemistry Lab</span>
              <span className="booking-date">28 June 2025, 2:00 PM</span>
              <span className="booking-status pending">Pending</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
