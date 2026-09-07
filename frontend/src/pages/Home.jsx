import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { CreatePostWidget } from '../components/CreatePostWidget';
import { MOCK_POSTS } from '../services/mockData';

const Home = () => {
  return (
    <MainLayout>
      <CreatePostWidget />
      <div className="flex flex-col gap-4">
        {MOCK_POSTS.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Home;