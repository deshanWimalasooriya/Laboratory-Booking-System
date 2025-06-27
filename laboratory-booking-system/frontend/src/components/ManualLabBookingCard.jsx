import React from "react";
import "../styles/ManualLabBookingCard.css"; // Assuming you have a CSS file for styling

const ManualLabBookingCard = ({
  manualLabType,
  setManualLabType,
  manualDate,
  setManualDate,
  manualTimeSlot,
  setManualTimeSlot,
  manualBookingMsg,
  setManualBookingMsg,
  availableLabs,
  setAvailableLabs,
  user,
  axios,
}) => (
  <section className="lab-booking-card">
    <div className="lab-booking-card__content">
      <div className="lab-booking-card__header">
        <h3>Manual Lab Booking</h3>
        <p>
          Book a lab slot manually by selecting the lab type, date, and time slot.
          Get instant confirmation if the slot is available.
        </p>
      </div>
      <form
        className="lab-booking-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!manualLabType || !manualDate || !manualTimeSlot) {
            setManualBookingMsg("Please fill all fields.");
            return;
          }
          setManualBookingMsg("Processing...");
          try {
            const lab = availableLabs.find(l => l.lab_type === manualLabType);
            if (!lab) {
              setManualBookingMsg("Invalid lab type selected.");
              return;
            }
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
      >
        <label>
          Lab Type:
          <select
            value={manualLabType}
            onChange={e => setManualLabType(e.target.value)}
            required
            disabled={availableLabs.length === 0}
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
        <button type="submit" className="book-btn">Book now</button>
        <span className="booking-msg">{manualBookingMsg}</span>
      </form>
    </div>
  </section>
);

export default ManualLabBookingCard;
