import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/ProfileSettings.module.css';

export default function ProfileSettings({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile Data
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Upload State
  const [uploading, setUploading] = useState(false);

  // Password & Email Update
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");
      
      const token = session.access_token;
      setEmail(session.user.email);
      setNewEmail(session.user.email);

      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const profile = response.data;
      setFullName(profile.fullName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || ''); // Assuming bio field exists or will exist
      setAvatarUrl(profile.avatarUrl || '');

    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Could not load profile settings.");
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      setError(null);
      
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) throw new Error("Image size must be less than 2MB");
      if (!file.type.startsWith('image/')) throw new Error("File must be an image");

      const fileExt = file.name.split('.').pop();
      const fileName = `${username}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setSuccess("Image uploaded! Click 'Save Changes' to persist.");

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading image");
    } finally {
      setUploading(false);
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

      // Update backend profile
      await axios.put('http://localhost:8080/api/profile', 
        { fullName, username, bio, avatarUrl }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      let authUpdates = {};

      if (newEmail !== email) {
          authUpdates.email = newEmail;
      }

      if (newPassword) {
         if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
         authUpdates.password = newPassword;
      }

      if (Object.keys(authUpdates).length > 0) {
          const { error: authError } = await supabase.auth.updateUser(authUpdates);
          if (authError) throw authError;
          if (authUpdates.email) {
              setSuccess("Profile updated! Please check your new email for verification.");
          } else {
              setSuccess("Profile and password updated successfully!");
          }
      } else {
          setSuccess("Profile updated successfully!");
      }
      
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loadingState}>Loading...</div>;

  return (
    <div className={styles.wrapper}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>

        <div className={styles.glassCard}>
            {/* LEFT COLUMN */}
            <div className={styles.leftCol}>
                <div className={styles.avatarContainer}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className={styles.avatarImg} onError={(e) => e.target.style.display='none'} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                </div>
                
                <div className={styles.avatarInputGroup}>
                    <label htmlFor="avatar-upload" className={styles.uploadBtn}>
                        {uploading ? 'Uploading...' : 'Change Photo'}
                    </label>
                    <input 
                        id="avatar-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={styles.hiddenInput}
                        disabled={uploading}
                    />
                    <span className={styles.miniLabel}>Max 2MB</span>
                </div>
                
                <div className={styles.badge}>
                    <span>Member</span>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.rightCol}>
                
                {/* --- HEADER WITH BACK BUTTON --- */}
                <div className={styles.headerRow}>
                    <button onClick={onBack} className={styles.backIconBtn} type="button" title="Back to Feed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <div>
                        <h2 className={styles.title}>Edit Profile</h2>
                        <p className={styles.subtitle}>Manage your public information and security</p>
                    </div>
                </div>

                {error && <div className={styles.alertError}>{error}</div>}
                {success && <div className={styles.alertSuccess}>{success}</div>}

                <form className={styles.formGrid} onSubmit={handleSave}>
                    <div className={styles.fieldGroup}>
                        <label>Full Name</label>
                        <input type="text" className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label>Username (Immutable)</label>
                        <input type="text" className={`${styles.input} ${styles.disabled}`} value={username} disabled />
                    </div>
                    <div className={styles.fieldGroupFull}>
                         <label>Bio</label>
                         <textarea className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
                    </div>

                    <div className={styles.divider}><span>Security Settings</span></div>

                    <div className={styles.fieldGroupFull}>
                        <label>Email Address</label>
                        <input type="email" className={styles.input} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                        <input type="password" className={styles.input} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                        <input type="password" className={styles.input} placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className={styles.actionRow}>
                        <button type="button" className={styles.cancelBtn} onClick={onBack}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}
