import React, { useState, useEffect } from "react";
import "../styles/UserAdminDashboard.css"; // Import your CSS styles

// Mock API functions (replace with real API calls)
const mockUsers = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "User" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "User" }
];

export default function UserAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "create", user: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, user: null });
  const [form, setForm] = useState({ name: "", email: "", role: "User" });

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => setUsers(mockUsers), 400);
  }, []);

  const openModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    setForm(user ? { ...user } : { name: "", email: "", role: "User" });
  };

  const closeModal = () => setModal({ open: false, mode: "create", user: null });

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (modal.mode === "create") {
      setUsers(prev => [
        ...prev,
        { id: Date.now(), ...form }
      ]);
    } else if (modal.mode === "edit") {
      setUsers(prev =>
        prev.map(u => (u.id === modal.user.id ? { ...u, ...form } : u))
      );
    }
    closeModal();
  };

  const handleDelete = user => setConfirmDelete({ open: true, user });
  const confirmDeleteUser = () => {
    setUsers(prev => prev.filter(u => u.id !== confirmDelete.user.id));
    setConfirmDelete({ open: false, user: null });
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
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-row">Loading...</td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="user-row">
                  <td>{idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
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
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{modal.mode === "create" ? "Add User" : "Edit User"}</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <label>
                Name:
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </label>
              <label>
                Email:
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Role:
                <select name="role" value={form.role} onChange={handleFormChange}>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
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

      {/* Confirm Delete Modal */}
      {confirmDelete.open && (
        <div className="modal-overlay" onClick={() => setConfirmDelete({ open: false, user: null })}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
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
