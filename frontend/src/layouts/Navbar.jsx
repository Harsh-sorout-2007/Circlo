import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { IconSearch } from '../components/ui/Icons';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, loading, checkAuth } = useAuth();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      navigate(`/search?q=${e.target.value}`);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      await checkAuth(); // this will set currentUser to null
      navigate('/');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/assets/circlo-icon.png" alt="Circlo Logo" className="logo-image" />
            <span className="logo-text">circlo</span>
          </Link>
          
          <Link to="/communities" className={`navbar-link ${window.location.pathname.startsWith('/communities') || window.location.pathname.startsWith('/community') ? 'active' : ''}`}>
            Communities
          </Link>
        </div>
        
        <div className="navbar-search-container">
          <IconSearch className="navbar-search-icon" />
          <input 
            type="text" 
            className="navbar-search-input" 
            placeholder="Search..." 
            onKeyDown={handleSearch} 
          />
        </div>
        
        <div className="navbar-actions">
          {loading ? (
            <div style={{ width: '130px' }}></div>
          ) : currentUser ? (
            <div className="flex items-center gap-4">
              <Link to="/saved" className="text-sm font-medium hover:text-brand-accent">
                Saved
              </Link>
              <Link to={`/profile/${currentUser.username}`} className="navbar-profile-link">
                <span className="navbar-username">{currentUser.username}</span>
                <Avatar src={currentUser.avatar} size={32} />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Log in</Button></Link>
              <Link to="/register"><Button variant="primary">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};