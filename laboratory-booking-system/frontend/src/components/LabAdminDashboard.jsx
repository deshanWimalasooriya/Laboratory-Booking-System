import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserAdminDashboard.css";

export default function LabAdminDashboard() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: "create", lab: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, lab: null });

  // ✅ Correct initial form
  const [form, setForm] = useState({ type: "", availability: "", capacity: "" });

  const fetchLabs = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/labs");
      setLabs(res.data);
    } catch (err) {
      console.error("Failed to fetch labs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const openModal = (mode, lab = null) => {
    setModal({ open: true, mode, lab });
    setForm(
      lab
        ? {
            type: lab.type,
            availability: lab.availability,
            capacity: lab.capacity,
          }
        : { type: "", availability: "", capacity: "" }
    );
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create", lab: null });
    setForm({ type: "", availability: "", capacity: "" });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === "create") {
        await axios.post("http://localhost:3000/api/labs", form);
      } else if (modal.mode === "edit") {
        await axios.put(`http://localhost:3000/api/labs/${modal.lab.lab_id}`, form);
      }
      closeModal();
      fetchLabs();
    } catch (err) {
      console.error("Error saving lab:", err);
    }
  };

  const handleDelete = (lab) => {
    setConfirmDelete({ open: true, lab });
  };

  const confirmDeleteLab = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/labs/${confirmDelete.lab.lab_id}`);
      fetchLabs();
    } catch (err) {
      console.error("Error deleting lab:", err);
    } finally {
      setConfirmDelete({ open: false, lab: null });
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Lab Management</h2>
        <button className="add-btn" onClick={() => openModal("create")}>
          Add Lab
        </button>
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Type</th>
              <th>Availability</th>
              <th>Capacity</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-row">Loading...</td>
              </tr>
            ) : labs.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-row">No labs found</td>
              </tr>
            ) : (
              labs.map((lab, idx) => (
                <tr key={lab.id}>
                  <td>{idx + 1}</td>
                  <td>{lab.type}</td>
                  <td>{lab.availability}</td>
                  <td>{lab.capacity}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal("edit", lab)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(lab)}>Delete</button>
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
            <h3>{modal.mode === "create" ? "Add Lab" : "Edit Lab"}</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <label>
                Type:
                <input name="type" type="text" value={form.type} onChange={handleFormChange} required autoFocus />
              </label>
              <label>
                Availability:
                <input name="availability" type="text" value={form.availability} onChange={handleFormChange} required />
              </label>
              <label>
                Capacity:
                <input name="capacity" type="number" value={form.capacity} onChange={handleFormChange} required />
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
        <div className="modal-overlay" onClick={() => setConfirmDelete({ open: false, lab: null })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <b>{confirmDelete.lab.type}</b>?</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteLab}>Delete</button>
              <button className="cancel-btn" onClick={() => setConfirmDelete({ open: false, lab: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
