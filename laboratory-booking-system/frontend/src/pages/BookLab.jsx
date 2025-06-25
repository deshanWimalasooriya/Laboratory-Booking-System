import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/BookLab.css";

function LabBook() {
  const [availableLabs, setAvailableLabs] = useState([]);
  const [bookingStatus, setBookingStatus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

const [manualLabType, setManualLabType] = useState("");
const [manualDate, setManualDate] = useState("");
const [manualTimeSlot, setManualTimeSlot] = useState("");
const [manualBookingMsg, setManualBookingMsg] = useState("");


  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/", { replace: true });
    setUser(JSON.parse(stored));

    axios
      .get("http://localhost:3000/api/labs/available")
      .then((res) => {
        console.log("Received labs data:", res.data);
        setAvailableLabs(res.data);
      })
      .catch(() => setAvailableLabs([]));
  }, [navigate]);

  const handleBook = async (schedule_id) => {
    setBookingStatus({ ...bookingStatus, [schedule_id]: "Processing..." });
    try {
      await axios.post("http://localhost:3000/api/labs/book", { schedule_id, user_id: user.user_id });
      setBookingStatus({ ...bookingStatus, [schedule_id]: "Booked!" });
      setAvailableLabs((labs) =>
        labs.filter((lab) => lab.schedule_id !== schedule_id)
      );
    } catch {
      setBookingStatus({ ...bookingStatus, [schedule_id]: "Failed!" });
    }
  };

  return (
    <div className="labreserve-dashboard-bg">
      {/* Sidebar */}
      <aside className={`labreserve-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">
            <svg width="36" height="36" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="#2563eb" />
              <path d="M28 15L32 35H24L28 15Z" fill="#fff" />
              <circle cx="28" cy="39" r="2" fill="#fff" />
            </svg>
            {sidebarOpen && <span className="sidebar-title">LabReserve</span>}
          </span>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <span className="hamburger"></span>
          </button>
        </div>
        {user && (
          <div className="sidebar-user">
            <img
              src={user.profilePic || "/default-profile.png"}
              alt="User"
            />
            {sidebarOpen && (
              <div>
                <h3>{user.name}</h3>
                <p>{user.role || "User"}</p>
              </div>
            )}
          </div>
        )}
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            {sidebarOpen && "Dashboard"}
          </Link>
          {user?.role === "instructor" && (
            <Link to="/book-lab" className="nav-item active">
              <span className="nav-icon">🧪</span>
              {sidebarOpen && "Book a Lab"}
            </Link>
          )}
          <Link to="/view-bookings" className="nav-item">
            <span className="nav-icon">📅</span>
            {sidebarOpen && "View Bookings"}
          </Link>
          <button
            className="nav-item logout"
            onClick={() => {
              localStorage.clear();
              navigate("/", { replace: true });
            }}
          >
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

      {/* Main Content */}
      <main className="labreserve-main">
        <header className="main-header">
          <div className="main-user">
            <span className="main-user-greet">
              Hello, {user?.name?.split(" ")[0] || "User"}!
            </span>
            <img
              src={user?.profilePic || "/default-profile.png"}
              alt="User"
              className="main-user-pic"
            />
          </div>
        </header>
        <section className="main-cards">
          {availableLabs.length === 0 ? (
            <div className="labbook-empty">No available labs found.</div>
          ) : (
            availableLabs.map((lab) => (
              <div className="main-card labbook-card" key={lab.schedule_id}>
                <div className="labbook-card-header">
                  <span className="labbook-lab-name">{lab.lab_type}</span>
                  <span className={`labbook-status available`}>
                    {lab.availability}
                  </span>
                </div>
                <div className="labbook-card-info">
                  <div>
                    <span className="labbook-label">Date:</span>
                    <span>{lab.date}</span>
                  </div>
                  <div>
                    <span className="labbook-label">Time Slot:</span>
                    <span>{lab.time_slot}</span>
                  </div>
                  <div>
                    <span className="labbook-label">Capacity:</span>
                    <span>{lab.capacity}</span>
                  </div>
                </div>
                <button
                  className="labbook-btn"
                  onClick={() => handleBook(lab.schedule_id)}
                  disabled={bookingStatus[lab.schedule_id] === "Booked!"}
                >
                  {bookingStatus[lab.schedule_id] || "Book"}
                </button>
              </div>
            ))
          )}
        </section>

        {/* Manual Booking Section */}
        <section style={{ margin: "2rem 0", padding: "1.5rem", background: "#f8fafc", borderRadius: "10px", boxShadow: "0 2px 8px #e0e7ef" }}>
          <h3 style={{ marginBottom: "1rem" }}>Manual Lab Booking</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!manualLabType || !manualDate || !manualTimeSlot) {
                setManualBookingMsg("Please fill all fields.");
                return;
              }
              setManualBookingMsg("Processing...");
              try {
                // Find the lab_id for the selected lab type
                const lab = availableLabs.find(l => l.lab_type === manualLabType);
                if (!lab) {
                  setManualBookingMsg("Invalid lab type selected.");
                  return;
                }
                // Find the schedule_id for the selected lab, date, and time slot
                const schedule = availableLabs.find(
                  l => l.lab_type === manualLabType && l.date === manualDate && l.time_slot === manualTimeSlot
                );
                if (!schedule) {
                  setManualBookingMsg("No available schedule for this selection.");
                  return;
                }
                await axios.post("http://localhost:3000/api/lab/book", {
                  schedule_id: schedule.schedule_id,
                  user_id: user.user_id
                });
                setManualBookingMsg("Booked!");
                setAvailableLabs(labs => labs.filter(l => l.schedule_id !== schedule.schedule_id));
              } catch {
                setManualBookingMsg("Booking failed or slot unavailable.");
              }
            }}
            style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}
          >
            <label>
              Lab Type:
              <select
                value={manualLabType}
                onChange={e => setManualLabType(e.target.value)}
                required
                style={{ marginLeft: "0.5rem" }}
              >
                <option value="">Select</option>
                {[...new Set(availableLabs.map(l => l.lab_type))].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Date:
              <select
                value={manualDate}
                onChange={e => setManualDate(e.target.value)}
                required
                style={{ marginLeft: "0.5rem" }}
                disabled={!manualLabType}
              >
                <option value="">Select</option>
                {[...new Set(availableLabs.filter(l => l.lab_type === manualLabType).map(l => l.date))].map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </label>
            <label>
              Time Slot:
              <select
                value={manualTimeSlot}
                onChange={e => setManualTimeSlot(e.target.value)}
                required
                style={{ marginLeft: "0.5rem" }}
                disabled={!manualDate}
              >
                <option value="">Select</option>
                {availableLabs
                  .filter(l => l.lab_type === manualLabType && l.date === manualDate)
                  .map(l => l.time_slot)
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
              </select>
            </label>
            <button type="submit" style={{ padding: "0.4rem 1rem" }}>Book</button>
            <span style={{ color: "green", marginLeft: "1rem" }}>{manualBookingMsg}</span>
          </form>
        </section>
      </main>
    </div>
  );
}

export default LabBook;
