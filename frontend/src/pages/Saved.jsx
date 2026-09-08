import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import api from '../services/api';

const Saved = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        const response = await api.get('/savedPost');
        if (response.data.success) {
          setSavedPosts(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch saved posts');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <MainLayout sidebar={<Card className="p-4 border-subtle"><h3 className="font-bold">Saved Posts</h3><p className="text-sm text-muted mt-2">All your bookmarked posts live here.</p></Card>}>
      <h2 className="mb-4 text-xl font-bold">Saved Posts</h2>
      
      {loading ? (
        <Card className="p-8 text-center border-subtle text-muted">Loading saved posts...</Card>
      ) : error ? (
        <Card className="p-8 text-center border-subtle text-red-500">{error}</Card>
      ) : savedPosts.length === 0 ? (
        <Card className="p-8 text-center border-subtle text-muted">
          You haven't saved any posts yet.
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {savedPosts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </MainLayout>
  );
};

export default Saved;