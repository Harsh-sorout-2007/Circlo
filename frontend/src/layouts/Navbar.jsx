import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

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
          {loading ? (
            <div style={{ width: '130px' }}></div> // Placeholder to prevent layout shift
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              <Link to={`/profile/${currentUser.username}`} className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                <Avatar src={currentUser.avatar} size={32} />
                <span className="text-bold" style={{ fontSize: '14px' }}>u/{currentUser.username}</span>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="outline">Log In</Button></Link>
              <Link to="/register"><Button variant="primary">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};