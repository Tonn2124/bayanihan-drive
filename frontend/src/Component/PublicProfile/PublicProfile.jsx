import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../../supabaseClient';
import styles from '../../Style/PublicProfile.module.css';

// SVG Icons
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function PublicProfile({ userId, onClose, onNavigate, fromCampaignId }) {
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        // 1. Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        setProfile(profileData);

        // 2. Fetch User's Campaigns
        const res = await axios.get(`http://localhost:8080/api/campaigns/user/${userId}`);
        setCampaigns(res.data || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount || 0);

  // --- HANDLER: Smart Close ---
  // If we came from a campaign, navigate back to it. Otherwise just close.
  const handleClose = () => {
    // 1. If we have history to go back to, navigate there
    if (fromCampaignId && onNavigate) {
        onNavigate('campaignDetails', fromCampaignId);
    } 
    // 2. Otherwise, check if onClose is a valid function before calling it
    else if (typeof onClose === 'function') {
        onClose();
    } 
    // 3. Fallback if the prop was forgotten (prevents crash)
    else {
        console.warn("PublicProfile: 'onClose' prop is missing!");
    }
  };

  // Loading State
  if (loading) return (
    <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modalContainer}>
            <div className={styles.loadingState}>Loading Profile...</div>
        </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      {/* Centered Modal Card */}
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        
        {/* Close Button (Top Right X) */}
        <button onClick={handleClose} className={styles.closeBtn} title="Close">
           <XIcon />
        </button>

        <div className={styles.scrollableContent}>
            {/* Banner */}
            <div className={styles.banner}></div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                
                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.avatarWrapper}>
                        {profile.avatar_url ? (
                            <img 
                                src={profile.avatar_url} 
                                alt={profile.full_name} 
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    
                    <h1 className={styles.name}>{profile.full_name}</h1>
                    <p className={styles.username}>
                        @{profile.username} 
                        <span className={styles.roleBadge}>{profile.role || 'Member'}</span>
                    </p>
                    
                    <p className={styles.bio}>
                        {profile.bio || "This user hasn't written a bio yet."}
                    </p>

                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{campaigns.length}</span>
                            <span className={styles.statLabel}>Campaigns</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{new Date(profile.created_at || Date.now()).getFullYear()}</span>
                            <span className={styles.statLabel}>Joined</span>
                        </div>
                    </div>
                </div>

                {/* Campaigns Grid */}
                <div className={styles.campaignsSection}>
                    <div className={styles.sectionTitle}>
                        <span>Public Campaigns</span>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h3>No active campaigns</h3>
                            <p>{profile.full_name} hasn't started any fundraisers yet.</p>
                        </div>
                    ) : (
                        <div className={styles.campaignGrid}>
                            {campaigns.map(c => (
                                <div 
                                    key={c.id} 
                                    className={styles.card} 
                                    onClick={() => {
                                        // When clicking a campaign here, we assume standard behavior
                                        // (Close profile, open new campaign)
                                        if(onNavigate) onNavigate('campaignDetails', c.id);
                                        else onClose();
                                    }}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        <img 
                                            src={c.coverImageUrl || 'https://placehold.co/600x400?text=Campaign'} 
                                            alt={c.title} 
                                            className={styles.cardImg} 
                                        />
                                        {c.category && <span className={styles.categoryTag}>{c.category}</span>}
                                    </div>
                                    
                                    <div className={styles.cardBody}>
                                        <h4 className={styles.cardTitle}>{c.title}</h4>
                                        <div className={styles.cardMeta}>
                                            <div>
                                                <div className={styles.amountLabel}>Raised</div>
                                                <div className={styles.amountValue}>{formatCurrency(c.currentAmount)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}