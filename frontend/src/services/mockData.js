export const MOCK_POSTS = [
  {
    _id: 'p1',
    title: 'Just built my first fullstack app!',
    content: 'It took me 3 months, but I finally finished my Reddit clone.',
    type: 'TEXT',
    score: 124,
    commentCount: 42,
    author: { username: 'coder123' },
    community: { _id: 'c1', name: 'reactjs' },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'p2',
    title: 'Look at this cute cat',
    mediaURL: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    type: 'IMAGE',
    score: 843,
    commentCount: 112,
    author: { username: 'catlover' },
    community: { _id: 'c2', name: 'aww' },
    createdAt: new Date().toISOString()
  }
];

export const MOCK_COMMUNITIES = [
  { _id: 'c1', name: 'reactjs', description: 'React discussion', memberCount: 120500 },
  { _id: 'c2', name: 'aww', description: 'Cute things', memberCount: 30400200 },
];
