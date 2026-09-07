import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Camera, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authRequired, setAuthRequired] = useState(false);
  const { currentUser, checkAuth } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/posts/user/${username}?limit=10&page=1`).catch((err) => err.response)
        ]);

        if (userRes.data.success) {
          setProfileUser(userRes.data.data);
          setEditDisplayName(userRes.data.data.displayName || '');
          setEditBio(userRes.data.data.bio || '');
        }
        
        if (postsRes?.status === 401) {
          setAuthRequired(true);
        } else if (postsRes?.data?.success) {
          setUserPosts(postsRes.data.data.posts || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <MainLayout><div className="p-4 text-center">Loading profile...</div></MainLayout>;
  
  if (error) return (
    <MainLayout>
      <Card className="p-8 text-center text-red-500">
        <p>{error}</p>
      </Card>
    </MainLayout>
  );

  if (!profileUser) return <MainLayout><p>User not found.</p></MainLayout>;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const formData = new FormData();
      if (editDisplayName) formData.append('displayName', editDisplayName);
      if (editBio !== undefined) formData.append('bio', editBio);
      if (editAvatarFile) formData.append('avatar', editAvatarFile);

      const response = await api.patch('/users/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setProfileUser(response.data.data);
        setIsEditing(false);
        setEditAvatarFile(null);
        checkAuth(); // update currentUser globally (Navbar)
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const isOwnProfile = currentUser && currentUser.username === profileUser.username;

  const sidebar = (
    <Card className="p-6 flex flex-col items-center" style={{ position: 'relative' }}>
      {isOwnProfile && !isEditing && (
        <button 
          onClick={() => setIsEditing(true)} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          title="Edit Profile"
        >
          <Edit2 size={18} />
        </button>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="w-full flex flex-col items-center">
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div 
              style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent' }}
              onClick={() => avatarInputRef.current?.click()}
              className="group"
            >
              <Avatar src={editAvatarFile ? URL.createObjectURL(editAvatarFile) : profileUser.avatar} size={96} />
              <div 
                className="group-hover:opacity-100 transition-opacity"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}
              >
                <Camera color="white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              ref={avatarInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={(e) => setEditAvatarFile(e.target.files[0])} 
            />
          </div>

          <div style={{ width: '100%', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>Display Name</label>
            <input 
              type="text" 
              value={editDisplayName} 
              onChange={(e) => setEditDisplayName(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px' }}
              placeholder="e.g. John Doe"
            />
          </div>

          <div style={{ width: '100%', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>Bio</label>
            <textarea 
              value={editBio} 
              onChange={(e) => setEditBio(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '96px', fontSize: '14px', resize: 'vertical' }}
              placeholder="Tell everyone a little about yourself"
            />
          </div>

          <div className="flex gap-2 w-full">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => {
              setIsEditing(false);
              setEditAvatarFile(null);
              setEditDisplayName(profileUser.displayName || '');
              setEditBio(profileUser.bio || '');
            }}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-4">
            <Avatar src={profileUser.avatar} size={96} />
          </div>
          <h3 className="font-bold text-xl text-center">{profileUser.displayName || profileUser.username}</h3>
          <p className="text-muted mb-4">u/{profileUser.username}</p>
          {profileUser.bio && (
            <p className="text-sm mb-4 text-center text-secondary">{profileUser.bio}</p>
          )}
        </>
      )}
    </Card>
  );

  return (
    <MainLayout sidebar={sidebar}>
      <h4 className="mb-4 font-bold">Posts</h4>
      <div className="flex flex-col gap-4">
        {authRequired ? (
           <Card className="p-8 text-center text-muted">
             Please log in to view this user's posts.
           </Card>
        ) : userPosts.length > 0 ? (
          userPosts.map(post => <PostCard key={post._id} post={post} />)
        ) : (
          <Card className="p-8 text-center text-muted">
            No posts found for this user.
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;