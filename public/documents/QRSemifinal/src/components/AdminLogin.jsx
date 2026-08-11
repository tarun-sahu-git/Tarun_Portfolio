import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiShield, FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { adminLogin } from '../api'; // path check kar lena
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (adminLogin(creds.username, creds.password)) {
        toast.success('Admin logged in successfully!');
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials!');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="card-header">
          <div className="header-icon admin-icon">
            <FiShield />
          </div>
          <h2>Admin Login</h2>
          <p>Access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              placeholder="Admin Username"
              value={creds.username}
              onChange={(e) => setCreds({ ...creds, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Admin Password"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-admin" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span> Logging in...
              </span>
            ) : (
              <>
                <FiLogIn /> Admin Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;