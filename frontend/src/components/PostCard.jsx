import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { VoteControls } from './VoteControls';
import api from '../services/api';
import './PostCard.css';

export const PostCard = ({ post }) => {
  const [currentScore, setCurrentScore] = useState(post.score || 0);
  const [userVote, setUserVote] = useState(post.userVote || 0);

  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleVote = async (value) => {
    if (voteLoading) return;

    if (userVote === value) {
      setVoteError("You already voted in this way");
      return;
    }

    try {
      setVoteLoading(true);
      setVoteError(null);

      const response = await api.post('/votes/', {
        targetId: post._id,
        targetType: "Post",
        value: value
      });

      if (!response.data.success) {
        throw new Error("Failed to submit vote.");
      }

      setCurrentScore(response.data.data.score);
      setUserVote(value);
    } catch (err) {
      setVoteError(
        err.response?.data?.message ||
        err.message ||
        "Failed to submit vote."
      );
    } finally {
      setVoteLoading(false);
    }
  };

  const handleSave = async () => {
    if (saveLoading) return;

    try {
      setSaveLoading(true);
      setSaveError(null);

      if (isSaved) {
        const response = await api.delete(`/savedPost/${post._id}`);

        if (!response.data.success) {
          throw new Error("Failed to remove saved post.");
        }

        setIsSaved(false);
      } else {
        const response = await api.post(`/savedPost/${post._id}`);

        if (!response.data.success) {
          throw new Error("Failed to save post.");
        }

        setIsSaved(true);
      }
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update saved post."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Card className="post-card flex">
      <div className="flex flex-col items-center">
        <VoteControls
          score={currentScore}
          userVote={userVote}
          onUpvote={() => handleVote(1)}
          onDownvote={() => handleVote(-1)}
        />

        {voteError && (
          <span
            className="text-red-500 text-xs mt-1 text-center px-1"
            style={{
              maxWidth: '60px',
              color: 'red'
            }}
          >
            {voteError}
          </span>
        )}
      </div>

      <div className="post-content-area">
        <div className="post-meta">
          {post.community ? (
            <Link
              to={`/community/${post.community._id}`}
              className="post-community"
            >
              c/{post.community.name}
            </Link>
          ) : null}

          <span className="post-author">
            Posted by{' '}
            <Link to={`/profile/${post.author?.username}`}>
              u/{post.author?.username}
            </Link>
          </span>
        </div>

        <Link
          to={`/post/${post._id}`}
          className="post-title-link"
        >
          <h3 className="post-title">{post.title}</h3>
        </Link>

        {post.type === 'TEXT' && (
          <p className="post-body">{post.content}</p>
        )}

        {post.type === 'IMAGE' && (
          <img
            src={post.mediaURL}
            alt={post.title}
            className="post-media"
          />
        )}

        {post.type === 'VIDEO' && (
          <video
            src={post.mediaURL}
            controls
            className="post-media"
          />
        )}

        {post.type === 'LINK' && (
          <a
            href={post.linkURL}
            target="_blank"
            rel="noreferrer"
            className="post-link"
          >
            {post.linkURL}
          </a>
        )}

        <div className="post-actions">
          <Link
            to={`/post/${post._id}`}
            className="action-btn"
          >
            💬 {post.commentCount} Comments
          </Link>

          <button
            className="action-btn"
            onClick={handleSave}
            disabled={saveLoading}
          >
            {isSaved ? '🔖 Saved' : '💾 Save'}
          </button>
        </div>

        {saveError && (
          <span
            className="text-red-500 text-xs mt-1"
            style={{ color: 'red' }}
          >
            {saveError}
          </span>
        )}
      </div>
    </Card>
  );
};