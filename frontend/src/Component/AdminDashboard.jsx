import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AdminDashboard.module.css'; 

export default function AdminDashboard({ onNavigate }) {
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      // 1. Fetch Pending Campaigns
      const response = await axios.get('http://localhost:8080/api/admin/campaigns/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingCampaigns(response.data);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
      if (err.response && err.response.status === 403) {
          setError("Access Denied: You do not have permission to view this page.");
      } else {
          setError("Could not load pending campaigns. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id, approve) => {
    // Simple confirmation
    if (!window.confirm(`Are you sure you want to ${approve ? 'APPROVE' : 'REJECT'} this campaign?`)) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session.access_token;

        await axios.put(`http://localhost:8080/api/admin/campaigns/${id}/verify?approve=${approve}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        alert(approve ? "Campaign Approved!" : "Campaign Rejected.");
        fetchPending(); // Refresh list to remove the handled campaign
    } catch (err) {
        alert("Operation failed. Please try again.");
    }
  };

  if (loading) {
    return (
        <div className={styles.adminContainer} style={{textAlign: 'center', marginTop: '4rem'}}>
            <p style={{color: '#6B7280'}}>Loading admin panel...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className={styles.adminContainer}>
            <div className="alert alert-danger">
                {error}
                <button className={styles.backButton} onClick={() => onNavigate('dashboard')} style={{marginTop: '1rem'}}>
                    Go Back
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
        {/* Header */}
        <div className={styles.header}>
            <div className={styles.titleGroup}>
                <h2>Admin Dashboard</h2>
                <div className={styles.subTitle}>Manage and verify platform content</div>
            </div>
            <button className={styles.backButton} onClick={() => onNavigate('dashboard')}>
                Exit Admin Mode
            </button>
        </div>

        {/* Stats Row (Mock Data for now) */}
        <div className={styles.statsRow}>
            <div className={styles.statCard}>
                <div className={styles.statLabel}>Pending Review</div>
                <div className={styles.statValue} style={{color: '#F59E0B'}}>{pendingCampaigns.length}</div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Users</div>
                <div className={styles.statValue}>12</div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statLabel}>Platform Raised</div>
                <div className={styles.statValue} style={{color: '#10B981'}}>₱45k</div>
            </div>
        </div>

        {/* Pending List Section */}
        <div>
            <div className={styles.sectionTitle}>
                Verification Queue 
                {pendingCampaigns.length > 0 && <span className={styles.countBadge}>{pendingCampaigns.length}</span>}
            </div>
            
            {pendingCampaigns.length === 0 ? (
                <div className={styles.emptyState}>
                    <h3>All caught up!</h3>
                    <p>There are no pending campaigns to review at this moment.</p>
                </div>
            ) : (
                <div className={styles.campaignList}>
                    {pendingCampaigns.map(campaign => (
                        <div key={campaign.id} className={styles.reviewCard}>
                            {/* Card Header */}
                            <div className={styles.cardHeader}>
                                <div className={styles.campaignMeta}>
                                    <span>ID: #{campaign.id}</span>
                                    <span>•</span>
                                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={styles.statusBadge}>Pending Verification</span>
                            </div>

                            {/* Card Body */}
                            <div className={styles.cardBody}>
                                <h3 className={styles.campaignTitle}>{campaign.title}</h3>
                                <div className={styles.goalInfo}>
                                    Target: ₱{campaign.goalAmount.toLocaleString()}
                                </div>
                                <p className={styles.campaignDesc}>
                                    {campaign.description.substring(0, 150)}
                                    {campaign.description.length > 150 && '...'}
                                </p>
                            </div>

                            {/* Card Actions */}
                            <div className={styles.cardActions}>
                                <button 
                                    className={styles.viewBtn} 
                                    onClick={() => onNavigate('campaignDetails', campaign.id)}
                                >
                                    View Full Details
                                </button>
                                <button 
                                    className={styles.rejectBtn} 
                                    onClick={() => handleVerify(campaign.id, false)}
                                >
                                    Reject
                                </button>
                                <button 
                                    className={styles.approveBtn} 
                                    onClick={() => handleVerify(campaign.id, true)}
                                >
                                    Approve Campaign
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}