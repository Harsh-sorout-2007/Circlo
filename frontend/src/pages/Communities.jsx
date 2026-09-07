import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/communities?page=${page}&limit=12`);
        if (response.data.success) {
          setCommunities(response.data.data.communities);
          setPagination(response.data.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch communities');
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [page, currentUser]);

  const handleJoinLeave = async (communityId, isJoined) => {
    try {
      if (isJoined) {
        await api.post(`/communities/${communityId}/leave`);
        setCommunities(prev => prev.map(c => 
          c._id === communityId ? { ...c, userRole: null, memberCount: Math.max(0, c.memberCount - 1) } : c
        ));
      } else {
        await api.post(`/communities/${communityId}/join`);
        setCommunities(prev => prev.map(c => 
          c._id === communityId ? { ...c, userRole: 'MEMBER', memberCount: c.memberCount + 1 } : c
        ));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update membership');
    }
  };

  return (
    <MainLayout sidebar={
      <Card className="p-6">
        <h3 className="font-bold text-lg">Discover Communities</h3>
        <p className="text-muted text-sm mt-1">Find your people. Dive into anything.</p>
        <Link to="/create-community">
          <Button variant="primary" className="w-full mt-6">Create Community</Button>
        </Link>
      </Card>
    }>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Communities</h2>
      </div>
      
      {loading ? (
        <Card className="p-8 text-center text-muted">Loading communities...</Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500">{error}</p>
        </Card>
      ) : communities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted mb-4">No communities found.</p>
          <Link to="/create-community">
            <Button variant="outline">Create the first one</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {communities.map(c => (
              <Card 
                key={c._id} 
                className="p-5 flex flex-col justify-between"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' }}
                onClick={() => navigate(`/community/${c._id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                  e.currentTarget.style.borderColor = 'var(--brand-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                      {c.icon ? <img src={c.icon} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'c/'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 className="font-bold text-md truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>c/{c.name}</h4>
                      <p className="text-xs text-muted truncate">{c.memberCount?.toLocaleString() || 0} members</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center w-full">
                  {currentUser && c.owner !== currentUser._id ? (
                    <Button 
                      variant={c.userRole ? "outline" : "primary"} 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); handleJoinLeave(c._id, !!c.userRole); }}
                    >
                      {c.userRole ? 'Leave' : 'Join'}
                    </Button>
                  ) : currentUser && c.owner === currentUser._id ? (
                    <span className="text-xs font-semibold text-primary px-2 py-1 bg-surface-elevated rounded">Owner</span>
                  ) : null}
                  <span className="text-xs font-bold ml-auto" style={{ color: 'var(--brand-accent)' }}>Open</span>
                </div>
              </Card>
            ))}
          </div>
          
          {pagination && (pagination.hasNextPage || pagination.hasPreviousPage) && (
            <div className="flex justify-between items-center mt-6 p-4">
              <Button
                variant="outline"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-muted text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Communities;