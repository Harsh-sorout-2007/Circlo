import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import api from '../services/api';

const Search = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [postResults, setPostResults] = useState([]);
  const [communityResults, setCommunityResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setPostResults([]);
        setCommunityResults([]);
        setUserResults([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const encodedQuery = encodeURIComponent(query);
        const [postsRes, commsRes, usersRes] = await Promise.all([
          api.get(`/posts/search?q=${encodedQuery}`),
          api.get(`/communities/search?q=${encodedQuery}`),
          api.get(`/users/search?q=${encodedQuery}`)
        ]);

        if (postsRes.data.success) {
          setPostResults(postsRes.data.data.posts);
        }
        if (commsRes.data.success) {
          setCommunityResults(commsRes.data.data.communities);
        }
        if (usersRes.data.success) {
          setUserResults(usersRes.data.data.users);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <MainLayout sidebar={<Card className="p-4 border-subtle"><h3 className="font-bold">Search Circlo</h3><p className="text-sm text-muted mt-2">Discover posts, topics, and communities.</p></Card>}>
      <h2 className="mb-4 text-xl font-bold">Search Results for "{query}"</h2>
      
      {loading ? (
        <Card className="p-8 text-center border-subtle text-muted">Searching...</Card>
      ) : error ? (
        <Card className="p-8 text-center border-subtle text-red-500">{error}</Card>
      ) : !query ? (
        <Card className="p-8 text-center border-subtle text-muted">
          Please enter a search query.
        </Card>
      ) : (postResults.length === 0 && communityResults.length === 0 && userResults.length === 0) ? (
        <Card className="p-8 text-center border-subtle text-muted">
          No results found for "{query}".
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {userResults.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold border-b border-subtle pb-2">Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userResults.map(user => (
                  <Link key={user._id} to={`/profile/${user.username}`}>
                    <Card className="p-4 hover:-translate-y-1 transition-transform cursor-pointer h-full border-subtle flex items-center gap-4">
                      <Avatar src={user.avatar} size={48} />
                      <div>
                        <h4 className="font-bold">{user.displayName || user.username}</h4>
                        <p className="text-sm text-muted">u/{user.username}</p>
                        {user.bio && <p className="text-xs text-muted mt-1 line-clamp-1">{user.bio}</p>}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {communityResults.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold border-b border-subtle pb-2">Communities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityResults.map(community => (
                  <Link key={community._id} to={`/community/${community._id}`}>
                    <Card className="p-4 hover:-translate-y-1 transition-transform cursor-pointer h-full border-subtle flex items-center gap-4">
                      <Avatar src={community.icon} size={48} />
                      <div>
                        <h4 className="font-bold">c/{community.name}</h4>
                        <p className="text-sm text-muted line-clamp-1">{community.description}</p>
                        <p className="text-xs text-muted mt-1">{community.memberCount} members</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {postResults.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold border-b border-subtle pb-2">Posts</h3>
              {postResults.map(post => <PostCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default Search;