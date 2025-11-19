import { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignCard from './CampaignCard';
import styles from '../Style/CampaignList.module.css';

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        // Note: No Auth header needed for this public endpoint
        const response = await axios.get('http://localhost:8080/api/campaigns');
        setCampaigns(response.data);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Could not load campaigns. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <div style={{textAlign: 'center', padding: '2rem'}}>Loading campaigns...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)'}}>
        <h3>No active campaigns yet.</h3>
        <p>Be the first to start a Bayanihan Drive!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem'}}>
        Active Donation Drives
      </h2>
      <div className={styles.gridContainer}>
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}