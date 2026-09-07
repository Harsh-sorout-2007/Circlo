import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        // Backend handles tokens via HTTP-only cookies
        // We must tell the frontend AuthContext to refresh before navigating
        await checkAuth();
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 422 && Array.isArray(data.errors)) {
          // Validation errors from express-validator
          setServerError(data.message || 'Please fix the errors below.');
        } else if (status === 401 || status === 400 || status === 404) {
          // Invalid credentials or missing fields handled by auth.controller.js
          setServerError(data.message || 'Invalid email or password.');
        } else {
          // Generic server error
          setServerError(data.message || 'An error occurred during login. Please try again.');
        }
      } else if (error.request) {
        setServerError('Cannot reach the Circlo backend. Make sure the backend server is running.');
      } else {
        setServerError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Log In</h1>
        
        {successMessage && <div className="error-message" style={{backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6'}}>{successMessage}</div>}
        {serverError && <div className="error-message">{serverError}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="login-link">
          New to Circlo? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
