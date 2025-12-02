import React from 'react'; 
// IMPORTANT: Imports the specific Card CSS
import styles from '../Style/CampaignCard.module.css';

export default function CampaignCard({ campaign, onNavigate }) {

  // Logic: Calculate progress
  const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
  
  // Logic: Format Currency
  const formatCurrency = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
  
  // Logic: Image fallback
  const imageUrl = campaign.coverImageUrl || 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Bayanihan';

  return (
    <div 
      className={styles.card} 
      onClick={() => onNavigate('campaignDetails', campaign.id)} 
      title={campaign.title} // Tooltip for full title
    >
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl} 
          alt={campaign.title} 
          className={styles.campaignImage} 
          onError={(e) => {e.target.src = 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Image+Not+Found'}} 
        />
        <div className={styles.categoryBadge}>
          {campaign.category ? campaign.category.replace('_', ' ') : 'General'}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{campaign.title}</h3>
        <p className={styles.description}>{campaign.description}</p>
        
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className={styles.statsRow}>
          <span className={styles.amountRaised}>
            {formatCurrency(campaign.currentAmount || 0)} raised
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <button className={styles.donateBtn}>
          View Details
        </button>
      </div>
    </div>
  );
}