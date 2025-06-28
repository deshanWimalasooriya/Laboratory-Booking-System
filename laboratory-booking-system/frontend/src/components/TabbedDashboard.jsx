import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/TabbedDashboard.css";// Styling
import UserAdminDashboard from "../components/UserAdminDashboard"; // Import your user admin dashboard component
import LabScheduleAdminDashboard from "../components/labScheduleAdminDashboard"; // Import your lab schedule admin dashboard component
import LabAdminDashboard from "./LabAdminDashboard";  // Import your lab admin dashboard component


export default function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [user, setUser] = useState(null);
  const [labSchedule, setLabSchedule] = useState(null);
  const [labs, setLabs] = useState([]);
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
    .get("http://localhost:3000/api/labs/bookings")
    .then((res) => {
      console.log("Received booked lab data:", res.data);
      setBookings(res.data);
    })
    .catch((err) => setBookings([]));
}, [navigate]);

//
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/", { replace: true });
    setUser(JSON.parse(stored));
  }, [navigate]);


  return (
    <div className="tabbed-dashboard">
      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          User Panel
        </button>
        <button
          className={`tab-btn ${activeTab === "labSchedules" ? "active" : ""}`}
          onClick={() => setActiveTab("labSchedules")}
        >
          Lab Schedule Panel
        </button>
        <button
          className={`tab-btn ${activeTab === "labs" ? "active" : ""}`}
          onClick={() => setActiveTab("labs")}
        >
          Lab Panel
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "users" && (
            <UserAdminDashboard user={user} sidebarOpen={sidebarOpen} />
        )}

        {activeTab === "labSchedules" && (
            <LabScheduleAdminDashboard labSchedule={labSchedule} sidebarOpen={sidebarOpen} />
        )}

        {activeTab === "labs" && (
          <LabAdminDashboard labs={labs} sidebarOpen={sidebarOpen} />
        )}
      </div>
    </div>
  );
}
