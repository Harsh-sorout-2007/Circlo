import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        rules: formData.rules ? formData.rules.split('\n').filter(r => r.trim()) : []
      };

      const response = await api.post('/communities/create-community', payload);
      
      if (response.data.success) {
        navigate(`/community/${response.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout sidebar={<Card className="p-6"><h3 className="font-bold text-lg mb-2">Community Rules</h3><p className="text-secondary text-sm">Community names cannot be changed. Choose wisely.</p></Card>}>
      <h2 className="mb-4 text-2xl font-bold">Create a Community</h2>
      <Card className="p-6">
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
        
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. reactjs" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value.replace(/\s+/g, '')})}
              required 
              maxLength={21}
            />
            <span className="text-xs text-muted">Names cannot have spaces and must be unique.</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea 
              className="input" 
              rows="4" 
              placeholder="What is your community about?" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Rules (Optional)</label>
            <textarea 
              className="input" 
              rows="4" 
              placeholder="One rule per line" 
              value={formData.rules}
              onChange={e => setFormData({...formData, rules: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
};

export default CreateCommunity;
