import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient'; 
import styles from '../Style/CampaignDetails.module.css';
import DonateModal from './DonateModal';
import WithdrawalModal from './WithdrawalModal'; // <-- 1. Import Withdrawal Modal

// Icons (No changes needed here)
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
);
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

export default function CampaignDetails({ campaignId, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [donations, setDonations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal States
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // <-- 2. New State

  // User State (to check if organizer)
  const [currentUser, setCurrentUser] = useState(null); // <-- 3. New State

  const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Current User (Need this to check if they own the campaign)
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);

        // A. Fetch Campaign
        const campaignRes = await axios.get(`http://localhost:8080/api/campaigns/${campaignId}`);
        const campaignData = campaignRes.data;
        
        if (!campaignData) throw new Error("Campaign data is empty");
        setCampaign(campaignData);

        // B. Fetch Organizer
        if (campaignData.organizerId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', campaignData.organizerId)
            .single();
          
          if (!profileError) {
            setOrganizer(profileData);
          }
        }

        // C. Fetch Donations
        try {
            const donationsRes = await axios.get(`http://localhost:8080/api/donations/campaign/${campaignId}`);
            setDonations(donationsRes.data);
        } catch (donationErr) {
            console.warn("Could not fetch donations:", donationErr);
        }

      } catch (err) {
        console.error("Error fetching details:", err);
        setError(err.message || "Could not load campaign details.");
      } finally {
        setLoading(false);
      }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) fetchData();
  }, [campaignId, fetchData]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading campaign details...</p>
      </div>
    );
  }
  
  if (error) return (
    <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
            <h3>Unable to load campaign</h3>
            <p>{error}</p>
            <button className={styles.backButton} onClick={onBack}>
              ← Back to Dashboard
            </button>
        </div>
    </div>
  );

  if (!campaign) return null;

  const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const organizerName = organizer?.full_name || organizer?.username || 'Unknown Organizer';
  const organizerUsername = organizer?.username ? `@${organizer.username}` : '';
  const organizerInitial = organizerName.charAt(0).toUpperCase();

  const daysLeft = campaign.endDate 
    ? Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  // --- 4. Organizer Logic ---
  const isOrganizer = currentUser && campaign.organizerId === currentUser.id;
  const withdrawnAmount = campaign.withdrawnAmount || 0;
  const availableBalance = campaign.currentAmount - withdrawnAmount;

  return (
    <div className={styles.pageWrapper}>
      {showDonateModal && (
        <DonateModal 
          campaign={campaign} 
          onClose={() => setShowDonateModal(false)}
          onSuccess={() => fetchData()} 
        />
      )}

      {/* 5. Render Withdrawal Modal */}
      {showWithdrawModal && (
        <WithdrawalModal
            campaign={campaign}
            availableBalance={availableBalance}
            onClose={() => setShowWithdrawModal(false)}
            onSuccess={() => fetchData()}
        />
      )}

      {/* Navigation Bar */}
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <div className={styles.navActions}>
          <button className={styles.iconButton} title="Share">
            <ShareIcon />
          </button>
          <button className={styles.iconButton} title="Save">
            <HeartIcon />
          </button>
        </div>
      </div>

      {/* Header Image */}
      <div className={styles.headerImageWrapper}>
        <img 
          src={campaign.coverImageUrl || 'https://placehold.co/1200x500/EFF6FF/0056D2?text=Campaign+Image'} 
          alt={campaign.title} 
          className={styles.headerImage}
          onError={(e) => {e.target.src = 'https://placehold.co/1200x500/EFF6FF/0056D2?text=Image+Not+Found'}}
        />
        <div className={styles.categoryBadge}>
          {campaign.category ? campaign.category.replace('_', ' ') : 'Others'}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        <div className={styles.mainContent}>
          {/* Campaign Title & Meta */}
          <div className={styles.titleSection}>
            <h1 className={styles.campaignTitle}>{campaign.title}</h1>
            
            <div className={styles.metaInfo}>
              {campaign.location && (
                <div className={styles.metaItem}>
                  <LocationIcon />
                  <span>{campaign.location}</span>
                </div>
              )}
              {campaign.createdAt && (
                <div className={styles.metaItem}>
                  <CalendarIcon />
                  <span>Created {new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Card */}
          <div className={styles.organizerCard}>
            <div className={styles.organizerAvatar}>
              {organizer?.avatar_url ? (
                <img src={organizer.avatar_url} alt="Organizer" />
              ) : (
                <span>{organizerInitial}</span>
              )}
            </div>
            <div className={styles.organizerInfo}>
              <div className={styles.organizerLabel}>Organized by</div>
              <div className={styles.organizerName}>
                {organizerName}
                {organizerUsername && <span className={styles.organizerUsername}>{organizerUsername}</span>}
              </div>
            </div>
          </div>

          {/* Campaign Description */}
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Story</h2>
            <p className={styles.description}>{campaign.description}</p>
          </div>

          {/* Recent Donations Section */}
          <div className={styles.donationsSection}>
            <h2 className={styles.sectionTitle}>
              Donations ({donations.length})
            </h2>
            
            {donations.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No donations yet. Be the first to support this cause!</p>
              </div>
            ) : (
              <div className={styles.donationsList}>
                {donations.map((donation) => (
                  <div key={donation.id} className={styles.donationItem}>
                    <div className={styles.donorAvatar}>
                      {donation.isAnonymous ? '?' : donation.donorName?.charAt(0) || 'D'}
                    </div>
                    <div className={styles.donationContent}>
                      <div className={styles.donationHeader}>
                        <span className={styles.donorName}>
                          {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'A Supporter'}
                        </span>
                        <span className={styles.donationAmount}>{formatCurrency(donation.amount)}</span>
                      </div>
                      {donation.message && (
                        <p className={styles.donationMessage}>"{donation.message}"</p>
                      )}
                      {donation.createdAt && (
                        <span className={styles.donationTime}>
                          {new Date(donation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.donationCard}>
            {/* Progress Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{formatCurrency(campaign.currentAmount)}</div>
                <div className={styles.statLabel}>raised of {formatCurrency(campaign.goalAmount)}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  <HeartIcon />
                  {donations.length}
                </div>
                <div className={styles.statLabel}>Donors</div>
              </div>
              {daysLeft !== null && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{daysLeft}</div>
                  <div className={styles.statLabel}>Days Left</div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className={styles.progressLabel}>{Math.round(progress)}% funded</div>
            </div>

            {/* Donate Button */}
            <button 
              className={styles.donateButton}
              onClick={() => setShowDonateModal(true)}
            >
              Donate Now
            </button>

            {/* 6. ORGANIZER ACTIONS (Withdrawal) */}
            {isOrganizer && (
                <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB'}}>
                    <h4 style={{fontSize: '0.85rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem'}}>Organizer Actions</h4>
                    
                    <div style={{marginBottom: '1rem', fontSize: '0.9rem', color: '#1F2937'}}>
                        Available for Payout: <strong style={{color: '#10B981'}}>{formatCurrency(availableBalance)}</strong>
                    </div>

                    <button 
                        className="btn btn-secondary" 
                        style={{width: '100%', fontSize: '0.9rem', padding: '0.75rem'}}
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={availableBalance <= 0}
                    >
                        Request Withdrawal
                    </button>
                </div>
            )}

            {/* Share Section */}
            <div className={styles.shareSection}>
              <div className={styles.shareDivider}>
                <span>Share this campaign</span>
              </div>
              <div className={styles.shareButtons}>
                <button className={styles.shareBtn} title="Share via Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button className={styles.shareBtn} title="Share via Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </button>
                <button className={styles.shareBtn} title="Copy link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}