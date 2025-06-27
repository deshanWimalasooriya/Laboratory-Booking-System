import React, { useEffect, useRef, useState } from "react";
import "../styles/NotificationBell.css"; // Assuming you have a CSS file for styles

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const popupRef = useRef();

  useEffect(() => {
    if (!user) return;
    fetch(`/api/labs/notifications?role=${user.role}&userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      });
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="notification-bell-container" ref={popupRef}>
      <button className="notification-bell" onClick={() => setOpen(o => !o)}>
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z" fill="#2563eb"/>
        </svg>
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-popup fade-in-up">
          <h4>Notifications</h4>
          {notifications.length === 0 && <div className="notification-empty">No notifications</div>}
          <ul>
            {notifications.map(n => (
              <li key={n.id} className={n.read ? "read" : "unread"}>
                {n.message}
                <span className="notification-date">{new Date(n.date).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
