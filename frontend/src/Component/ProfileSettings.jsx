import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/ProfileSettings.module.css';

export default function ProfileSettings({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");
      const token = session.access_token;

      // Fetch from our new backend endpoint
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const profile = response.data;
      setFullName(profile.fullName || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatarUrl || '');
      setPhone(profile.phone || '');

    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Could not load profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      await axios.put('http://localhost:8080/api/profile', 
        {
            fullName,
            username,
            avatarUrl,
            phone
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setSuccess("Profile updated successfully!");
      
      // Optional: reload page or notify parent to refresh global user state
      // setTimeout(() => window.location.reload(), 1000); 

    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container} style={{textAlign: 'center'}}>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
            <h2 className={styles.title}>Profile Settings</h2>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className={styles.form} onSubmit={handleSave}>
            
            {/* Avatar Section */}
            <div className={styles.avatarSection}>
                <div className={styles.avatarPreview}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" onError={(e) => e.target.src = 'https://placehold.co/100x100?text=User'} />
                    ) : (
                        <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                </div>
                <div className={styles.avatarInputGroup}>
                    <label className={styles.label}>Avatar URL</label>
                    <input 
                        type="url" 
                        className={styles.input} 
                        placeholder="https://example.com/my-photo.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                    <div className={styles.helperText}>Paste a link to an image for your profile picture.</div>
                </div>
            </div>

            <div className="form-group">
                <label className={styles.label}>Full Name</label>
                <input 
                    type="text" 
                    className={styles.input} 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className={styles.label}>Username</label>
                <input 
                    type="text" 
                    className={styles.input} 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className={styles.label}>Phone Number</label>
                <input 
                    type="tel" 
                    className={styles.input} 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xxxxxxxxx"
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className={styles.cancelBtn} onClick={onBack}>
                    Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}