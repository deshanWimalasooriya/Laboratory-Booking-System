import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserAdminDashboard.css";

export default function LabScheduleAdminDashboard() {
  const [labSchedules, setLabSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: "create", labSchedule: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, labSchedule: null });

  // ✅ Use correct field names for lab schedule
  const [form, setForm] = useState({ name: "", date: "", time: "" });

  // ✅ Fetch lab schedules
  const fetchLabSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/labs");
      setLabSchedules(res.data);
    } catch (err) {
      console.error("Failed to fetch lab schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabSchedules();
  }, []);

  const openModal = (mode, labSchedule = null) => {
    setModal({ open: true, mode, labSchedule });
    setForm(
      labSchedule
        ? {
            name: labSchedule.name,
            date: labSchedule.date,
            time: labSchedule.time,
          }
        : { name: "", date: "", time: "" }
    );
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create", labSchedule: null });
    setForm({ name: "", date: "", time: "" });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === "create") {
        await axios.post("http://localhost:3000/api/lab-schedules", form);
      } else if (modal.mode === "edit") {
        await axios.put(`http://localhost:3000/api/lab-schedules/${modal.labSchedule.id}`, form);
      }
      closeModal();
      fetchLabSchedules();
    } catch (err) {
      console.error("Error saving lab schedule:", err);
    }
  };

  const handleDelete = (labSchedule) => {
    setConfirmDelete({ open: true, labSchedule });
  };

  const confirmDeleteLabSchedule = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/lab-schedules/${confirmDelete.labSchedule.id}`);
      fetchLabSchedules();
    } catch (err) {
      console.error("Error deleting lab schedule:", err);
    } finally {
      setConfirmDelete({ open: false, labSchedule: null });
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Lab Schedule Management</h2>
        <button className="add-btn" onClick={() => openModal("create")}>
          Add Lab Schedule
        </button>
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-row">Loading...</td>
              </tr>
            ) : labSchedules.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-row">No lab schedules found</td>
              </tr>
            ) : (
              labSchedules.map((labSchedule, idx) => (
                <tr key={labSchedule.id}>
                  <td>{idx + 1}</td>
                  <td>{labSchedule.type}</td>
                  <td>{labSchedule.date}</td>
                  <td>{labSchedule.time_slot}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal("edit", labSchedule)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(labSchedule)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.mode === "create" ? "Add Lab Schedule" : "Edit Lab Schedule"}</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <label>
                Name:
                <input name="name" value={form.type} onChange={handleFormChange} required autoFocus />
              </label>
              <label>
                Date:
                <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
              </label>
              <label>
                Time:
                <input name="time" type="time" value={form.time} onChange={handleFormChange} required />
              </label>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {modal.mode === "create" ? "Create" : "Update"}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete.open && (
        <div className="modal-overlay" onClick={() => setConfirmDelete({ open: false, labSchedule: null })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <b>{confirmDelete.labSchedule.name}</b>?</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteLabSchedule}>Delete</button>
              <button className="cancel-btn" onClick={() => setConfirmDelete({ open: false, labSchedule: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
