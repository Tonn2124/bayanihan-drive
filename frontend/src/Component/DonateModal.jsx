import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/DonateModal.module.css';

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];
const MIN_DONATION = 10;

// Icons
const DonateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function DonateModal({ campaign, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handlePresetClick = (val) => {
    setAmount(val.toString());
    setError(null);
  };

  const handleDonate = async () => {
    setError(null);

    if (parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (parsedAmount < MIN_DONATION) {
      setError(`Minimum donation is ₱${MIN_DONATION}`);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to donate.");
        setLoading(false);
        return;
      }
      const token = session.access_token;

      await axios.post('http://localhost:8080/api/donations', 
        { 
          campaignId: campaign.id,
          amount: parsedAmount,
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

      alert(`Thank you for donating ₱${formatCurrency(parsedAmount)}!`); 
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Donation failed:", err);
      if (err.response?.data?.message?.includes("Insufficient funds")) {
        setError("Insufficient funds. Please add funds to your wallet.");
      } else {
        setError(err.response?.data?.message || "Donation failed.");
      }
    } finally {
      setLoading(false);
    }
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
            <DonateIcon />
          </div>
          <div>
            <h2 className={styles.title}>Donate to Campaign</h2>
            <p className={styles.subtitle}>You are supporting <strong>{campaign.title}</strong></p>
          </div>
        </div>

        {/* Body (Split Layout) */}
        <div className={styles.modalBody}>
            
            {/* LEFT: Presets & Message */}
            <div className={styles.leftColumn}>
                <label className={styles.sectionLabel}>Quick Select</label>
                <div className={styles.amountGrid}>
                    {PRESET_AMOUNTS.map((preset) => (
                        <button
                            key={preset}
                            className={`${styles.amountButton} ${parsedAmount === preset ? styles.selected : ''}`}
                            onClick={() => handlePresetClick(preset)}
                            disabled={loading}
                        >
                            <span>₱{preset.toLocaleString()}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.messageArea}>
                    <label className={styles.sectionLabel}>Message (Optional)</label>
                    <textarea 
                        className={styles.customTextarea} 
                        placeholder="Write a message of support..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                    />
                    <label className={styles.anonymousToggle}>
                        <input 
                            type="checkbox" 
                            checked={isAnonymous} 
                            onChange={(e) => setIsAnonymous(e.target.checked)} 
                            disabled={loading}
                        />
                        Donate Anonymously
                    </label>
                </div>
            </div>

            {/* RIGHT: Custom Input & Summary */}
            <div className={styles.rightColumn}>
                <div>
                    <label className={styles.sectionLabel}>Custom Amount</label>
                    <div className={styles.inputContainer}>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currencySymbol}>₱</span>
                            <input 
                                type="number" 
                                className={styles.customInput}
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={MIN_DONATION}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <div className={styles.summaryRow}>
                            <span>Amount</span>
                            <span>₱{formatCurrency(parsedAmount)}</span>
                        </div>
                         <div className={styles.summaryRow}>
                            <span>Platform Fee</span>
                            <span style={{color:'#10B981', fontWeight:600}}>FREE</span>
                        </div>
                        <div className={styles.summaryDivider}></div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span className={styles.totalAmount}>₱{formatCurrency(parsedAmount)}</span>
                        </div>
                    </div>
                    
                    {error && <p style={{color:'red', fontSize:'0.8rem', marginTop:'0.5rem', textAlign:'center', background:'#FEF2F2', padding:'0.5rem', borderRadius:'8px', border:'1px solid #FECACA'}}>{error}</p>}
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose} disabled={loading}>Cancel</button>
                    <button className={styles.confirmButton} onClick={handleDonate} disabled={loading || parsedAmount < MIN_DONATION}>
                        {loading ? 'Processing...' : 'Confirm Donation'}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}