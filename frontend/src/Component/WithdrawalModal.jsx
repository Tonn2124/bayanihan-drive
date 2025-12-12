import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/WithdrawalModal.module.css';
import Toast from './Toast'; 

// Icons used in the modal
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const WithdrawIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);

export default function WithdrawalModal({ campaign, availableBalance, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { msg: '', type: '' }

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    // 1. Validation: Use Toast instead of alert
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
        setToast({ msg: "Please enter a valid amount.", type: "error" });
        return;
    }
    if (numAmount > availableBalance) {
        setToast({ msg: "Amount exceeds available balance.", type: "error" });
        return;
    }
    if (!accountDetails.trim()) {
        setToast({ msg: "Please provide account details.", type: "error" });
        return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      const token = session.access_token;

      await axios.post('http://localhost:8080/api/withdrawals', 
        { 
            campaignId: campaign.id,
            amount: numAmount,
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

      // 2. Success: Show Toast, then wait 1.5s before closing modal
      setToast({ msg: "Withdrawal request submitted!", type: "success" });
      
      setTimeout(() => {
          onSuccess(); 
          onClose(); 
      }, 1500);

    } catch (error) {
      console.error("Withdrawal failed:", error);
      const errMsg = error.response?.data?.message || error.message || "Please try again.";
      // 3. Error: Show Toast
      setToast({ msg: "Withdrawal failed: " + errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Close 'X' Button */}
        <button className={styles.closeButton} onClick={onClose} disabled={loading}>
            <CloseIcon />
        </button>

        {/* Header Section with Icon */}
        <div className={styles.header}>
            <div className={styles.iconWrapper}>
                <WithdrawIcon />
            </div>
            <h2 className={styles.title}>Withdraw Funds</h2>
            <p className={styles.subtitle}>
                Available Balance: <span className={styles.balanceHighlight}>₱{availableBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </p>
        </div>

        <form onSubmit={handleWithdraw} className={styles.formWrapper}>
           <div className={styles.formSection}>
                {/* Amount Input */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Amount to Withdraw</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.currencySymbol}>₱</span>
                        <input 
                            type="number" 
                            className={`${styles.input} ${styles.inputWithSymbol}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={availableBalance}
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Payment Method</label>
                    <select 
                        className={styles.select}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={loading}
                    >
                        <option value="GCash">GCash</option>
                        <option value="Maya">Maya</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>

                {/* Account Details */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Account Details</label>
                    <input 
                        type="text" 
                        className={styles.input}
                        placeholder="e.g. Juan Cruz, 0917xxxxxxx"
                        value={accountDetails}
                        onChange={(e) => setAccountDetails(e.target.value)}
                        disabled={loading}
                    />
                </div>
           </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
                <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className={styles.confirmButton} 
                    disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                >
                    {loading ? 'Processing...' : 'Request Payout'}
                </button>
            </div>
        </form>

        {/* 4. Render Toast Component */}
        {toast && (
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={() => setToast(null)} 
            />
        )}

      </div>
    </div>
  );
}