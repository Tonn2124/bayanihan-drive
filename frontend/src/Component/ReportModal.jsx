import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/Dashboard.module.css'; // Reuse dashboard styles for modal or create new

export default function ReportModal({ campaignId, onClose }) {
  const [reason, setReason] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !proofUrl) {
        alert("Please provide a reason and proof URL.");
        return;
    }

    try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        await axios.post('http://localhost:8080/api/reports', {
            campaignId,
            reason,
            proofUrl
        }, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        alert("Report submitted successfully.");
        onClose();
    } catch (err) {
        alert(err.response?.data?.message || "Failed to submit report.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
            <h3>Report Campaign</h3>
            <p>Please describe why you are reporting this campaign and provide a link to proof.</p>
            <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '1rem'}}>
                    <label>Reason</label>
                    <textarea 
                        className="form-control" 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        style={{width: '100%', height: '80px', padding: '8px'}}
                    />
                </div>
                <div style={{marginBottom: '1rem'}}>
                    <label>Proof URL (Image/Doc)</label>
                    <input 
                        type="url" 
                        className="form-control" 
                        value={proofUrl} 
                        onChange={e => setProofUrl(e.target.value)}
                        style={{width: '100%', padding: '8px'}}
                        placeholder="https://..."
                    />
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                    <button type="button" onClick={onClose} style={{padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px'}}>Cancel</button>
                    <button type="submit" disabled={loading} style={{padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px'}}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
