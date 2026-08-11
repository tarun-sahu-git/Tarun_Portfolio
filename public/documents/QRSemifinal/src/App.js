import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Navbar from './components/Navbar';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ScannerPage from './components/ScannerPage';
import EmployeeReport from './components/EmployeeReport';

import { getSession, isAdmin } from './api';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─── Inline route protection ──────────────────────────────────
const RequireAuth = ({ children, type }) => {
  if (type === 'admin' && !isAdmin()) {
    return <Navigate to="/admin-login" replace />;
  }

  if (type === 'user' && !getSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ top: '80px' }}
        />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <RequireAuth type="admin">
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/scanner"
              element={
                <RequireAuth type="user">
                  <ScannerPage />
                </RequireAuth>
              }
            />

            <Route
              path="/my-report"
              element={
                <RequireAuth type="user">
                  <EmployeeReport />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;