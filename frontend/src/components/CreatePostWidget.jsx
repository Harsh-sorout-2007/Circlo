import React from 'react';
import { Avatar } from './ui/Avatar';
import { useNavigate } from 'react-router-dom';
import './CreatePostWidget.css';

export const CreatePostWidget = ({ communityId }) => {
  const navigate = useNavigate();
  return (
    <div className="create-post-widget" onClick={() => navigate(communityId ? `/submit?communityId=${communityId}` : '/submit')}>
      <Avatar size={40} />
      <div className="create-post-input">
        <span className="create-post-placeholder">Start a discussion...</span>
      </div>
    </div>
  );
};