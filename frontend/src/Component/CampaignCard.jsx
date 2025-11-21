import React from 'react'; 
import styles from '../Style/CampaignList.module.css';

export default function CampaignCard({ campaign, onNavigate }) {

  const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
  const formatCurrency = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
  const imageUrl = campaign.coverImageUrl || 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Bayanihan';

  return (
    <div 
      className={styles.campaignCard} 
      style={{cursor: 'pointer'}} 
      onClick={() => onNavigate('campaignDetails', campaign.id)} 
    >
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
          <span>of {formatCurrency(campaign.goalAmount)}</span>
        </div>

        <div className={styles.cardFooter}>
          {}
          <button className={`btn btn-secondary ${styles.donateButton}`}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}