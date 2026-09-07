const fs = require('fs');
const path = require('path');

const files = {
  'src/App.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './layouts/Navbar';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Communities from './pages/Communities';
import Community from './pages/Community';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import Search from './pages/Search';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* All other routes get the Navbar. The pages themselves decide on Sidebar/Layouts */}
        <Route path="*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/community/:communityId" element={<Community />} />
              <Route path="/post/:postId" element={<Post />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </>
        } />
      </Routes>
    </>
  );
}

export default App;`,

  'src/pages/Home.jsx': `import React from 'react';
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

export default Home;`,

  'src/pages/Communities.jsx': `import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { MOCK_COMMUNITIES } from '../services/mockData';

const Communities = () => {
  return (
    <MainLayout sidebar={<Card className="p-4"><h3>Top Communities</h3><p>Discover new places</p></Card>}>
      <h2>All Communities</h2>
      <div className="flex flex-col gap-4 mt-4">
        {MOCK_COMMUNITIES.map(c => (
          <Card key={c._id} className="flex justify-between items-center p-4">
            <div>
              <Link to={\`/community/\${c._id}\`} className="text-bold">c/{c.name}</Link>
              <p className="text-muted">{c.memberCount.toLocaleString()} members</p>
              <p className="mt-2">{c.description}</p>
            </div>
            <Button variant="primary">Join</Button>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default Communities;`,

  'src/pages/Community.jsx': `import React from 'react';
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

export default Community;`,

  'src/pages/Post.jsx': `import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { MOCK_POSTS } from '../services/mockData';

const Post = () => {
  const { postId } = useParams();
  const post = MOCK_POSTS.find(p => p._id === postId);

  return (
    <MainLayout>
      {post ? (
        <>
          <PostCard post={post} />
          <Card className="p-4 mt-4">
            <h4 className="mb-4">Comments</h4>
            <div className="text-muted">Comments are not yet fully implemented.</div>
          </Card>
        </>
      ) : (
        <Card className="p-4 text-center">Post not found</Card>
      )}
    </MainLayout>
  );
};

export default Post;`,

  'src/pages/Profile.jsx': `import React from 'react';
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

export default Profile;`,

  'src/pages/Saved.jsx': `import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { MOCK_POSTS } from '../services/mockData';

const Saved = () => {
  // Assume user saved the first post
  const savedPosts = [MOCK_POSTS[0]];

  return (
    <MainLayout>
      <h2>Saved Posts</h2>
      <div className="flex flex-col gap-4 mt-4">
        {savedPosts.map(post => <PostCard key={post._id} post={post} />)}
      </div>
    </MainLayout>
  );
};

export default Saved;`,

  'src/pages/Search.jsx': `import React from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { MOCK_POSTS } from '../services/mockData';

const Search = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const results = MOCK_POSTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <MainLayout>
      <h2>Search Results for "{query}"</h2>
      <div className="flex flex-col gap-4 mt-4">
        {results.length > 0 ? (
          results.map(post => <PostCard key={post._id} post={post} />)
        ) : (
          <div>No results found.</div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;`,
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Pages Generated');
