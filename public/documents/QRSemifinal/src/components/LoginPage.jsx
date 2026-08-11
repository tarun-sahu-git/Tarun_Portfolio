import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLogIn, FiCreditCard } from 'react-icons/fi';
import { MdQrCodeScanner } from 'react-icons/md';
import { loginUser } from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empId.trim()) {
      toast.error('❌ Enter your Employee ID!');
      return;
    }

    setLoading(true);

    try {
      toast.info('🔄 Verifying...', { autoClose: 2000 });

      const result = await loginUser(empId.trim().toUpperCase());

      if (result.success) {
        toast.success(`✅ Welcome, ${result.user.name}!`);
        navigate('/scanner');
      } else {
        toast.error('❌ ' + result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('❌ Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className='form-div'>
        <div className="form-card">
          <div className="card-header">
            <div className="header-icon login-icon">
              <MdQrCodeScanner />
            </div>
            <h2>Login</h2>
            <p>Enter your ID to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <FiCreditCard className="input-icon" />
              <input
                type="text"
                placeholder="Enter ID"
                value={empId}
                onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                className="emp-id-input"
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading"> <span className="spinner"></span> Verifying...</span>
              ) : (
                <> <FiLogIn /> Login </>
              )}
            </button>
          </form>

          <div className="card-footer">
            <p> Don't have an account? <Link to="/register">Register here</Link></p>
            <p> Admin? <Link to="/admin-login">Admin Login</Link> </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;