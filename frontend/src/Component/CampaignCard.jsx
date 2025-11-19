import React, { useState } from 'react';
import styles from '../Style/CampaignList.module.css';
import axios from 'axios';
import { supabase } from '../supabaseClient';

export default function CampaignCard({ campaign }) {
  const [loading, setLoading] = useState(false);

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

  const handleDonate = async () => {
    // 1. Get Amount (Simple Prompt for now)
    const amountStr = prompt(`Enter amount to donate to "${campaign.title}":`);
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    setLoading(true);
    try {
        // 2. Get Auth Token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please log in to donate.");
            return;
        }

        // 3. Send Request
        await axios.post('http://localhost:8080/api/donations', {
            campaignId: campaign.id,
            amount: amount,
            message: "Keep up the good work!", // Hardcoded for now, can add input later
            isAnonymous: false
        }, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        alert("Thank you for your donation!");
        // Ideally, refresh the list here to show updated progress
        window.location.reload(); 

    } catch (error) {
        console.error(error);
        // Check if it's our insufficient funds trigger error
        if (error.response?.data?.message?.includes("Insufficient funds")) {
             alert("Donation failed: Insufficient funds in your wallet.");
        } else {
             alert("Donation failed. Please try again.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
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
            onClick={handleDonate}
            disabled={loading}
          >
            {loading ? "Processing..." : "Donate Now"}
          </button>
        </div>
      </div>
    </div>
  );
}