import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { RelativeTime } from './ui/RelativeTime';
import { VoteControls } from './VoteControls';
import './Comment.css';

export const CommentCard = ({ comment, postId, onReply, onDelete, onEdit }) => {
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const [currentScore, setCurrentScore] = useState(comment.score || 0);
  const [userVote, setUserVote] = useState(comment.userVote || 0);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState(null);

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
            targetId: comment._id,
            targetType: "Comment"
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
        targetId: comment._id,
        targetType: "Comment",
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await api.patch(`/comments/post/${postId}/${comment._id}`, {
        content: editContent
      });

      if (response.data.success) {
        setIsEditing(false);
        if (onEdit) onEdit(comment._id, editContent);
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setEditLoading(false);
    }
  };

  if (comment.isRemoved) {
    return (
      <div className="comment-card">
        <div className="p-3 text-muted italic">
          This comment was deleted
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => (
              <CommentCard 
                key={reply._id} 
                comment={reply} 
                postId={postId} 
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
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
        <span className="comment-time">· <RelativeTime dateStr={comment.createdAt} /></span>
      </div>
      
      {isEditing ? (
        <form className="comment-reply-form my-2" onSubmit={handleEditSubmit}>
          <textarea
            className="comment-input"
            rows="2"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          {editError && <div className="text-red-500 text-xs">{editError}</div>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={editLoading || !editContent.trim()}>
              {editLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="comment-card-content">{comment.content}</p>
      )}
      
      <div className="comment-card-actions">
        <div className="action-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VoteControls
            score={currentScore}
            userVote={userVote}
            onUpvote={() => handleVote(1)}
            onDownvote={() => handleVote(-1)}
          />
          {voteError && (
            <span className="vote-error-text text-red-500 text-xs" title={voteError}>!</span>
          )}
        </div>
        {currentUser && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="comment-action-btn">
            Reply
          </button>
        )}
        {isAuthor && (
          <button 
            onClick={() => { setIsEditing(true); setEditContent(comment.content); }} 
            className="comment-action-btn"
          >
            Edit
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
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
