import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_POSTS, MOCK_COMMUNITIES } from '../services/mockData';

const Community = () => {
  const { communityId } = useParams();
  const community = MOCK_COMMUNITIES.find(c => c._id === communityId) || { name: 'Unknown', description: 'Not found' };
  
  const communityPosts = MOCK_POSTS.filter(p => p.community?._id === communityId);

  const sidebar = (
    <Card className="p-4">
      <h3>About Community</h3>
      <p className="mt-2">{community.description}</p>
      <p className="mt-2 text-muted">{community.memberCount?.toLocaleString() || 0} members</p>
      <Button variant="primary" className="w-full mt-4" style={{width: '100%'}}>Join</Button>
    </Card>
  );

  return (
    <div>
      <div style={{ background: 'var(--secondary-color)', height: '100px' }}></div>
      <div style={{ background: 'var(--card-bg)', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, background: '#fff', borderRadius: '50%', border: '4px solid #fff', marginTop: -40 }}></div>
          <div>
            <h2>c/{community.name}</h2>
            <p className="text-muted">c/{community.name}</p>
          </div>
        </div>
      </div>
      <MainLayout sidebar={sidebar}>
        <div className="flex flex-col gap-4">
          {communityPosts.length > 0 ? (
            communityPosts.map(post => <PostCard key={post._id} post={post} />)
          ) : (
            <Card className="p-4 text-center">No posts yet</Card>
          )}
        </div>
      </MainLayout>
    </div>
  );
};

export default Community;