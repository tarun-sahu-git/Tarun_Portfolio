import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../api';
import {
  FiUser, FiMail, FiPhone, FiUserPlus, FiMapPin,
  FiBook, FiArrowRight, FiSend, FiCheckCircle
} from 'react-icons/fi';
import './RegistrationPage.css';

const RegistrationPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', contact: '', address: '', collegeName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      setFormData({ ...formData, contact: value.replace(/[^0-9]/g, '') });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) { toast.error('❌ Enter your name!'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error('❌ Enter valid email!'); return; }
    if (!/^[0-9]{10}$/.test(formData.contact)) { toast.error('❌ Enter valid 10-digit number!'); return; }
    if (!formData.address.trim()) { toast.error('❌ Enter your address!'); return; }

    setLoading(true);
    try {
      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

      const result = await registerUser({
        id: String(Date.now()),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        contact: formData.contact.trim(),
        address: formData.address.trim(),
        collegeName: formData.collegeName.trim(),
        registeredAt: timestamp
      });

      if (!result || result.status === 'error') {
        toast.error(`❌ ${result?.message || 'Registration failed!'}`);
        return;
      }

      toast.success('✅ Registration Successful! Waiting for admin approval...', {
        position: 'top-center', autoClose: 4000
      });

      setFormData({ name: '', email: '', contact: '', address: '', collegeName: '' });
      setTimeout(() => navigate('/login'), 3000);

    } catch (error) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('🌐 Network Error! Check internet connection.');
      } else {
        toast.error(`❌ ${error.message || 'Registration failed'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const valid = (condition) => condition ? <FiCheckCircle className="reg-valid-icon" /> : null;

  return (
    <div className="reg-page">
      <div className="reg-card">
        <div className="reg-header">
          <div className="reg-header-icon"><FiUserPlus size={28} /></div>
          <h2 className="reg-title">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="reg-form">

          <div className="reg-two-column">
            <div className="reg-input-group">
              <label className="reg-label">Full Name</label>
              <div className="reg-input-wrapper">
                <FiUser className="reg-input-icon" />
                <input type="text" name="name" placeholder="Enter your full name"
                  value={formData.name} onChange={handleChange} className="reg-input" required />
                {valid(formData.name.trim().length > 2)}
              </div>
            </div>

            <div className="reg-input-group">
              <label className="reg-label">Email Address</label>
              <div className="reg-input-wrapper">
                <FiMail className="reg-input-icon" />
                <input type="email" name="email" placeholder="example@email.com"
                  value={formData.email} onChange={handleChange} className="reg-input" required />
                {valid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
              </div>
            </div>
          </div>

          <div className="reg-two-column">
            <div className="reg-input-group">
              <label className="reg-label">Contact Number</label>
              <div className="reg-input-wrapper">
                <FiPhone className="reg-input-icon" />
                <input type="tel" name="contact" placeholder="10-digit mobile number"
                  value={formData.contact} onChange={handleChange} maxLength="10"
                  inputMode="numeric" pattern="[0-9]*" className="reg-input" required />
                {valid(/^[0-9]{10}$/.test(formData.contact))}
              </div>
            </div>

            <div className="reg-input-group">
              <label className="reg-label">College Name</label>
              <div className="reg-input-wrapper">
                <FiBook className="reg-input-icon" />
                <input type="text" name="collegeName" placeholder="Your college name"
                  value={formData.collegeName} onChange={handleChange} className="reg-input" />
                {valid(formData.collegeName.trim().length > 2)}
              </div>
            </div>
          </div>

          <div className="reg-input-group">
            <label className="reg-label">Address</label>
            <div className="reg-input-wrapper">
              <FiMapPin className="reg-input-icon" />
              <input type="text" name="address" placeholder="Your address"
                value={formData.address} onChange={handleChange} className="reg-input" required />
              {valid(formData.address.trim().length > 5)}
            </div>
          </div>

          <button type="submit" className={`reg-submit-btn ${loading ? 'reg-btn-loading' : ''}`} disabled={loading}>
            {loading ? (
              <span className="reg-loading-text"><span className="reg-spinner"></span>Registering...</span>
            ) : (
              <span className="reg-btn-content"><FiSend size={18} />Register<FiArrowRight size={18} /></span>
            )}
          </button>
        </form>

        <div className="reg-footer">
          <p className="reg-footer-text">
            Already have an account?{' '}<Link to="/login" className="reg-login-link">Login here</Link>
          </p>
          <div className="reg-notice-box">
            <span className="reg-notice-icon">🔒</span>
            <p className="reg-notice-text">Your account will be active after admin approval</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;