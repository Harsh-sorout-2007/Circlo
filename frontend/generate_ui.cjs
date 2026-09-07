const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const uiDir = path.join(componentsDir, 'ui');
const layoutsDir = path.join(__dirname, 'src', 'layouts');
const servicesDir = path.join(__dirname, 'src', 'services');

// Ensure directories
[uiDir, layoutsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
  // UI Components
  'src/components/ui/Button.jsx': `import React from 'react';
import './Button.css';
export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <button className={\`btn btn-\${variant} \${className}\`} {...props}>
      {children}
    </button>
  );
};`,
  'src/components/ui/Button.css': `.btn {
  padding: 4px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease-in-out;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--secondary-color); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--secondary-hover); }
.btn-outline { border-color: var(--secondary-color); color: var(--secondary-color); background: transparent; }
.btn-outline:hover:not(:disabled) { background: rgba(0,121,211,0.1); }
.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover:not(:disabled) { background: rgba(26,26,27,0.1); color: var(--text-primary); }`,

  'src/components/ui/Card.jsx': `import React from 'react';
import './Card.css';
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={\`card \${className}\`} {...props}>
      {children}
    </div>
  );
};`,
  'src/components/ui/Card.css': `.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}`,

  'src/components/ui/Input.jsx': `import React from 'react';
import './Input.css';
export const Input = ({ className = '', error, ...props }) => {
  return (
    <div className="input-wrapper">
      <input className={\`input \${error ? 'input-error' : ''} \${className}\`} {...props} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};`,
  'src/components/ui/Input.css': `.input-wrapper { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  background: #f6f7f8;
  transition: all 0.2s;
}
.input:hover, .input:focus { border-color: var(--secondary-color); background: #fff; outline: none; }
.input-error { border-color: red; }
.input-error-text { color: red; font-size: 12px; }`,

  'src/components/ui/Avatar.jsx': `import React from 'react';
export const Avatar = ({ src, alt = "Avatar", size = 32, className = '' }) => {
  return (
    <img 
      src={src || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"} 
      alt={alt} 
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      className={className}
    />
  );
};`,

  // Layouts
  'src/layouts/Navbar.jsx': `import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      navigate(\`/search?q=\${e.target.value}\`);
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
};`,
  'src/layouts/Navbar.css': `.navbar {
  height: var(--navbar-height);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.navbar-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.logo-circle { width: 32px; height: 32px; background: var(--primary-color); border-radius: 50%; }
.logo-text { font-size: 20px; font-weight: bold; color: var(--text-primary); letter-spacing: -0.5px; }
.navbar-search { flex: 1; max-width: 600px; margin: 0 20px; }
.navbar-actions { display: flex; gap: 12px; }`,

  'src/layouts/Sidebar.jsx': `import React from 'react';
import { Card } from '../components/ui/Card';
import './Sidebar.css';

export const Sidebar = ({ children }) => {
  return (
    <aside className="sidebar">
      {children || (
        <Card className="sidebar-card">
          <div className="sidebar-header">
            <h3>Home</h3>
          </div>
          <div className="sidebar-body">
            <p>Your personal Circlo frontpage. Come here to check in with your favorite communities.</p>
          </div>
        </Card>
      )}
    </aside>
  );
};`,
  'src/layouts/Sidebar.css': `.sidebar { width: 312px; display: flex; flex-direction: column; gap: 16px; flex-shrink: 0; }
.sidebar-card { padding: 12px; }
.sidebar-header { margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
.sidebar-body { font-size: 14px; color: var(--text-primary); line-height: 1.4; }
@media (max-width: 768px) { .sidebar { display: none; } }`,

  'src/layouts/MainLayout.jsx': `import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import './MainLayout.css';

export const MainLayout = ({ children, sidebar }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="main-container">
        <main className="main-content">
          {children}
        </main>
        <Sidebar>{sidebar}</Sidebar>
      </div>
    </div>
  );
};`,
  'src/layouts/MainLayout.css': `.main-layout { min-height: 100vh; display: flex; flex-direction: column; }
.main-container {
  display: flex;
  justify-content: center;
  margin: 24px auto;
  max-width: 1200px;
  width: 100%;
  padding: 0 24px;
  gap: 24px;
}
.main-content {
  width: 100%;
  max-width: 640px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}`,

  // Feature Components
  'src/components/VoteControls.jsx': `import React from 'react';
import './VoteControls.css';

export const VoteControls = ({ score = 0, onUpvote, onDownvote, userVote }) => {
  return (
    <div className="vote-controls">
      <button 
        className={\`vote-btn upvote \${userVote === 1 ? 'active' : ''}\`} 
        onClick={onUpvote}
      >
        ▲
      </button>
      <span className={\`vote-score \${userVote === 1 ? 'upvoted' : userVote === -1 ? 'downvoted' : ''}\`}>
        {score}
      </span>
      <button 
        className={\`vote-btn downvote \${userVote === -1 ? 'active' : ''}\`} 
        onClick={onDownvote}
      >
        ▼
      </button>
    </div>
  );
};`,
  'src/components/VoteControls.css': `.vote-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  padding: 8px 4px;
  background: #f8f9fa;
  border-right: 1px solid var(--border-color);
}
.vote-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #878a8c;
  padding: 2px;
  border-radius: 2px;
}
.vote-btn:hover { background: rgba(26,26,27,0.1); }
.vote-btn.upvote:hover, .vote-btn.upvote.active { color: var(--upvote-color); }
.vote-btn.downvote:hover, .vote-btn.downvote.active { color: var(--downvote-color); }
.vote-score { font-size: 12px; font-weight: 700; margin: 4px 0; }
.vote-score.upvoted { color: var(--upvote-color); }
.vote-score.downvoted { color: var(--downvote-color); }`,

  'src/components/PostCard.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { VoteControls } from './VoteControls';
import './PostCard.css';

export const PostCard = ({ post }) => {
  return (
    <Card className="post-card flex">
      <VoteControls score={post.score} />
      <div className="post-content-area">
        <div className="post-meta">
          {post.community ? (
            <Link to={\`/community/\${post.community._id}\`} className="post-community">c/{post.community.name}</Link>
          ) : null}
          <span className="post-author">
            Posted by <Link to={\`/profile/\${post.author?.username}\`}>u/{post.author?.username}</Link>
          </span>
        </div>
        <Link to={\`/post/\${post._id}\`} className="post-title-link">
          <h3 className="post-title">{post.title}</h3>
        </Link>
        
        {post.type === 'TEXT' && <p className="post-body">{post.content}</p>}
        {post.type === 'IMAGE' && <img src={post.mediaURL} alt={post.title} className="post-media" />}
        {post.type === 'VIDEO' && <video src={post.mediaURL} controls className="post-media" />}
        {post.type === 'LINK' && <a href={post.linkURL} target="_blank" rel="noreferrer" className="post-link">{post.linkURL}</a>}

        <div className="post-actions">
          <Link to={\`/post/\${post._id}\`} className="action-btn">
            💬 {post.commentCount} Comments
          </Link>
          <button className="action-btn">💾 Save</button>
        </div>
      </div>
    </Card>
  );
};`,
  'src/components/PostCard.css': `.post-card { display: flex; transition: border 0.1s; cursor: pointer; }
.post-card:hover { border-color: var(--border-hover); }
.post-content-area { padding: 8px; width: 100%; display: flex; flex-direction: column; overflow: hidden;}
.post-meta { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; display: flex; gap: 4px; }
.post-community { color: var(--text-primary); font-weight: 700; text-decoration: none; }
.post-community:hover { text-decoration: underline; }
.post-author a { color: var(--text-secondary); }
.post-author a:hover { text-decoration: underline; }
.post-title-link { text-decoration: none; color: var(--text-primary); }
.post-title { font-size: 18px; font-weight: 500; margin-bottom: 8px; }
.post-body { font-size: 14px; color: var(--text-primary); margin-bottom: 12px; max-height: 250px; overflow: hidden; text-overflow: ellipsis; }
.post-media { max-width: 100%; max-height: 512px; object-fit: contain; margin-bottom: 12px; background: #000; border-radius: 4px; }
.post-link { color: var(--secondary-color); font-size: 14px; word-break: break-all; margin-bottom: 12px; display: block; }
.post-actions { display: flex; gap: 4px; }
.action-btn { background: transparent; border: none; color: #878a8c; font-size: 12px; font-weight: 700; padding: 6px 8px; border-radius: 2px; cursor: pointer; display: flex; align-items: center; gap: 4px; text-decoration: none; }
.action-btn:hover { background: rgba(26,26,27,0.1); }`,

  'src/components/CreatePostWidget.jsx': `import React from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar';
import { useNavigate } from 'react-router-dom';
import './CreatePostWidget.css';

export const CreatePostWidget = () => {
  const navigate = useNavigate();
  return (
    <Card className="create-post-widget">
      <Avatar />
      <Input placeholder="Create Post" onClick={() => navigate('/submit')} />
    </Card>
  );
};`,
  'src/components/CreatePostWidget.css': `.create-post-widget { display: flex; align-items: center; gap: 12px; padding: 8px 12px; margin-bottom: 16px; }`,

  // Mock Data
  'src/services/mockData.js': `export const MOCK_POSTS = [
  {
    _id: 'p1',
    title: 'Just built my first fullstack app!',
    content: 'It took me 3 months, but I finally finished my Reddit clone.',
    type: 'TEXT',
    score: 124,
    commentCount: 42,
    author: { username: 'coder123' },
    community: { _id: 'c1', name: 'reactjs' },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'p2',
    title: 'Look at this cute cat',
    mediaURL: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    type: 'IMAGE',
    score: 843,
    commentCount: 112,
    author: { username: 'catlover' },
    community: { _id: 'c2', name: 'aww' },
    createdAt: new Date().toISOString()
  }
];

export const MOCK_COMMUNITIES = [
  { _id: 'c1', name: 'reactjs', description: 'React discussion', memberCount: 120500 },
  { _id: 'c2', name: 'aww', description: 'Cute things', memberCount: 30400200 },
];
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('UI Components Generated');
