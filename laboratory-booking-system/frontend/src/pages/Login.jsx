import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("Login failed. Backend not responding.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="labreserve-bg">
      <motion.div
        className="labreserve-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="labreserve-left">
          <div className="labreserve-logo">
            {/* Replace with your logo or icon as needed */}
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="#2563eb"/>
              <path d="M28 15L32 35H24L28 15Z" fill="#fff"/>
              <circle cx="28" cy="39" r="2" fill="#fff"/>
            </svg>
            <span className="labreserve-title">LabReserve</span>
          </div>
          <p className="labreserve-desc">
            Welcome to LabReserve. Book and manage your laboratory sessions with ease and efficiency at University of Jaffna.
          </p>
        </div>
        <div className="labreserve-right">
          <h2 className="labreserve-welcome">Sign in to LabReserve</h2>
          <form className="labreserve-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <label htmlFor="email">E-mail Address</label>
              <input
                id="email"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="Enter your e-mail"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <motion.div
                className="labreserve-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            <motion.button
              className="labreserve-btn"
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
