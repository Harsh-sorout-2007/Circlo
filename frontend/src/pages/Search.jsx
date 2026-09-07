import React from 'react';
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

export default Search;