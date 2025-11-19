import React, { useState } from 'react';
import styles from '../Style/CampaignList.module.css';
import DonateModal from './DonateModal'; // <-- Import new modal

export default function CampaignCard({ campaign }) {
  const [showDonateModal, setShowDonateModal] = useState(false); // Modal state

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

  const imageUrl = campaign.coverImageUrl || 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Bayanihan';

  return (
    <>
        {/* Render Modal if state is true */}
        {showDonateModal && (
            <DonateModal 
                campaign={campaign}
                onClose={() => setShowDonateModal(false)}
                onSuccess={() => window.location.reload()} // Refresh to show updated progress
            />
        )}

        <div className={styles.campaignCard}>
        <img 
            src={imageUrl} 
            alt={campaign.title} 
            className={styles.cardImage} 
            onError={(e) => {e.target.src = 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Image+Not+Found'}} 
        />
        
        <div className={styles.cardContent}>
            <span className={styles.categoryBadge}>
            {campaign.category.replace('_', ' ')}
            </span>
            
            <h3 className={styles.cardTitle}>{campaign.title}</h3>
            <p className={styles.cardDescription}>{campaign.description}</p>
            
            <div className={styles.progressBarContainer}>
            <div 
                className={styles.progressBarFill} 
                style={{ width: `${progress}%` }}
            ></div>
            </div>
            
            <div className={styles.cardStats}>
            <span className={styles.raisedAmount}>
                {formatCurrency(campaign.currentAmount)} raised
            </span>
            <span>
                of {formatCurrency(campaign.goalAmount)}
            </span>
            </div>

            <div className={styles.cardFooter}>
            <button 
                className={`btn btn-primary ${styles.donateButton}`}
                onClick={() => setShowDonateModal(true)} // <-- Open Modal
            >
                Donate Now
            </button>
            </div>
        </div>
        </div>
    </>
  );
}