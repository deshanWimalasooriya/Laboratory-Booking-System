import React, { useState } from "react";
import "../styles/RequestTabs.css"; // Assuming you have a CSS file for styling

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const mockRequests = [
  { id: 1, name: "Lab A", status: "pending" },
  { id: 2, name: "Lab B", status: "approved" },
  { id: 3, name: "Lab C", status: "pending" },
  { id: 4, name: "Lab D", status: "rejected" },
];

export default function RequestTabs() {
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState(mockRequests);

  const handleCancel = (id) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const filtered = requests.filter((req) => req.status === activeTab);

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
        {filtered.length === 0 && (
          <div className="empty-message">No {activeTab} requests.</div>
        )}
        <ul className="request-list">
          {filtered.map((req) => (
            <li className="request-item" key={req.id}>
              <span className="request-name">{req.name}</span>
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
      </div>
    </div>
  );
}
