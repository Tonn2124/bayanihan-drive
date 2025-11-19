import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient'; // <-- 1. Import Supabase client
import styles from '../Style/CampaignDetails.module.css';
import DonateModal from './DonateModal';

export default function CampaignDetails({ campaignId, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const [organizer, setOrganizer] = useState(null); // <-- 2. New State for Organizer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Campaign from Spring Boot
        const response = await axios.get(`http://localhost:8080/api/campaigns/${campaignId}`);
        const campaignData = response.data;
        setCampaign(campaignData);

        // 2. Fetch Organizer Profile from Supabase using the ID we just got
        if (campaignData.organizerId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', campaignData.organizerId)
            .single();
          
          if (profileError) {
            console.error("Error fetching organizer:", profileError);
          } else {
            setOrganizer(profileData);
          }
        }

      } catch (err) {
        console.error("Error fetching campaign details:", err);
        setError("Could not load campaign details.");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchData();
    }
  }, [campaignId]);

  if (loading) return <div className="container" style={{textAlign:'center', marginTop:'4rem'}}>Loading details...</div>;
  if (error) return <div className="alert alert-danger container" style={{marginTop:'2rem'}}>{error}</div>;
  if (!campaign) return null;

  const progress = Math.min(
    (campaign.currentAmount / campaign.goalAmount) * 100,
    100
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.detailsContainer}>
      {showDonateModal && (
        <DonateModal 
          campaign={campaign} 
          onClose={() => setShowDonateModal(false)}
          onSuccess={() => window.location.reload()} 
        />
      )}

      <button className={styles.backButton} onClick={onBack}>
        ← Back to Dashboard
      </button>

      <img 
        src={campaign.coverImageUrl || 'https://placehold.co/1200x600/F3F4F6/9CA3AF?text=Bayanihan'} 
        alt={campaign.title} 
        className={styles.headerImage}
        onError={(e) => {e.target.src = 'https://placehold.co/1200x600/F3F4F6/9CA3AF?text=Image+Not+Found'}}
      />

      <div className={styles.mainGrid}>
        <div className={styles.contentSection}>
          <span className={styles.categoryTag}>
            {campaign.category.replace('_', ' ')}
          </span>
          <h1>{campaign.title}</h1>
          
          <div className={styles.organizerSection}>
             <div className={styles.organizerLabel}>Organizer</div>
             <div className={styles.organizerName}>
                {/* 3. Display the Real Name and Username */}
                {organizer ? (
                  <>
                    <div style={{
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: '#E5E7EB', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#6B7280'
                    }}>
                      {/* Avatar Fallback */}
                      {organizer.avatar_url ? <img src={organizer.avatar_url} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : organizer.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {organizer.full_name || organizer.username}
                      {organizer.full_name && <span style={{fontWeight: 'normal', color: '#6B7280', marginLeft: '0.5rem'}}>@{organizer.username}</span>}
                    </div>
                  </>
                ) : (
                  'Loading organizer...'
                )}
             </div>
          </div>

          <hr style={{margin: '2rem 0', borderColor: '#E5E7EB'}}/>

          <h3>About this campaign</h3>
          <p className={styles.description}>{campaign.description}</p>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.donationCard}>
            <div className={styles.progressSection}>
              <div>
                <span className={styles.amountLarge}>
                  {formatCurrency(campaign.currentAmount)}
                </span>
                <span className={styles.amountGoal}>
                  raised of {formatCurrency(campaign.goalAmount)} goal
                </span>
              </div>

              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className={styles.donorCount}>
                Be the next supporter!
              </div>
            </div>

            <button 
              className={`btn btn-primary ${styles.donateBtn}`}
              onClick={() => setShowDonateModal(true)}
            >
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}