import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { MOCK_POSTS } from '../services/mockData';

const Post = () => {
  const { postId } = useParams();
  const post = MOCK_POSTS.find(p => p._id === postId);

  return (
    <MainLayout>
      {post ? (
        <>
          <PostCard post={post} />
          <Card className="p-4 mt-4">
            <h4 className="mb-4">Comments</h4>
            <div className="text-muted">Comments are not yet fully implemented.</div>
          </Card>
        </>
      ) : (
        <Card className="p-4 text-center">Post not found</Card>
      )}
    </MainLayout>
  );
};

export default Post;