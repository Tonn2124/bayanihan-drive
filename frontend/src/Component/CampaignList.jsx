import { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignCard from './CampaignCard';
import styles from '../Style/CampaignList.module.css';
import Skeleton from './Skeleton';

const categories = ['All', 'Community', 'Animal Welfare', 'Medical', 'Education', 'Disaster Relief', 'Other'];

export default function CampaignList({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory.toUpperCase().replace(' ', '_');

      const response = await axios.get('http://localhost:8080/api/campaigns', { params });
      setCampaigns(response.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Could not load campaigns. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH ONCE when search or category changes. 
  // REMOVED: The setInterval that was fetching every 1 second.
  useEffect(() => {
    // Debounce search slightly to avoid fetching on every single keystroke immediately
    const timer = setTimeout(() => {
        fetchCampaigns();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // --- SKELETON LOADING UI ---
  const renderSkeletons = () => {
      return Array(6).fill(0).map((_, i) => (
          <div key={i} style={{
              background:'white', borderRadius:'12px', border:'1px solid #E5E7EB', 
              overflow:'hidden', display:'flex', flexDirection:'column', height:'400px'
          }}>
              <Skeleton type="rect" height="180px" />
              <div style={{padding: '1.5rem', flex: 1}}>
                  <Skeleton type="text" width="30%" style={{marginBottom:'1rem'}} />
                  <Skeleton type="text" width="80%" height="1.5rem" style={{marginBottom:'1rem'}} />
                  <Skeleton type="text" width="100%" />
                  <Skeleton type="text" width="90%" />
                  <div style={{marginTop:'1.5rem'}}>
                    <Skeleton type="rect" height="8px" width="100%" />
                  </div>
              </div>
          </div>
      ));
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <h2 style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', margin: 0}}>
            Active Donation Drives
        </h2>

        <div style={{display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end'}}>
            <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="form-control"
                style={{maxWidth: '300px'}}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
                className="form-control"
                style={{maxWidth: '180px', cursor: 'pointer'}}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.gridContainer}>
            {renderSkeletons()}
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : campaigns.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)'}}>
            <h3>No campaigns found.</h3>
            <p>Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className={styles.gridContainer}>
            {campaigns.map((campaign) => (
            <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onNavigate={onNavigate} 
            />
            ))}
        </div>
      )}
    </div>
  );
}