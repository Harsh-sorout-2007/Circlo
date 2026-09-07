import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { MOCK_POSTS } from '../services/mockData';

const Profile = () => {
  const { username } = useParams();
  const userPosts = MOCK_POSTS.filter(p => p.author?.username === username);

  const sidebar = (
    <Card className="p-4 flex flex-col items-center">
      <Avatar size={80} className="mb-4" />
      <h3>u/{username}</h3>
      <p className="text-muted mb-4">Redditor for 1 year</p>
    </Card>
  );

  return (
    <MainLayout sidebar={sidebar}>
      <h4>Posts by u/{username}</h4>
      <div className="flex flex-col gap-4 mt-4">
        {userPosts.length > 0 ? (
          userPosts.map(post => <PostCard key={post._id} post={post} />)
        ) : (
          <Card className="p-4 text-center">No posts yet</Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;