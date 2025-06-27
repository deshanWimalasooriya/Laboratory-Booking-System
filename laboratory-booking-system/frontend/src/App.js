// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookLab from "./pages/BookLab";
import ViewBookings from "./pages/ViewBookings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-lab" element={<BookLab />} />
        <Route path="/view-bookings" element={<ViewBookings />} />
      </Routes>
    </Router>
  );
}

export default App;
