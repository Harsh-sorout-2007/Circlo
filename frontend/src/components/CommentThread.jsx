import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CommentCard } from './CommentCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Comment.css';

export const CommentThread = ({ postId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newComment, setNewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/comments/post/${postId}`);
        if (response.data.success) {
          setComments(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const response = await api.post(`/comments/post/${postId}`, {
        content: newComment
      });

      if (response.data.success) {
        const commentWithAuthor = {
          ...response.data.data,
          author: currentUser,
          replies: []
        };
        setComments(prev => [commentWithAuthor, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReplyAdded = (reply, parentId) => {
    const updateReplies = (nodes) => {
      return nodes.map(node => {
        if (node._id === parentId) {
          return {
            ...node,
            replies: [...(node.replies || []), { ...reply, author: currentUser, replies: [] }]
          };
        }
        if (node.replies && node.replies.length > 0) {
          return { ...node, replies: updateReplies(node.replies) };
        }
        return node;
      });
    };
    setComments(prev => updateReplies(prev));
  };

  const handleCommentDeleted = (commentId, parentId) => {
    const markDeleted = (nodes) => {
      return nodes.map(node => {
        if (node._id === commentId) {
          return { ...node, isRemoved: true };
        }
        if (node.replies && node.replies.length > 0) {
          return { ...node, replies: markDeleted(node.replies) };
        }
        return node;
      });
    };
    setComments(prev => markDeleted(prev));
  };

  return (
    <Card className="p-6 border-subtle">
      <h3 className="font-bold mb-4">Comments</h3>

      {currentUser ? (
        <form className="comment-reply-form mb-4" onSubmit={handleAddComment}>
          <textarea
            className="comment-input"
            rows="3"
            placeholder="What are your thoughts?"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
          <div className="flex justify-end">
            <Button variant="primary" type="submit" disabled={submitLoading || !newComment.trim()}>
              {submitLoading ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-surface rounded-md border-subtle text-center text-muted mb-6">
          Please log in to comment.
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted py-4">Loading comments...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-muted py-8">No comments yet. Be the first to share your thoughts!</div>
      ) : (
        <div className="comment-thread-container">
          {comments.map(comment => (
            <CommentCard 
              key={comment._id} 
              comment={comment} 
              postId={postId}
              onReply={handleReplyAdded}
              onDelete={handleCommentDeleted}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
