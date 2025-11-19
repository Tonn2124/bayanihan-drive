import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AddFundsModal.module.css'; // Reuse existing modal styles!

export default function DonateModal({ campaign, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          alert("Please log in to donate.");
          onClose();
          return;
      }
      const token = session.access_token;

      await axios.post('http://localhost:8080/api/donations', 
        { 
            campaignId: campaign.id,
            amount: parseFloat(amount),
            message: message,
            isAnonymous: isAnonymous
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Thank you for donating ₱${amount} to "${campaign.title}"!`);
      onSuccess(); // Refresh data
      onClose(); 
    } catch (err) {
      console.error("Donation failed:", err);
      // Check for specific backend error messages
      if (err.response?.data?.message?.includes("Insufficient funds")) {
           setError("Insufficient funds in your wallet. Please add funds first.");
      } else {
           setError("Donation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Donate to Campaign</h2>
        <p className={styles.description}>
            You are donating to <strong>{campaign.title}</strong>.
        </p>

        {error && <div className="alert alert-danger" style={{marginBottom: '1rem'}}>{error}</div>}

        <form onSubmit={handleDonate}>
            <div className="form-group">
            <label>Amount (₱)</label>
            <input 
                type="number" 
                className="form-control"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
            />
            </div>

            <div className="form-group">
            <label>Message (Optional)</label>
            <textarea 
                className="form-control"
                placeholder="Write a message of support..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                style={{resize: 'none'}}
            />
            </div>

            <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <input 
                    type="checkbox" 
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{width: 'auto'}}
                />
                <label htmlFor="anonymous" style={{marginBottom: 0, fontWeight: 'normal'}}>Donate Anonymously</label>
            </div>

            <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
            </button>
            <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !amount}
            >
                {loading ? 'Processing...' : 'Confirm Donation'}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}