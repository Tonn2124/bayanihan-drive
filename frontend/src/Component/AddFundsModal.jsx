import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AddFundsModal.module.css';

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

// Wallet Icon
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
);

// Check Icon
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

// Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// Lock Icon for Security Badge
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export default function AddFundsModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    
    if (!amount || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parsedAmount < 100) {
      setError('Minimum top-up amount is ₱100');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      await axios.post('http://localhost:8080/api/wallet/add-funds', 
        { amount: parsedAmount },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add funds:", error);
      setError(error.response?.data?.message || "Failed to add funds. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    setAmount(preset.toString());
    setError(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose} disabled={loading}>
          <CloseIcon />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <WalletIcon />
          </div>
          <h2 className={styles.title}>Add Funds to Wallet</h2>
          <p className={styles.subtitle}>
            Choose an amount or enter a custom value to top up your wallet
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorAlert}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Preset Amounts Grid */}
        <div className={styles.presetSection}>
          <label className={styles.sectionLabel}>Quick Select</label>
          <div className={styles.amountGrid}>
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`${styles.amountButton} ${parseFloat(amount) === preset ? styles.selected : ''}`}
                onClick={() => handlePresetClick(preset)}
                disabled={loading}
              >
                <span className={styles.amountValue}>₱{preset.toLocaleString()}</span>
                {parseFloat(amount) === preset && (
                  <div className={styles.checkmark}>
                    <CheckIcon />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className={styles.customSection}>
          <label className={styles.sectionLabel} htmlFor="customAmount">
            Custom Amount
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.currencySymbol}>₱</span>
            <input 
              id="customAmount"
              type="number" 
              className={styles.customInput}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              min="100"
              disabled={loading}
            />
          </div>
          <p className={styles.inputHint}>Minimum amount: ₱100</p>
        </div>

        {/* Amount Preview */}
        {amount && parseFloat(amount) > 0 && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Amount to add</span>
              <span className={styles.summaryAmount}>{formatCurrency(parseFloat(amount))}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Transaction fee</span>
              <span className={styles.freeTag}>FREE</span>
            </div>
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>{formatCurrency(parseFloat(amount))}</span>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className={styles.securityBadge}>
          <LockIcon />
          <span>Secure transaction powered by Bayanihan Drive</span>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.cancelButton} 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={styles.confirmButton} 
            onClick={handleAddFunds}
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                <span>Processing...</span>
              </>
            ) : (
              <>Add {amount ? formatCurrency(parseFloat(amount)) : 'Funds'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
