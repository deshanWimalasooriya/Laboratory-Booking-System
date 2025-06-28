import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/RequestTabs.css";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function RequestTabs({ userId }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch bookings from backend
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/bookings", {
        params: {
          instructor_id: userId,
          status: activeTab,
        },
      });
      setRequests(response.data); // assumes response is an array of { id, lab_name, status }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Call when tab or user changes
  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [activeTab, userId]);

  // ❌ Cancel booking
  const handleCancel = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/bookings/${id}`);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Error cancelling request:", error);
    }
  };

  return (
    <div className="request-tabs-root">
      <nav className="request-tabs-nav">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`request-tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="request-tabs-content">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="empty-message">No {activeTab} requests.</div>
        ) : (
          <ul className="request-list">
            {requests.map((req) => (
              <li className="request-item" key={req.id}>
                <span className="request-name">{req.lab_name || req.name}</span>
                {activeTab === "pending" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(req.id)}
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
