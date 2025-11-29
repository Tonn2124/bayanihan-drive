import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/DonateModal.module.css';

// --- ICONS ---

// Donate Icon (Hand/Heart)
const DonateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5c0 3 3 6 5 9s5 6 5 3a5 5 0 0 0-5-5Z"></path><path d="M12 22s-4-3.5-4-9a4 4 0 0 1 8 0c0 5.5-4 9-4 9Z"></path></svg>
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

// Info Icon for Error Alert
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

// Donation Presets
const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];
const MIN_DONATION = 10; 

export default function DonateModal({ campaign, onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handlePresetClick = (preset) => {
        setAmount(preset.toString());
        setError(null);
    };

    const handleDonate = async (e) => {
        e.preventDefault();
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

            alert(`Thank you for donating ${formatCurrency(parsedAmount)} to "${campaign.title}"!`); 
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Donation failed:", err);
            if (err.response?.data?.message?.includes("Insufficient funds")) {
                setError("Insufficient funds in your wallet. Please add funds first.");
            } else {
                setError(err.response?.data?.message || "Donation failed. Please try again.");
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
                    <h2 className={styles.title}>Donate to Campaign</h2>
                    <p className={styles.subtitle}>
                        You are donating to **{campaign.title}**. Choose an amount to support their cause.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className={styles.errorAlert}>
                        <InfoIcon />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleDonate}>
                    {/* Preset Amounts Grid */}
                    <div className={styles.presetSection}>
                        <label className={styles.sectionLabel}>Quick Select</label>
                        <div className={styles.amountGrid}>
                            {PRESET_AMOUNTS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    className={`${styles.amountButton} ${parsedAmount === preset ? styles.selected : ''}`}
                                    onClick={() => handlePresetClick(preset)}
                                    disabled={loading}
                                >
                                    <span className={styles.amountValue}>₱{preset.toLocaleString()}</span>
                                    {parsedAmount === preset && (
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
                                min={MIN_DONATION}
                                disabled={loading}
                                required
                            />
                        </div>
                        <p className={styles.inputHint}>Minimum donation: ₱{MIN_DONATION}</p>
                    </div>

                    {/* Message and Anonymity */}
                    <div className={styles.messageSection}>
                        <label className={styles.sectionLabel} htmlFor="message">Message (Optional)</label>
                        <textarea 
                            id="message"
                            className={styles.customTextarea}
                            placeholder="Write a message of support..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="3"
                            disabled={loading}
                        />

                        <div className={styles.anonymousToggle}>
                            <input 
                                type="checkbox" 
                                id="anonymous"
                                className={styles.checkboxInput}
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                disabled={loading}
                            />
                            <label htmlFor="anonymous" className={styles.checkboxLabel}>Donate Anonymously</label>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className={styles.securityBadge}>
                        <LockIcon />
                        <span>Secure donation powered by Bayanihan Drive</span>
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
                            type="submit" 
                            className={styles.confirmButton} 
                            disabled={loading || parsedAmount < MIN_DONATION}
                        >
                            {loading ? (
                                <>
                                    <div className={styles.spinner}></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>Confirm {parsedAmount > 0 ? formatCurrency(parsedAmount) : 'Donation'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}