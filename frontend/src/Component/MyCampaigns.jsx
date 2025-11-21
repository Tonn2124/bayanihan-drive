import { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignCard from './CampaignCard';
import styles from '../Style/CampaignList.module.css';
import { supabase } from '../supabaseClient';

export default function MyCampaigns({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      try {
        setLoading(true);
       
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error("You must be logged in.");
        }
        const token = session.access_token;

        const response = await axios.get('http://localhost:8080/api/campaigns/my-campaigns', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        setCampaigns(response.data);
      } catch (err) {
        console.error("Error fetching my campaigns:", err);
        setError("Could not load your campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, []);

  if (loading) {
    return <div style={{textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)'}}>Loading your campaigns...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)'}}>
        <h3>You haven't created any campaigns yet.</h3>
        <p>Start a drive to see it here!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--color-text-main)'}}>
        My Campaigns
      </h2>
      <div className={styles.gridContainer}>
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign} 
            onNavigate={onNavigate} 
          />
        ))}
      </div>
    </div>
  );
}