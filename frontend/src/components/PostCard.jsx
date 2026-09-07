import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Trash2 } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { VoteControls } from './VoteControls';
import { IconComment, IconBookmark } from './ui/Icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PostCard.css';

export const PostCard = ({ post }) => {
  const [currentScore, setCurrentScore] = useState(post.score || 0);
  const [userVote, setUserVote] = useState(post.userVote || 0);

  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState(null);

  const [saveLoading, setSaveLoading] = useState(false);

  // Formatting date nicely
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = new Date() - new Date(dateStr);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const { currentUser } = useAuth();

  const handleVote = async (value) => {
    if (!currentUser) {
      alert("Please log in to vote.");
      return;
    }
    if (voteLoading) return;

    if (userVote === value) {
      try {
        setVoteLoading(true);
        setVoteError(null);

        const response = await api.delete('/votes', {
          data: {
            targetId: post._id,
            targetType: "Post"
          }
        });

        if (!response.data.success) {
          throw new Error("Failed to remove vote.");
        }

        setCurrentScore(response.data.data.score);
        setUserVote(0);
      } catch (err) {
        setVoteError(
          err.response?.data?.message ||
          err.message ||
          "Failed to remove vote."
        );
      } finally {
        setVoteLoading(false);
      }
      return;
    }

    try {
      setVoteLoading(true);
      setVoteError(null);

      const response = await api.post('/votes', {
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      window.location.reload(); // Simple optimistic update for V1
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      alert("Please log in to save posts.");
      return;
    }
    if (saveLoading) return;

    try {
      setSaveLoading(true);

      if (isSaved) {
        const response = await api.delete(`/savedPost/${post._id}`);
        if (!response.data.success) throw new Error();
        setIsSaved(false);
      } else {
        const response = await api.post(`/savedPost/${post._id}`);
        if (!response.data.success) throw new Error();
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReport = async () => {
    if (!currentUser) {
      alert("Please log in to report posts.");
      return;
    }
    if (!post.community) {
      alert("You can only report posts within a community.");
      return;
    }
    const reason = prompt("Enter reason for reporting this post:");
    if (!reason) return;

    try {
      const response = await api.post('/reports', {
        target: post._id,
        targetType: "Post",
        reason: reason
      });
      if (response.data.success) {
        alert("Post reported successfully. Moderators will review it.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to report post.");
    }
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?.username}`} className="post-avatar-link">
          <Avatar src={post.author?.avatar} size={36} />
        </Link>
        <div className="post-header-info">
          <div className="post-header-top">
            <Link to={`/profile/${post.author?.username}`} className="post-author-name">
              {post.author?.username}
            </Link>
            <span className="post-dot">·</span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
          {post.community && (
            <Link to={`/community/${post.community._id}`} className="post-community-name">
              c/{post.community.name}
            </Link>
          )}
        </div>
      </div>

      <div className="post-content">
        <Link to={`/post/${post._id}`} className="post-title-link">
          <h3 className="post-title">{post.title}</h3>
        </Link>

        {post.content && (
          <p className="post-body">{post.content}</p>
        )}

        {post.type === 'IMAGE' && (
          <div className="post-media-container">
            <img src={post.mediaURL} alt={post.title} className="post-media" />
          </div>
        )}

        {post.type === 'VIDEO' && (
          <div className="post-media-container">
            <video src={post.mediaURL} controls className="post-media" />
          </div>
        )}

        {post.type === 'LINK' && (
          <a href={post.linkURL} target="_blank" rel="noreferrer" className="post-link">
            {post.linkURL}
          </a>
        )}
      </div>

      <div className="post-actions-row">
        <div className="post-actions-left">
          <div className="action-group">
            <VoteControls
              score={currentScore}
              userVote={userVote}
              onUpvote={() => handleVote(1)}
              onDownvote={() => handleVote(-1)}
            />
            {voteError && (
              <span className="vote-error-text" title={voteError}>!</span>
            )}
          </div>
          
          <Link to={`/post/${post._id}`} className="action-btn comment-btn">
            <IconComment />
            <span className="action-count">{post.commentCount}</span>
          </Link>

          <button className="action-btn hover:text-red-500" onClick={handleReport} title="Report post">
            <Flag size={18} strokeWidth={2} />
          </button>
          
          {currentUser && (currentUser._id === post.author?._id || (post.community?.owner && currentUser._id === post.community?.owner)) && (
            <button className="action-btn text-red-500/70 hover:text-red-500" onClick={handleDelete} title="Delete post">
              <Trash2 size={18} strokeWidth={2} />
            </button>
          )}
        </div>

        <button 
          className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saveLoading}
          aria-label={isSaved ? "Remove from saved" : "Save post"}
        >
          <IconBookmark active={isSaved} />
        </button>
      </div>
    </article>
  );
};