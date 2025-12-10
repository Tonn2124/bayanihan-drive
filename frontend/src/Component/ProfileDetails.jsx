import React, { useState } from 'react';
import MyCampaigns from './MyCampaigns';
import MyDonations from './MyDonations';
import styles from '../Style/ProfileDetails.module.css';

// Icons
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);

export default function ProfileDetails({ profile, onClose, onEdit, onNavigate }) {
  const [activeTab, setActiveTab] = useState('campaigns');

  if (!profile) return null;

  // --- FIX: Create a wrapper function that closes the modal THEN navigates ---
  const handleCampaignClick = (page, id) => {
      onClose(); // 1. Close this modal immediately
      if (onNavigate) {
          onNavigate(page, id); // 2. Navigate to the campaign details
      }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        
        <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>

        {/* Header */}
        <div className={styles.header}>
            <div className={styles.profileInfoWrapper}>
                <div className={styles.avatarWrapper}>
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="User" className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                <div className={styles.details}>
                    <h2 className={styles.name}>{profile.full_name}</h2>
                    <div className={styles.metaRow}>
                        <span className={styles.username}>@{profile.username}</span>
                        <span className={styles.roleBadge}>{profile.role || 'MEMBER'}</span>
                    </div>
                    <p className={styles.bio}>{profile.bio || "No bio yet."}</p>
                </div>
            </div>
            
            <button className={styles.editBtn} onClick={onEdit}>
                <EditIcon /> Edit
            </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'campaigns' ? styles.activeTab : ''}`} onClick={() => setActiveTab('campaigns')}>My Campaigns</button>
            <button className={`${styles.tab} ${activeTab === 'donations' ? styles.activeTab : ''}`} onClick={() => setActiveTab('donations')}>My Donation History</button>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
            {activeTab === 'campaigns' ? (
                // FIX: Pass our new handler instead of the raw onNavigate
                <MyCampaigns 
                    onNavigate={handleCampaignClick} 
                    isModal={true} 
                />
            ) : (
                // FIX: Do the same for donations if you want clicking a donation to close the modal too
                <MyDonations 
                    onNavigate={handleCampaignClick}
                    isModal={true} 
                />
            )}
        </div>
      </div>
    </div>
  );
}