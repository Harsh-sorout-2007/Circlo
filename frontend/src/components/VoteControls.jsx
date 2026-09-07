import React from 'react';
import './VoteControls.css';

export const VoteControls = ({ score = 0, onUpvote, onDownvote, userVote }) => {
  return (
    <div className="vote-controls">
      <button 
        className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`} 
        onClick={onUpvote}
      >
        ▲
      </button>
      <span className={`vote-score ${userVote === 1 ? 'upvoted' : userVote === -1 ? 'downvoted' : ''}`}>
        {score}
      </span>
      <button 
        className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`} 
        onClick={onDownvote}
      >
        ▼
      </button>
    </div>
  );
};