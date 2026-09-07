import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Communities from './pages/Communities';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import Search from './pages/Search';
import Submit from './pages/Submit';

import CommunityModTools from './pages/CommunityModTools';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/communities" element={<Communities />} />
      <Route path="/create-community" element={<CreateCommunity />} />
      <Route path="/community/:communityId" element={<Community />} />
      <Route path="/community/:communityId/mod" element={<CommunityModTools />} />
      <Route path="/post/:postId" element={<Post />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/search" element={<Search />} />
      <Route path="/submit" element={<Submit />} />
    </Routes>
  );
}

export default App;