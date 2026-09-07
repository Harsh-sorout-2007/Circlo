import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'username' ? value.toLowerCase() : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    setFieldErrors({});

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName,
        password: formData.password,
      });

      if (response.status === 201) {
        navigate('/login', {
          state: { message: response.data.message || 'Registration successful! Please log in.' }
        });
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 422 && Array.isArray(data.errors)) {
          const extractedErrors = {};
          data.errors.forEach((err) => {
            const key = Object.keys(err)[0];
            extractedErrors[key] = err[key];
          });
          setFieldErrors(extractedErrors);
          setServerError(data.message || 'Please fix the errors below.');
        } else if (status === 409) {
          setServerError(data.message || 'An account with this email or username already exists.');
        } else {
          setServerError(data.message || 'An error occurred during registration. Please try again.');
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
        <h1 className="register-title">Sign Up</h1>

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
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              minLength={4}
              required
            />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              className="form-input"
              placeholder="How should we call you?"
              value={formData.displayName}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {fieldErrors.displayName && <span className="field-error">{fieldErrors.displayName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="login-link">
          Already a member? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
