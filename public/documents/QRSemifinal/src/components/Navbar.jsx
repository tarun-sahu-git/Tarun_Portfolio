import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import { MdQrCodeScanner } from 'react-icons/md';
import {
  getSession,
  isAdmin,
  clearSession,
  clearAdminSession
} from '../api';
import logo from "./YTQRLogo.png";
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getSession());
  const [adminLoggedIn, setAdminLoggedIn] = useState(isAdmin());

  const navigate = useNavigate();
  const location = useLocation();

  // session sync on route change
  useEffect(() => {
    setCurrentUser(getSession());
    setAdminLoggedIn(isAdmin());
  }, [location.pathname]);

  const handleUserLogout = () => {
    clearSession();
    setCurrentUser(null);
    setMenuOpen(false);
    navigate('/login');
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminLoggedIn(false);
    setMenuOpen(false);
    navigate('/admin-login');
  };

  const isActive = (path) => location.pathname === path;

  // ✅ one mode only
  const showAdmin = adminLoggedIn;
  const showUser = !adminLoggedIn && !!currentUser;
  const showGuest = !adminLoggedIn && !currentUser;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <img src={logo} className="logo-img" alt="YashviTech Logo" />
        </Link>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </div>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {showGuest && (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser /> Login
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/admin-login"
                  className={`nav-link admin-link ${isActive('/admin-login') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiShield /> Admin
                </Link>
              </li>
            </>
          )}

          {showUser && (
            <>
              <li className="nav-item">
                <Link
                  to="/scanner"
                  className={`nav-link ${isActive('/scanner') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <MdQrCodeScanner /> Scanner
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/my-report"
                  className={`nav-link ${isActive('/my-report') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  My Report
                </Link>
              </li>

              <li className="nav-item">
                <span className="user-badge">{currentUser?.empId}</span>
              </li>

              <li className="nav-item">
                <button className="nav-btn logout-btn" onClick={handleUserLogout}>
                  <FiLogOut /> Logout
                </button>
              </li>
            </>
          )}

          {showAdmin && (
            <>
              <li className="nav-item">
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>

              <li className="nav-item">
                <span className="user-badge admin-badge">
                  <FiShield /> Admin
                </span>
              </li>

              <li className="nav-item">
                <button className="nav-btn logout-btn" onClick={handleAdminLogout}>
                  <FiLogOut /> Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;