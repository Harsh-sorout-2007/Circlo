import React from 'react';
import { IconUpvote, IconDownvote } from './ui/Icons';
import './VoteControls.css';

export const VoteControls = ({ score = 0, onUpvote, onDownvote, userVote }) => {
  return (
    <div className={`vote-controls-pill ${userVote === 1 ? 'active-up' : userVote === -1 ? 'active-down' : ''}`}>
      <button 
        className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`} 
        onClick={onUpvote}
        aria-label="Upvote"
      >
        <IconUpvote active={userVote === 1} />
      </button>
      
      <span className={`vote-score ${userVote === 1 ? 'upvoted' : userVote === -1 ? 'downvoted' : ''}`}>
        {score}
      </span>
      
      <button 
        className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`} 
        onClick={onDownvote}
        aria-label="Downvote"
      >
        <IconDownvote active={userVote === -1} />
      </button>
    </div>
  );
};