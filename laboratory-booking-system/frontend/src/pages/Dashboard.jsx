import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import AnimatedProgressBar from "../components/AnimatedProgressBar";
import "../styles/Dashboard.css";
import axios from "axios";
import TabbedDashboard from "../components/TabbedDashboard";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]); // New state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


// fetch bookings
  useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) return navigate("/", { replace: true });
  setUser(JSON.parse(stored));

  axios
    .get("http://localhost:3000/api/schedules/bookings")
    .then((res) => {
      console.log("Received booked lab data:", res.data);
      setBookings(res.data);
    })
    .catch((err) => setBookings([]));
}, [navigate]);

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

      {/*Sidebar*/}
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
          {user?.role === "instructor" && (
            <Link to="/view-bookings" className="nav-item">
            <span className="nav-icon">📅</span>
            {sidebarOpen && "View Bookings"}
          </Link>
          )}

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

        {/*Main header*/}
        <header className="main-header">
          <input className="main-search" type="text" placeholder="Search labs, bookings..." />
          <div className="main-user">
            <span className="main-user-greet">
              Good Morning, {user?.name?.split(" ")[0] || "User"}!
            </span>
            <img src={user?.profilePic || "/default-profile.png"} alt="User" className="main-user-pic" />
            <NotificationBell user={user} />
          </div>
        </header>

        {user?.role === "lecture_in_charge" && (
          <section className="main-section dashboard-section">
            <TabbedDashboard user={user} sidebarOpen={sidebarOpen}/>
          </section>
        )}

        {/* New Section: Booked Labs from Lab_booking Table */}
        <section className="main-section booked-labs-section">
          {user?.role === "instructor" && (
            <AnimatedProgressBar pending={8} approved={15} rejected={3} />
          )}

          <h2>All Booked Labs</h2>
          <div className="booking-list">
            {bookings.length === 0 && !loading && !error && (
              <div>No bookings found.</div>
            )}
            {bookings.map((booking) => (
              <div className="booking-item" key={booking.id}>
                <span className="booking-lab">{booking.type}</span>
                <div className="rightSide"></div>
                <span className="booking-date">{booking.date}</span>
                <span className="booking-date">{booking.time_slot}</span>
              </div>
            ))}
          </div>
        </section>


      </main>
    </div>
  );
}

export default Dashboard;
