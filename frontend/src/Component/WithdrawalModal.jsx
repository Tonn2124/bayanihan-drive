import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AddFundsModal.module.css'; // Reuse styles

export default function WithdrawalModal({ campaign, availableBalance, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    if (parseFloat(amount) > availableBalance) {
        alert("Amount exceeds available balance.");
        return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      await axios.post('http://localhost:8080/api/withdrawals', 
        { 
            campaignId: campaign.id,
            amount: parseFloat(amount),
            paymentMethod,
            accountDetails
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert("Withdrawal request submitted!");
      onSuccess(); 
      onClose(); 
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. " + (error.response?.data?.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Withdraw Funds</h2>
        <p className={styles.description}>
            Available Balance: <strong>₱{availableBalance.toLocaleString()}</strong>
        </p>

        <form onSubmit={handleWithdraw}>
            <div className="form-group">
                <label>Amount to Withdraw</label>
                <input 
                    type="number" 
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={availableBalance}
                    min="1"
                    required
                />
            </div>

            <div className="form-group">
                <label>Payment Method</label>
                <select 
                    className="form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="GCash">GCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Maya">Maya</option>
                </select>
            </div>

            <div className="form-group">
                <label>Account Details (Name & Number)</label>
                <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Juan Cruz 0917..."
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    required
                />
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
                    {loading ? 'Processing...' : 'Request Payout'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}