import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AdminDashboard.module.css'; 
import Toast from './Toast'; 

// --- Confirmation Modal Component (Internal) ---
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
        <div style={{
            background: 'white', padding: '24px', borderRadius: '12px', 
            width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
            <h3 style={{marginTop: 0, fontSize: '1.2rem', color: '#1F2937'}}>Confirm Action</h3>
            <p style={{color: '#4B5563', marginBottom: '24px'}}>{message}</p>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button 
                    onClick={onCancel}
                    style={{
                        padding: '8px 16px', background: 'white', border: '1px solid #D1D5DB', 
                        borderRadius: '6px', cursor: 'pointer', color: '#374151'
                    }}
                >Cancel</button>
                <button 
                    onClick={onConfirm}
                    style={{
                        padding: '8px 16px', background: '#2563EB', border: 'none', 
                        borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 600
                    }}
                >Confirm</button>
            </div>
        </div>
    </div>
  );
};

export default function AdminDashboard({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('PENDING'); 
  const [toast, setToast] = useState(null);
  
  // --- New State for Confirmation Modal ---
  const [confirmState, setConfirmState] = useState({ 
      isOpen: false, 
      id: null, 
      action: null 
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const response = await axios.get('http://localhost:8080/api/admin/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await axios.get('http://localhost:8080/api/admin/campaigns/pending', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          setCampaigns(res.data);
      } catch(e) {
          setError("Could not load campaigns.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []); 

  // 1. Open Modal Instead of Confirm
  const requestAction = (id, action) => {
      setConfirmState({ isOpen: true, id, action });
  };

  // 2. Perform Action (Called by Modal)
  const performAction = async () => {
    const { id, action } = confirmState;
    setConfirmState({ ...confirmState, isOpen: false }); // Close modal

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session.access_token;

        await axios.put(`http://localhost:8080/api/admin/campaigns/${id}/verify?approve=${action === 'APPROVE'}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setToast({ msg: `Campaign ${action === 'APPROVE' ? 'Approved' : 'Rejected'} Successfully!`, type: 'success' });
        fetchCampaigns(); 
    } catch (err) {
        setToast({ msg: `Failed to ${action.toLowerCase()}.`, type: 'error' });
    }
  };

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
        {/* Render Confirmation Modal */}
        <ConfirmModal 
            isOpen={confirmState.isOpen}
            message={`Are you sure you want to ${confirmState.action} campaign #${confirmState.id}?`}
            onConfirm={performAction}
            onCancel={() => setConfirmState({ ...confirmState, isOpen: false })}
        />

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
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    </button>

                                                    {c.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                className={styles.approveBtn} 
                                                                // Use requestAction instead of direct handler
                                                                onClick={() => requestAction(c.id, 'APPROVE')} 
                                                                title="Approve"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </button>
                                                            <button 
                                                                className={styles.rejectBtn} 
                                                                // Use requestAction instead of direct handler
                                                                onClick={() => requestAction(c.id, 'REJECT')} 
                                                                title="Reject"
                                                            >
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

        {toast && (
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={() => setToast(null)} 
            />
        )}
    </div>
  );
}