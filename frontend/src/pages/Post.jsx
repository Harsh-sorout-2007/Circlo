import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { CommentThread } from '../components/CommentThread';
import api from '../services/api';

const Post = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${postId}`);
        if (response.data.success) {
          setPost(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) return <MainLayout><div className="p-4 text-center text-muted">Loading post...</div></MainLayout>;
  
  if (error) return (
    <MainLayout>
      <Card className="p-8 text-center">
        <p className="text-red-500">{error}</p>
      </Card>
    </MainLayout>
  );

  return (
    <MainLayout>
      {post ? (
        <>
          <PostCard post={post} />
          <div className="mt-4">
            <CommentThread postId={postId} />
          </div>
        </>
      ) : (
        <Card className="p-4 text-center">Post not found</Card>
      )}
    </MainLayout>
  );
};

export default Post;