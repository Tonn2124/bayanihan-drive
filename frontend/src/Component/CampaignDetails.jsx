import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient'; 
import styles from '../Style/CampaignDetails.module.css';
import DonateModal from './DonateModal';

export default function CampaignDetails({ campaignId, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [donations, setDonations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch

        // A. Fetch Campaign
        const campaignRes = await axios.get(`http://localhost:8080/api/campaigns/${campaignId}`);
        const campaignData = campaignRes.data;
        
        if (!campaignData) {
            throw new Error("Campaign data is empty");
        }
        
        setCampaign(campaignData);

        // B. Fetch Organizer
        // We check if organizerId exists to avoid bad requests
        if (campaignData.organizerId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', campaignData.organizerId)
            .single();
          
          if (profileError) {
            console.warn("Could not fetch organizer profile:", profileError.message);
            // Don't throw here, just let organizer be null
          } else {
            setOrganizer(profileData);
          }
        }

        // C. Fetch Donations
        try {
            const donationsRes = await axios.get(`http://localhost:8080/api/donations/campaign/${campaignId}`);
            setDonations(donationsRes.data);
        } catch (donationErr) {
            console.warn("Could not fetch donations:", donationErr);
            // Don't block the whole page if donations fail
        }

      } catch (err) {
        console.error("Critical Error fetching details:", err);
        setError(err.message || "Could not load campaign details.");
      } finally {
        setLoading(false);
      }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      fetchData();
    }
  }, [campaignId, fetchData]);

  if (loading) return <div className="container" style={{textAlign:'center', marginTop:'4rem'}}>Loading details...</div>;
  
  if (error) return (
    <div className="container" style={{marginTop:'2rem'}}>
        <div className="alert alert-danger">
            {error}
            <button className="btn btn-secondary" onClick={onBack} style={{marginTop: '1rem', width: 'auto'}}>Go Back</button>
        </div>
    </div>
  );

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

  // Use optional chaining (?.) for safer access in render
  const organizerName = organizer?.full_name || organizer?.username || 'Unknown Organizer';
  const organizerUsername = organizer?.username ? `@${organizer.username}` : '';
  const organizerInitial = organizerName.charAt(0).toUpperCase();

  return (
    <div className={styles.detailsContainer}>
      {showDonateModal && (
        <DonateModal 
          campaign={campaign} 
          onClose={() => setShowDonateModal(false)}
          onSuccess={() => fetchData()} 
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
            {campaign.category ? campaign.category.replace('_', ' ') : 'General'}
          </span>
          <h1>{campaign.title}</h1>
          
          <div className={styles.organizerSection}>
             <div className={styles.organizerLabel}>Organizer</div>
             <div className={styles.organizerName}>
                {organizer ? (
                  <>
                    <div style={{
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#E5E7EB', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#6B7280',
                      overflow: 'hidden',
                      marginRight: '0.75rem'
                    }}>
                      {organizer.avatar_url ? <img src={organizer.avatar_url} alt="avatar" style={{width:'100%', height:'100%', objectFit: 'cover'}}/> : organizerInitial}
                    </div>
                    <div>
                      {organizerName}
                      {organizerUsername && <span style={{fontWeight: 'normal', color: '#6B7280', marginLeft: '0.5rem', fontSize: '0.9em'}}>{organizerUsername}</span>}
                    </div>
                  </>
                ) : (
                  <span style={{color: '#6B7280', fontStyle: 'italic'}}>Organizer info unavailable</span>
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
                {donations.length} people have donated
              </div>
            </div>

            <button 
              className={`btn btn-primary ${styles.donateBtn}`}
              onClick={() => setShowDonateModal(true)}
            >
              Donate Now
            </button>

            <div style={{marginTop: '2rem'}}>
                <h4 style={{fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-main)'}}>Recent Donations</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {donations.length === 0 ? (
                        <p style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic'}}>Be the first to donate!</p>
                    ) : (
                        donations.slice(0, 5).map((donation) => (
                            <div key={donation.id} style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem'}}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#EFF6FF', 
                                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
                                }}>
                                    {donation.isAnonymous ? '?' : 'D'} 
                                </div>
                                <div>
                                    <div style={{fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text-main)'}}>
                                        {donation.isAnonymous ? 'Anonymous' : 'A Supporter'} 
                                    </div>
                                    <div style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)'}}>
                                        donated <span style={{color: 'var(--color-success)', fontWeight: '600'}}>{formatCurrency(donation.amount)}</span>
                                    </div>
                                    {donation.message && (
                                        <div style={{fontSize: '0.85rem', color: '#4B5563', marginTop: '0.25rem', fontStyle: 'italic'}}>
                                            "{donation.message}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}