import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';

const Submit = () => {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('communityId');
  const navigate = useNavigate();

  const [postType, setPostType] = useState('TEXT');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    linkURL: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload;
      let headers = {};

      if (postType === 'IMAGE' || postType === 'VIDEO') {
        payload = new FormData();
        payload.append('title', formData.title);
        payload.append('type', postType);
        if (formData.content) payload.append('content', formData.content);
        if (mediaFile) payload.append('media', mediaFile);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = {
          title: formData.title,
          type: postType
        };
        if (formData.content) payload.content = formData.content;
        if (postType === 'LINK' && formData.linkURL) payload.linkURL = formData.linkURL;
      }

      let response;
      if (communityId) {
        response = await api.post(`/posts/community/${communityId}`, payload, { headers });
      } else {
        response = await api.post('/posts/personal', payload, { headers });
      }

      if (response.data.success) {
        if (communityId) {
          navigate(`/community/${communityId}`);
        } else {
          navigate(`/`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout sidebar={<Card className="p-6"><h3 className="font-bold mb-2">Posting to Circlo</h3><p className="text-secondary text-sm mt-2">1. Remember the human</p><p className="text-secondary text-sm mt-2">2. Behave like you would in real life</p></Card>}>
      <h2 className="mb-4 text-2xl font-bold">Create a Post {communityId ? 'in Community' : 'to Profile'}</h2>
      <Card className="p-6">
        <div className="flex gap-2 border-b pb-4 mb-4" style={{ borderColor: 'var(--border-color)' }}>
          {['TEXT', 'IMAGE', 'VIDEO', 'LINK'].map(type => (
            <Button 
              key={type} 
              variant={postType === type ? 'primary' : 'ghost'} 
              onClick={() => setPostType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input 
            placeholder="Title" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required 
            maxLength={300}
          />

          <textarea 
            className="input" 
            rows="6" 
            placeholder="Text (optional)" 
            style={{ resize: 'vertical' }}
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
          />

          {(postType === 'IMAGE' || postType === 'VIDEO') && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Upload {postType.toLowerCase()}</label>
              <input 
                type="file" 
                accept={postType === 'IMAGE' ? "image/*" : "video/*"}
                onChange={e => setMediaFile(e.target.files[0])}
                required
                className="input py-2"
              />
            </div>
          )}

          {postType === 'LINK' && (
            <Input 
              type="url"
              placeholder="https://..." 
              value={formData.linkURL}
              onChange={e => setFormData({...formData, linkURL: e.target.value})}
              required 
            />
          )}

          <div className="flex justify-end items-center mt-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  );
};

export default Submit;
