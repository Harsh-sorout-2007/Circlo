import React from 'react';
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
            <Link to={`/community/${post.community._id}`} className="post-community">c/{post.community.name}</Link>
          ) : null}
          <span className="post-author">
            Posted by <Link to={`/profile/${post.author?.username}`}>u/{post.author?.username}</Link>
          </span>
        </div>
        <Link to={`/post/${post._id}`} className="post-title-link">
          <h3 className="post-title">{post.title}</h3>
        </Link>
        
        {post.type === 'TEXT' && <p className="post-body">{post.content}</p>}
        {post.type === 'IMAGE' && <img src={post.mediaURL} alt={post.title} className="post-media" />}
        {post.type === 'VIDEO' && <video src={post.mediaURL} controls className="post-media" />}
        {post.type === 'LINK' && <a href={post.linkURL} target="_blank" rel="noreferrer" className="post-link">{post.linkURL}</a>}

        <div className="post-actions">
          <Link to={`/post/${post._id}`} className="action-btn">
            💬 {post.commentCount} Comments
          </Link>
          <button className="action-btn">💾 Save</button>
        </div>
      </div>
    </Card>
  );
};