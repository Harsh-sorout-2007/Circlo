import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Submit = () => {
  return (
    <MainLayout sidebar={<Card className="p-4"><h3>Posting to Circlo</h3><p className="text-muted mt-2">1. Remember the human</p><p className="text-muted mt-2">2. Behave like you would in real life</p></Card>}>
      <h2 className="mb-4">Create a Post</h2>
      <Card className="p-4">
        {/* Unimplemented submit form UI */}
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); alert("Submit functionality is not yet connected to the backend API."); }}>
          <Input 
            placeholder="Title" 
            required 
          />
          <textarea 
            className="input" 
            rows="6" 
            placeholder="Text (optional)" 
            style={{ resize: 'vertical' }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-muted text-sm">Note: Image/Video uploads require backend integration.</span>
            <Button variant="primary" type="submit">Post</Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
};

export default Submit;
