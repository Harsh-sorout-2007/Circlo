import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { CreatePostWidget } from '../components/CreatePostWidget';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Home = () => {
  const { currentUser, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('new');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/posts/feed', {
          params: {
            page,
            limit: 10,
            sort
          }
        });

        if (!response.data.success) {
          throw new Error("Failed to load feed");
        }

        setPosts(response.data.data.posts);
        setPagination(response.data.data.pagination);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Please log in to view your feed.");
        } else {
          setError(err.response?.data?.message || "Failed to load home feed.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if auth is done and user is logged in
    if (!authLoading && currentUser) {
      fetchFeed();
    } else if (!authLoading && !currentUser) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }
  }, [page, sort, currentUser, authLoading]);

  const handleSortChange = (newSort) => {
    if (newSort !== sort) {
      setSort(newSort);
      setPage(1); // Reset to first page on sort change
    }
  };

  const navigate = useNavigate();

  const sidebar = (
    <Card className="p-6">
      <h3 className="font-bold mb-2">Home</h3>
      <p className="text-sm text-muted mb-4">Your personal Circlo frontpage. Discover communities, view saved posts, and join the conversation.</p>
      <div className="flex flex-col gap-2">
        <Button variant="primary" onClick={() => navigate('/communities')} className="w-full">Discover Communities</Button>
        <Button variant="outline" onClick={() => navigate('/create-community')} className="w-full">Create Community</Button>
        {currentUser && (
          <Button variant="ghost" onClick={() => navigate('/saved')} className="w-full">Saved Posts</Button>
        )}
      </div>
    </Card>
  );

  return (
    <MainLayout sidebar={sidebar}>
      <CreatePostWidget />

      {!authLoading && !currentUser ? (
        <Card className="p-4 text-center">
          <h3 className="mb-2">Welcome to Circlo</h3>
          <p className="text-muted">Please log in or sign up to view your personalized home feed.</p>
        </Card>
      ) : (
        <>
          {/* Sort Controls */}
          <Card className="p-2 mb-4 flex gap-2">
            <Button
              variant={sort === 'new' ? 'primary' : 'ghost'}
              onClick={() => handleSortChange('new')}
            >
              New
            </Button>
            <Button
              variant={sort === 'top' ? 'primary' : 'ghost'}
              onClick={() => handleSortChange('top')}
            >
              Top
            </Button>
          </Card>

          {/* Feed Content */}
          {loading ? (
            <Card className="p-4 text-center text-muted">Loading feed...</Card>
          ) : error ? (
            <Card className="p-4 text-center text-red-500" style={{ color: 'red' }}>{error}</Card>
          ) : posts.length === 0 ? (
            <Card className="p-4 text-center text-muted">No posts found. Join some communities to fill your feed!</Card>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}

              {/* Pagination Controls */}
              {pagination && (pagination.hasNextPage || pagination.hasPreviousPage) && (
                <Card className="p-4 flex justify-between items-center mt-2">
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
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Home;