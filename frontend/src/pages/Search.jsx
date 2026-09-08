import { useState, useEffect } from 'react';
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
  
  const [postError, setPostError] = useState(null);
  const [communityError, setCommunityError] = useState(null);
  const [userError, setUserError] = useState(null);

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
        const results = await Promise.allSettled([
          api.get(`/posts/search?q=${encodedQuery}`),
          api.get(`/communities/search?q=${encodedQuery}`),
          api.get(`/users/search?q=${encodedQuery}`)
        ]);

        const [postsRes, commsRes, usersRes] = results;

        if (postsRes.status === 'fulfilled' && postsRes.value.data.success) {
          setPostResults(postsRes.value.data.data.posts);
          setPostError(null);
        } else {
          setPostError("Failed to load posts.");
        }

        if (commsRes.status === 'fulfilled' && commsRes.value.data.success) {
          setCommunityResults(commsRes.value.data.data.communities);
          setCommunityError(null);
        } else {
          setCommunityError("Failed to load communities.");
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
          setUserResults(usersRes.value.data.data.users);
          setUserError(null);
        } else {
          setUserError("Failed to load users.");
        }
      } catch (err) {
        setError(err.response?.data?.message || 'A fatal error occurred during search.');
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
      ) : (postResults.length === 0 && communityResults.length === 0 && userResults.length === 0 && !postError && !communityError && !userError) ? (
        <Card className="p-8 text-center border-subtle text-muted">
          No results found for "{query}".
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {(userResults.length > 0 || userError) && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold border-b border-subtle pb-2">Users</h3>
              {userError ? (
                <div className="text-red-500 text-sm p-2">{userError}</div>
              ) : (
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
              )}
            </div>
          )}

          {(communityResults.length > 0 || communityError) && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold border-b border-subtle pb-2">Communities</h3>
              {communityError ? (
                <div className="text-red-500 text-sm p-2">{communityError}</div>
              ) : (
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
              )}
            </div>
          )}

          {(postResults.length > 0 || postError) && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold border-b border-subtle pb-2">Posts</h3>
              {postError ? (
                <div className="text-red-500 text-sm p-2">{postError}</div>
              ) : (
                postResults.map(post => <PostCard key={post._id} post={post} />)
              )}
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default Search;