import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const CommunityModTools = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const iconInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const [commRes, memRes, repRes] = await Promise.all([
        api.get(`/communities/id/${communityId}`),
        api.get(`/communities/${communityId}/members?limit=50`),
        api.get(`/reports/community/${communityId}?limit=50`)
      ]);

      if (commRes.data.success) {
        const c = commRes.data.data;
        setCommunity(c);
        setName(c.name || '');
        setDescription(c.description || '');
        setRules((c.rules || []).join('\n'));
      }
      if (memRes.data.success) {
        setMembers(memRes.data.data.members || memRes.data.data);
      }
      if (repRes.data.success) setReports(repRes.data.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mod tools');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('rules', JSON.stringify(rules.split('\n').filter(r => r.trim() !== '')));
      if (iconFile) formData.append('icon', iconFile);
      if (bannerFile) formData.append('banner', bannerFile);

      await api.patch(`/communities/id/${communityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Community settings updated successfully!');
      fetchData();
      setIconFile(null);
      setBannerFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await api.patch(`/communities/${communityId}/${userId}/role`, { role });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleBan = async (userId, isBanned) => {
    try {
      if (isBanned) {
        await api.patch(`/communities/${communityId}/members/${userId}/unban`);
      } else {
        await api.patch(`/communities/${communityId}/members/${userId}/ban`);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ban status');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/communities/${communityId}/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteCommunity = async () => {
    const confirmName = prompt(`Type "${community.name}" to confirm deletion of this community.`);
    if (confirmName !== community.name) {
      alert("Community name did not match.");
      return;
    }
    try {
      await api.delete(`/communities/id/${communityId}`);
      navigate('/communities');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete community');
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report status');
    }
  };

  if (loading) return <MainLayout><div className="p-4 text-center">Loading mod tools...</div></MainLayout>;
  if (error) return <MainLayout><Card className="p-4 text-red-500 text-center">{error}</Card></MainLayout>;

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mod Tools: c/{community?.name}</h2>
        <Button variant="ghost" onClick={() => navigate(`/community/${communityId}`)}>Back to Community</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Community Settings</h3>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600' }}>Community Icon</label>
                <div 
                  style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                  onClick={() => iconInputRef.current?.click()}
                  className="group"
                >
                  {iconFile ? (
                    <img src={URL.createObjectURL(iconFile)} alt="New Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : community?.icon ? (
                    <img src={community.icon} alt="Current Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span style={{ fontSize: '12px', color: 'white' }}>Change</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={iconInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={(e) => setIconFile(e.target.files[0])} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600' }}>Community Banner</label>
                <div 
                  style={{ height: '96px', width: '100%', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                  onClick={() => bannerInputRef.current?.click()}
                  className="group"
                >
                  {bannerFile ? (
                    <img src={URL.createObjectURL(bannerFile)} alt="New Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : community?.banner ? (
                    <img src={community.banner} alt="Current Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Click to upload banner</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span style={{ fontSize: '12px', color: 'white' }}>Change Banner</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={bannerInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={(e) => setBannerFile(e.target.files[0])} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Community Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '96px', fontSize: '14px', resize: 'vertical' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Rules (one per line)</label>
              <textarea 
                value={rules} 
                onChange={e => setRules(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '128px', fontSize: '14px', resize: 'vertical' }}
                placeholder="1. Be respectful&#10;2. No spam"
              />
            </div>

            <Button type="submit" variant="primary" disabled={savingSettings} style={{ marginTop: '8px' }}>
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Members ({members.length})</h3>
          <div className="flex flex-col gap-3">
            {members.map(member => (
              <div key={member._id} className="flex justify-between items-center bg-surface p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar src={member.user?.avatar} size={32} />
                  <div>
                    <div className="font-semibold">{member.user?.username}</div>
                    <div className="text-xs text-muted">Role: {member.role}</div>
                  </div>
                </div>
                {member.role !== 'OWNER' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {member.role === 'MEMBER' && (
                      <Button variant="outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleUpdateRole(member.user._id, 'MODERATOR')}>Promote</Button>
                    )}
                    {member.role === 'MODERATOR' && (
                      <Button variant="outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleUpdateRole(member.user._id, 'MEMBER')}>Demote</Button>
                    )}
                    <Button 
                      variant="outline" 
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                      onClick={() => handleBan(member.user._id, !!member.bannedAt)}
                    >
                      {member.bannedAt ? 'Unban' : 'Ban'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--brand-accent)' }}
                      onClick={() => handleRemove(member.user._id)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Reports ({reports.length})</h3>
          {reports.length === 0 ? (
            <p className="text-muted text-sm">No reports to review.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map(report => (
                <div key={report._id} className="p-3 bg-surface rounded-md flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold mb-1">Target: {report.targetType}</div>
                    <div className="text-sm mb-2">Reason: {report.reason}</div>
                    <div className="text-xs text-muted">Status: {report.status}</div>
                  </div>
                  {report.status === "PENDING" && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Button variant="outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleUpdateReport(report._id, "REVIEWED")}>Mark Reviewed</Button>
                      <Button variant="ghost" style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--text-muted)' }} onClick={() => handleUpdateReport(report._id, "DISMISSED")}>Dismiss</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border-red-500/50 bg-red-500/5 mt-4">
          <h3 className="font-bold text-red-500 mb-2">Danger Zone</h3>
          <p className="text-sm text-muted mb-4">Deleting a community is permanent and cannot be undone.</p>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteCommunity}>
            Delete Community
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CommunityModTools;
