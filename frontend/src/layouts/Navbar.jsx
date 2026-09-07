import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      navigate(`/search?q=${e.target.value}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-circle"></div>
          <span className="logo-text">circlo</span>
        </Link>
        
        <div className="navbar-search">
          <Input placeholder="Search Circlo" onKeyDown={handleSearch} />
        </div>
        
        <div className="navbar-actions">
          <Link to="/login"><Button variant="outline">Log In</Button></Link>
          <Link to="/register"><Button variant="primary">Sign Up</Button></Link>
        </div>
      </div>
    </nav>
  );
};