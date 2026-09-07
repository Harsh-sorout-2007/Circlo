import React from 'react';
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
              <Link to={`/community/${c._id}`} className="text-bold">c/{c.name}</Link>
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

export default Communities;