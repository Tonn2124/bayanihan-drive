import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AddFundsModal.module.css';

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

export default function AddFundsModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      await axios.post('http://localhost:8080/api/wallet/add-funds', 
        { amount: parseFloat(amount) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onSuccess(); // Refresh dashboard data
      onClose(); // Close modal
    } catch (error) {
      console.error("Failed to add funds:", error);
      alert("Failed to add funds. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Add Funds</h2>
        <p className={styles.description}>Top up your wallet securely (Mock Transaction).</p>

        <div className={styles.amountGrid}>
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`${styles.amountButton} ${parseFloat(amount) === preset ? styles.selected : ''}`}
              onClick={() => setAmount(preset.toString())}
            >
              ₱{preset.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>Custom Amount</label>
          <input 
            type="number" 
            className="form-control"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddFunds}
            disabled={loading || !amount}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}