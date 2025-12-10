import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../../supabaseClient';
import styles from '../../Style/Dashboard.module.css'; // Reuse dashboard styles
import CampaignList from '../CampaignList';

export default function PublicProfile({ userId, onNavigate, onBack }) {
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        setProfile(profileData);

        // 2. Fetch User's Campaigns (Public ones)
        // We can reuse the search endpoint or create a specific one.
        // Or simpler: Use Supabase directly if policies allow, but better via API.
        // Let's use the CampaignController endpoint we might have or create.
        // Actually, CampaignController has `getCampaignsByOrganizer` but it uses `@AuthenticationPrincipal`.
        // We need a public endpoint for "get campaigns by user ID".
        
        // I'll create a new endpoint in CampaignController: GET /api/campaigns/user/{userId}
        const res = await axios.get(`http://localhost:8080/api/campaigns/user/${userId}`);
        setCampaigns(res.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className={styles.loadingContainer}>Loading Profile...</div>;
  if (!profile) return <div className={styles.loadingContainer}>User not found.</div>;

  return (
    <div className={styles.dashboardRoot}> 
      {/* We reuse dashboard layout but simplified */}
      <div className={styles.centerPanel} style={{width:'100%'}}>
         <header className={styles.centerHeader}>
             <button onClick={onBack} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', marginRight:'1rem'}}>← Back</button>
             <h2>Profile</h2>
         </header>
         
         <div className={styles.scrollableContent}>
             <div style={{
                 background: 'var(--card-bg)', 
                 padding: '2rem', 
                 borderRadius: '12px', 
                 marginBottom: '2rem',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '2rem',
                 border: '1px solid var(--border-color)'
             }}>
                 <img 
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`} 
                    alt={profile.full_name} 
                    style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}}
                 />
                 <div>
                     <h1 style={{margin: '0 0 0.5rem 0', fontSize: '1.8rem'}}>{profile.full_name}</h1>
                     <p style={{margin: '0 0 1rem 0', color: 'var(--text-secondary)'}}>@{profile.username}</p>
                     <p style={{margin: 0}}>{profile.bio || "No bio yet."}</p>
                 </div>
             </div>

             <h3 style={{margin: '0 0 1rem 0'}}>Campaigns by {profile.full_name}</h3>
             {campaigns.length === 0 ? (
                 <p>No active campaigns.</p>
             ) : (
                 <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
                     {/* We can't reuse CampaignList easily as it fetches its own data. 
                         We should probably refactor CampaignList to accept 'campaigns' prop or duplicate the card rendering.
                         I'll duplicate card rendering for simplicity and to avoid breaking CampaignList.
                     */}
                     {campaigns.map(c => (
                         <div key={c.id} className="card" onClick={() => onNavigate('campaignDetails', c.id)} style={{
                             background: 'var(--card-bg)', 
                             border: '1px solid var(--border-color)', 
                             borderRadius: '8px', 
                             overflow: 'hidden', 
                             cursor: 'pointer'
                         }}>
                             <div style={{height: '140px', background: '#ccc'}}>
                                 <img src={c.coverImageUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                             </div>
                             <div style={{padding: '12px'}}>
                                 <h4 style={{margin: '0 0 4px 0'}}>{c.title}</h4>
                                 <p style={{fontSize: '0.8rem', color: '#666'}}>Raised: ₱{c.currentAmount}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      </div>
    </div>
  );
}
