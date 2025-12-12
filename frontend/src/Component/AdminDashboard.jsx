import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AdminDashboard.module.css'; 

export default function AdminDashboard({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('PENDING'); // Default to PENDING to see action items first

  // 1. Fetch ALL campaigns regardless of status
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      // We request ALL data and filter it in the browser. 
      // This is safer if the backend filter is buggy.
      const response = await axios.get('http://localhost:8080/api/admin/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // If the backend returns an object wrapper, adjust here (e.g., response.data.data)
      // Assuming response.data is the array:
      setCampaigns(response.data);

    } catch (err) {
      console.error("Admin Fetch Error:", err);
      // Fallback: Try pending endpoint if the main one fails
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await axios.get('http://localhost:8080/api/admin/campaigns/pending', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          setCampaigns(res.data);
      } catch(e) {
          setError("Could not load campaigns. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []); // Empty dependency array = only fetch once on mount

  const handleAction = async (id, action) => {
    if (!window.confirm(`Confirm ${action} for campaign #${id}?`)) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session.access_token;

        await axios.put(`http://localhost:8080/api/admin/campaigns/${id}/verify?approve=${action === 'APPROVE'}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Refresh data to update the UI immediately
        fetchCampaigns(); 
    } catch (err) {
        alert(`Failed to ${action.toLowerCase()}.`);
    }
  };

  // 2. Client-Side Filtering Logic
  const filteredCampaigns = campaigns.filter(c => {
      if (filter === 'ALL') return true;
      return c.status === filter;
  });

  const getStatusStyle = (status) => {
      switch(status) {
          case 'PENDING': return { background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5' };
          case 'APPROVED': return { background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' };
          case 'REJECTED': return { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' };
          default: return { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' };
      }
  };

  return (
    <div className={styles.adminContainer}>
        <div className={styles.header}>
            <div className={styles.titleGroup}>
                <h2>Admin Dashboard</h2>
                <p>Manage and verify fundraising campaigns</p>
            </div>
            <button className={styles.backButton} onClick={() => onNavigate('dashboard')}>
                Exit Admin Mode
            </button>
        </div>

        <div className={styles.contentWrapper}>
            {/* Filter Tabs */}
            <div className={styles.filterBar}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <button 
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f} {f === 'PENDING' && <span className={styles.badgeCount}>!</span>}
                    </button>
                ))}
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.emptyState}>
                            <div className={styles.spinner}></div>
                            <p>Loading campaigns...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.emptyState} style={{color: '#DC2626'}}>{error}</div>
                    ) : (
                        <>
                        {/* 3. Render filteredCampaigns instead of raw campaigns */}
                        {filteredCampaigns.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No {filter.toLowerCase()} campaigns found.</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{width: '60px'}}>ID</th>
                                        <th>Title</th>
                                        <th>Creator</th>
                                        <th>Goal</th>
                                        <th>Status</th>
                                        <th style={{textAlign: 'right'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCampaigns.map(c => (
                                        <tr key={c.id}>
                                            <td className={styles.idCell}>#{c.id}</td>
                                            <td className={styles.titleCell}>
                                                {c.title.length > 35 ? c.title.substring(0, 35) + '...' : c.title}
                                            </td>
                                            <td className={styles.creatorCell}>
                                                {c.organizerId ? c.organizerId.substring(0,6) + '...' : 'Unknown'}
                                            </td>
                                            <td className={styles.goalCell}>₱{c.goalAmount.toLocaleString()}</td>
                                            <td>
                                                <span className={styles.statusTag} style={getStatusStyle(c.status)}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'right'}}>
                                                <div className={styles.actionButtons}>
                                                    <button 
                                                        className={styles.viewBtn} 
                                                        onClick={() => onNavigate('campaignDetails', c.id, 'ADMIN')} 
                                                        title="View Details"
                                                    >
                                                        {/* Eye Icon */}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    </button>

                                                    {c.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                className={styles.approveBtn} 
                                                                onClick={() => handleAction(c.id, 'APPROVE')} 
                                                                title="Approve"
                                                            >
                                                                {/* Check Icon */}
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </button>
                                                            <button 
                                                                className={styles.rejectBtn} 
                                                                onClick={() => handleAction(c.id, 'REJECT')} 
                                                                title="Reject"
                                                            >
                                                                {/* X Icon */}
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}