import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ManualLabBookingCard.css";

export default function ManualLabBookingCard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [manualBookingMsg, setManualBookingMsg] = useState("");
  const [availableLabs, setAvailableLabs] = useState([]);

  const [form, setForm] = useState({
    lab_type: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  // 🔁 Fetch available labs
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/schedules/available")
      .then((res) => setAvailableLabs(res.data))
      .catch((err) => {
        console.error("Failed to fetch available labs", err);
        setAvailableLabs([]);
      });
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleManualBooking = async (e) => {
    e.preventDefault();

    if (!form.lab_type || !form.date || !form.start_time || !form.end_time) {
      setManualBookingMsg("Please fill all fields.");
      return;
    }

    setManualBookingMsg("Processing...");

    console.log("lab_type:", form.lab_type);
    try {
      // 🔍 Match lab_id from lab_type
      const labMatch = availableLabs.find(
        (l) => l.lab_type === form.lab_type
      );
      console.log("Matched lab:", labMatch);
      if (!labMatch) {
        setManualBookingMsg("Invalid lab type selected.");
        return;
      }

      const payload = {
        instructor_id: user.user_id,
        lab_id: labMatch.lab_id,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        status: "pending", // ✅ default
      };
      
      console.log("Sending booking payload:", payload);

      await axios.post("http://localhost:3000/api/bookings", payload);

      setManualBookingMsg("Booking successful!");

      // ✅ Optional: remove booked slot from available list
      setAvailableLabs((labs) =>
        labs.filter((l) =>
          !(l.lab_id === labMatch.lab_id &&
            l.date === form.date &&
            l.time_slot === form.start_time)
        )
      );

      // Reset form
      setForm({
        lab_type: "",
        date: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      console.error("Booking failed:", error.response?.data || error.message);
      setManualBookingMsg("Booking failed. Please try again.");
    }
  };

  return (
    <section className="lab-booking-card">
      <div className="lab-booking-card__content">
        <div className="lab-booking-card__header">
          <h3>Manual Lab Booking</h3>
          <p>
            Book a lab manually by selecting type, date, and time range. You will receive confirmation once submitted.
          </p>
        </div>
        <form className="lab-booking-form" onSubmit={handleManualBooking}>
          <label>
            Lab Type:
            <select
              name="lab_type"
              value={form.lab_type}
              onChange={handleFormChange}
              required
            >
              <option value="">Select</option>
              {[...new Set(availableLabs.map((l) => l.lab_type))].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Date:
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              required
            />
          </label>

          <label>
            Start Time:
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleFormChange}
              required
            />
          </label>

          <label>
            End Time:
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleFormChange}
              required
            />
          </label>

          <button type="submit" className="book-btn">Book Now</button>
          <span className="booking-msg">{manualBookingMsg}</span>
        </form>
      </div>
    </section>
  );
}
