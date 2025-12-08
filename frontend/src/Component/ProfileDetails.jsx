import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import styles from '../Style/ProfileDetails.module.css';

export default function ProfileDetails({ targetUserId, session, onNavigate }) {
  const [userProfile, setUserProfile] = useState(null);
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Tab State: 'campaigns' or 'donations'
  const [activeTab, setActiveTab] = useState('campaigns'); 

  const currentUser = session?.user;
  const isOwner = currentUser?.id === targetUserId;

  useEffect(() => {
    const fetchData = async () => {
      const idToFetch = targetUserId || session?.user?.id;
      if (!idToFetch) return;
      
      try {
        setLoading(true);

        // 1. Fetch Basic Profile Info (Always from Supabase)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', idToFetch)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);

        // 2. Fetch Lists (Campaigns/Donations)
        let campaignsData = [];
        let donationsData = [];

        if (isOwner) {
            // --- OWNER: Use your AXIOS endpoints ---
            const token = session.access_token;
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            try {
                // Fetch My Campaigns
                const campRes = await axios.get('http://localhost:8080/api/campaigns/my-campaigns', config);
                campaignsData = campRes.data || [];
            } catch (err) {
                console.error("Axios Campaigns Error:", err);
            }

            try {
                // Fetch My Donations
                const donRes = await axios.get('http://localhost:8080/api/donations/my-donations', config);
                donationsData = donRes.data || [];
            } catch (err) {
                console.error("Axios Donations Error:", err);
            }

        } else {
            // --- VISITOR: Use Supabase (Public Data) ---
            const { data: cData } = await supabase
                .from('campaigns')
                .select('*')
                .eq('userId', idToFetch); // Check if your column is 'userId' or 'user_id'
            campaignsData = cData || [];

            const { data: dData } = await supabase
                .from('donations')
                .select('*, campaigns(title)')
                .eq('userId', idToFetch);
            donationsData = dData || [];
        }

        // 3. Process items based on active tab
        if (activeTab === 'campaigns') {
            setItems(campaignsData.map(c => ({ ...c, type: 'campaign' })));
        } else {
            setItems(donationsData.map(d => ({ ...d, type: 'donation' })));
        }

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUserId, session, isOwner, activeTab]);

  if (loading) return <div className={styles.loadingState}>Loading...</div>;
  if (!userProfile) return <div className={styles.errorState}>User not found.</div>;

  return (
    <div className={styles.container}>
      {/* HEADER (Compact, No Cover) */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
            <div className={styles.avatarWrapper}>
                {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className={styles.avatar} />
                ) : (
                    <div className={styles.avatarPlaceholder}>{userProfile.full_name?.charAt(0)}</div>
                )}
            </div>
            
            <div className={styles.headerInfo}>
                <h2 className={styles.name}>{userProfile.full_name}</h2>
                <p className={styles.role}>{userProfile.role || 'Member'}</p>
                <div className={styles.statsRow}>
                     <span>📍 {userProfile.location || 'Philippines'}</span>
                </div>
            </div>
        </div>
        
        {userProfile.bio && <p className={styles.bio}>{userProfile.bio}</p>}

        {isOwner && (
            <button className={styles.editBtn} onClick={() => onNavigate('profileSettings')}>
                Edit Profile
            </button>
        )}
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <button 
            className={`${styles.tab} ${activeTab === 'campaigns' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('campaigns')}
        >
            Campaigns
        </button>
        <button 
            className={`${styles.tab} ${activeTab === 'donations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('donations')}
        >
            Donations
        </button>
      </div>

      {/* SCROLLABLE LIST */}
      <div className={styles.listArea}>
        {items.length === 0 ? (
            <div className={styles.emptyState}>No {activeTab} found.</div>
        ) : (
            items.map((item, index) => (
                <div key={index} className={styles.card}>
                    {item.type === 'campaign' ? (
                        // Campaign Card
                        <div onClick={() => onNavigate('campaignDetails', {id: item.id})} className={styles.clickable}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>{item.title}</span>
                                <span className={styles.cardDate}>
                                    {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={styles.cardDesc}>{item.description?.substring(0, 80)}...</p>
                            <div className={styles.progressBarBg}>
                                <div 
                                    className={styles.progressBarFill} 
                                    style={{width: `${Math.min((item.raised / item.goal) * 100, 100)}%`}}
                                ></div>
                            </div>
                            <div className={styles.cardFooter}>
                                <span>Raised: ₱{item.raised?.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        // Donation Card
                        <div className={styles.donationRow}>
                            <div className={styles.icon}>❤️</div>
                            <div className={styles.donationDetails}>
                                <p className={styles.donationText}>
                                    Donated <strong>₱{item.amount?.toLocaleString()}</strong>
                                </p>
                                <p className={styles.donationSub}>
                                    to {item.campaigns?.title || `Campaign #${item.campaignId}`}
                                </p>
                            </div>
                            <span className={styles.cardDate}>
                                {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
}