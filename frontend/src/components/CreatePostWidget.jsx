import React from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar';
import { useNavigate } from 'react-router-dom';
import './CreatePostWidget.css';

export const CreatePostWidget = () => {
  const navigate = useNavigate();
  return (
    <Card className="create-post-widget">
      <Avatar />
      <Input placeholder="Create Post" onClick={() => navigate('/submit')} />
    </Card>
  );
};