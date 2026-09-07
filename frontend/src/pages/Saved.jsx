import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { MOCK_POSTS } from '../services/mockData';

const Saved = () => {
  // Assume user saved the first post
  const savedPosts = [MOCK_POSTS[0]];

  return (
    <MainLayout>
      <h2>Saved Posts</h2>
      <div className="flex flex-col gap-4 mt-4">
        {savedPosts.map(post => <PostCard key={post._id} post={post} />)}
      </div>
    </MainLayout>
  );
};

export default Saved;