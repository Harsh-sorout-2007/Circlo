import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { CreatePostWidget } from '../components/CreatePostWidget';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [communityRes, postsRes] = await Promise.all([
          api.get(`/communities/id/${communityId}`),
          api.get(`/posts/community/${communityId}?limit=10&page=1`)
        ]);

        if (communityRes.data.success) {
          const commData = communityRes.data.data;
          setCommunity(commData);
          if (commData.userRole) {
            setIsJoined(true);
          } else {
            setIsJoined(false);
          }
        }
        
        if (postsRes.data.success) {
          setCommunityPosts(postsRes.data.data.posts || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [communityId, currentUser, authLoading]);

  if (authLoading || loading) return <MainLayout><div className="p-4 text-center">Loading...</div></MainLayout>;
  
  if (error) return (
    <MainLayout>
      <Card className="p-8 text-center border-subtle">
        <p className="text-muted">{error}</p>
        {!currentUser && (
          <Link to="/login">
            <Button variant="primary" className="mt-4">Log in to view</Button>
          </Link>
        )}
      </Card>
    </MainLayout>
  );
  
  if (!community) return <MainLayout><p>Community not found.</p></MainLayout>;

  const handleJoinLeave = async () => {
    try {
      if (isJoined) {
        await api.post(`/communities/${communityId}/leave`);
        setIsJoined(false);
        setCommunity(prev => ({ ...prev, memberCount: Math.max(0, prev.memberCount - 1) }));
      } else {
        await api.post(`/communities/${communityId}/join`);
        setIsJoined(true);
        setCommunity(prev => ({ ...prev, memberCount: prev.memberCount + 1 }));
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Already a member
        setIsJoined(true);
      } else if (err.response?.status === 404 && isJoined) {
        // Not a member
        setIsJoined(false);
      } else {
        alert(err.response?.data?.message || 'Failed to update membership');
      }
    }
  };

  const sidebar = (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-3">About Community</h3>
      <p className="text-sm mb-4 text-secondary">{community.description}</p>
      <div className="flex items-center gap-2 text-muted text-sm mb-6">
        <Users size={16} />
        <span>{community.memberCount?.toLocaleString() || 0} members</span>
      </div>
      {currentUser && community.owner?._id !== currentUser._id && (
        <Button 
          variant={isJoined ? "outline" : "primary"} 
          className="w-full" 
          onClick={handleJoinLeave}
        >
          {isJoined ? 'Leave' : 'Join'}
        </Button>
      )}
      {currentUser && community.owner?._id === currentUser._id && (
        <div className="mt-4 p-4 bg-surface-elevated rounded-md text-sm text-center flex flex-col gap-3">
          <span className="font-semibold text-primary">You are the owner</span>
          <Button variant="outline" size="sm" onClick={() => navigate(`/community/${communityId}/mod`)}>Manage Community</Button>
        </div>
      )}
    </Card>
  );

  const communityHeader = (
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
      {community.banner ? (
        <div style={{ height: '140px', width: '100%', overflow: 'hidden' }}>
          <img src={community.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ height: '100px', width: '100%', background: 'linear-gradient(135deg, var(--brand-accent), #8a2be2)' }} />
      )}
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '24px 24px 24px', display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-48px' }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          background: 'var(--bg-base)', 
          borderRadius: '50%', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: 'var(--text-muted)',
          border: '4px solid var(--bg-surface)',
          zIndex: 10
        }}>
           {community.icon ? <img src={community.icon} alt="icon" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : 'c/'}
        </div>
        <div style={{ flex: 1, marginBottom: '4px' }}>
          <h2 className="text-3xl font-bold">c/{community.name}</h2>
          <p className="text-sm text-muted mt-1">{community.memberCount?.toLocaleString() || 0} members</p>
        </div>
        <div style={{ marginBottom: '4px' }}>
          {currentUser && community.owner?._id !== currentUser._id && (
            <Button 
              variant={isJoined ? "outline" : "primary"} 
              onClick={handleJoinLeave}
            >
              {isJoined ? 'Joined' : 'Join Community'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout sidebar={sidebar} header={communityHeader}>
      <div className="flex flex-col gap-4">
        <CreatePostWidget communityId={communityId} />
        {communityPosts.length > 0 ? (
          communityPosts.map(post => <PostCard key={post._id} post={post} />)
        ) : (
          <Card className="p-8 text-center text-muted">
            <p>No posts yet. Be the first to post!</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Community;