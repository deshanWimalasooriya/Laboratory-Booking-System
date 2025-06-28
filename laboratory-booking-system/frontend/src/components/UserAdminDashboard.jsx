import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserAdminDashboard.css";

export default function UserAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: "create", user: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, user: null });
  const [form, setForm] = useState({ name: "", email: "", role: "student" });

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    setForm(user ? { name: user.name, email: user.email, role: user.role || "student" } : { name: "", email: "", role: "student" });
  };

  const closeModal = () => setModal({ open: false, mode: "create", user: null });

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === "create") {
        await axios.post("http://localhost:3000/api/users", form);
      } else if (modal.mode === "edit") {
        await axios.put(`http://localhost:3000/api/users/${modal.user.user_id}`, form);
      }
      closeModal();
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

// Handle delete user
  const handleDelete = (user) => {
    setConfirmDelete({ open: true, user });
  };

// Confirm delete user
  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${confirmDelete.user.user_id}`);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setConfirmDelete({ open: false, user: null });
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>User Management</h2>
        <button className="add-btn" onClick={() => openModal("create")}>Add User</button>
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-row">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-row">No users found</td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="user-row">
                  <td>{idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal("edit", user)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(user)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Edit */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.mode === "create" ? "Add User" : "Edit User"}</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <label>
                Name:
                <input name="name" value={form.name} onChange={handleFormChange} required autoFocus />
              </label>
              <label>
                Email:
                <input name="email" type="email" value={form.email} onChange={handleFormChange} required />
              </label>
              <label>
                Role:
                <select name="role" value={form.role} onChange={handleFormChange}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="lab_to">Lab TO</option>
                  <option value="lecture_in_charge">Lecture In Charge</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {modal.mode === "create" ? "Create" : "Update"}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.open && (
        <div className="modal-overlay" onClick={() => setConfirmDelete({ open: false, user: null })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <b>{confirmDelete.user.name}</b>?</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDeleteUser}>Delete</button>
              <button className="cancel-btn" onClick={() => setConfirmDelete({ open: false, user: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
