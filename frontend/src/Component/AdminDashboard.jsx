import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AdminDashboard.module.css'; 

export default function AdminDashboard({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, COMPLETED

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      // Fetch all campaigns or filter by backend? 
      // Current backend has /pending and /all (public). 
      // We need an endpoint to get ALL campaigns including rejected for Admin.
      // Assuming I'll add or use an endpoint for this. For now let's use the pending endpoint and maybe others?
      // Actually, standard practice: Admin gets all.
      
      // I will assume an endpoint /api/admin/campaigns exists or I will create it. 
      // For now, I will use existing /api/admin/campaigns/pending and maybe fetch others if available.
      // But to support all filters, I need a comprehensive list.
      
      // Let's modify the backend to support fetching all campaigns for admin with status filter.
      // Or I can fetch pending from /pending and the rest from /search? 
      // But /search only returns active ones.
      
      // I'll make a request to a new endpoint I'll creating: GET /api/admin/campaigns
      const response = await axios.get(`http://localhost:8080/api/admin/campaigns?status=${filter === 'ALL' ? '' : filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCampaigns(response.data);

    } catch (err) {
      console.error("Admin Fetch Error:", err);
      // Fallback for now if endpoint doesn't exist
      if (filter === 'PENDING') {
          // Retry with old endpoint
          try {
             const { data: { session } } = await supabase.auth.getSession();
             const res = await axios.get('http://localhost:8080/api/admin/campaigns/pending', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
             });
             setCampaigns(res.data);
             return;
          } catch(e) {}
      }

      if (err.response && err.response.status === 403) {
          setError("Access Denied: You do not have permission to view this page.");
      } else {
          setError("Could not load campaigns.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const handleAction = async (id, action) => {
    // action: APPROVE, REJECT, DELETE, BLOCK_USER
    if (!window.confirm(`Are you sure you want to ${action} this campaign?`)) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session.access_token;

        if (action === 'APPROVE' || action === 'REJECT') {
            await axios.put(`http://localhost:8080/api/admin/campaigns/${id}/verify?approve=${action === 'APPROVE'}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } else if (action === 'DELETE') {
            await axios.delete(`http://localhost:8080/api/admin/campaigns/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        
        alert(`Action ${action} successful!`);
        fetchCampaigns(); 
    } catch (err) {
        alert("Operation failed. Please try again.");
    }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'PENDING': return '#F59E0B';
          case 'APPROVED': return '#10B981';
          case 'REJECTED': return '#EF4444';
          case 'COMPLETED': return '#3B82F6';
          default: return '#6B7280';
      }
  };

  return (
    <div className={styles.adminContainer}>
        {/* Header */}
        <div className={styles.header}>
            <div className={styles.titleGroup}>
                <h2>Admin Dashboard</h2>
            </div>
            <button className={styles.backButton} onClick={() => onNavigate('dashboard')}>
                Exit Admin Mode
            </button>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(f => (
                <button 
                    key={f}
                    className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                    onClick={() => setFilter(f)}
                >
                    {f} {f === 'PENDING' && <span className={styles.badgeCount}>!</span>}
                </button>
            ))}
        </div>

        {/* List Section */}
        <div className={styles.listContainer}>
            {loading ? <p>Loading...</p> : error ? <p className="alert alert-danger">{error}</p> : (
                <>
                {campaigns.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No campaigns found for {filter}</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Creator</th>
                                <th>Goal</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td>#{c.id}</td>
                                    <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.title}</td>
                                    <td>{c.organizerId ? c.organizerId.substring(0,8) + '...' : 'Unknown'}</td>
                                    <td>₱{c.goalAmount}</td>
                                    <td>
                                        <span className={styles.statusTag} style={{backgroundColor: getStatusColor(c.status)}}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button onClick={() => onNavigate('campaignDetails', c.id)} title="View">👁️</button>
                                            {c.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleAction(c.id, 'APPROVE')} title="Approve" style={{color: 'green'}}>✓</button>
                                                    <button onClick={() => handleAction(c.id, 'REJECT')} title="Reject" style={{color: 'red'}}>✗</button>
                                                </>
                                            )}
                                            <button onClick={() => handleAction(c.id, 'DELETE')} title="Delete" style={{color: 'darkred'}}>🗑️</button>
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
  );
}
