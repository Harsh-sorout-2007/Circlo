import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Comment.css';

export const CommentCard = ({ comment, postId, onReply, onDelete }) => {
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState(null);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = new Date() - new Date(dateStr);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (hours < 1) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setReplyLoading(true);
    setReplyError(null);

    try {
      const response = await api.post(`/comments/post/${postId}`, {
        content: replyContent,
        parentComment: comment._id
      });

      if (response.data.success) {
        setReplyContent('');
        setShowReplyForm(false);
        if (onReply) onReply(response.data.data, comment._id);
      }
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/post/${postId}/${comment._id}`);
      if (onDelete) onDelete(comment._id, comment.parentComment);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (comment.isRemoved) {
    return (
      <div className="comment-card deleted">
        This comment was deleted
      </div>
    );
  }

  const isAuthor = currentUser && currentUser._id === comment.author?._id;

  return (
    <div className="comment-card">
      <div className="comment-card-header">
        <Link to={`/profile/${comment.author?.username}`}>
          <Avatar src={comment.author?.avatar} size={24} />
        </Link>
        <Link to={`/profile/${comment.author?.username}`} className="comment-author hover:underline">
          {comment.author?.username}
        </Link>
        <span className="comment-time">· {timeAgo(comment.createdAt)}</span>
      </div>
      
      <p className="comment-card-content">{comment.content}</p>
      
      <div className="comment-card-actions">
        {currentUser && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="comment-action-btn">
            Reply
          </button>
        )}
        {isAuthor && (
          <button onClick={handleDelete} className="comment-action-btn delete">
            Delete
          </button>
        )}
      </div>

      {showReplyForm && (
        <form className="comment-reply-form" onSubmit={handleReplySubmit}>
          <textarea
            className="comment-input"
            rows="2"
            placeholder="What are your thoughts?"
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
          />
          {replyError && <div className="text-red-500 text-xs">{replyError}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowReplyForm(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={replyLoading || !replyContent.trim()}>
              {replyLoading ? 'Replying...' : 'Reply'}
            </Button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => (
            <CommentCard 
              key={reply._id} 
              comment={reply} 
              postId={postId} 
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
