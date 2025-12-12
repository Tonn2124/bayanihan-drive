import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/AddFundsModal.module.css';
import Toast from './Toast'; // 1. Import Toast

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

// Icons
const WalletIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
);

const CloseIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function AddFundsModal({ onClose, onSuccess }) {
 
 const [inputValue, setInputValue] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [toast, setToast] = useState(null); // 2. Add Toast State

 // --- FORMATTING HELPERS ---

 // 1. Format for Display 
 const formatCurrency = (val) => {
   if (!val) return '0.00';
   return new Intl.NumberFormat('en-PH', {
     style: 'decimal',
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   }).format(val);
 };

 // 2. Format Input 
 const handleInputChange = (e) => {
   let val = e.target.value.replace(/[^\d.]/g, '');
   
   const parts = val.split('.');
   if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
   
   if (parts.length === 2 && parts[1].length > 2) {
       val = parts[0] + '.' + parts[1].substring(0, 2);
   }

   setInputValue(val);
   setError(null);
 };

 // 3. Format Input on Blur 
 const handleBlur = () => {
   if (!inputValue) return;
   const num = parseFloat(inputValue.replace(/,/g, ''));
   if (!isNaN(num)) {
       setInputValue(formatCurrency(num)); 
   }
 };

 // 4. Handle Preset Clicks
 const handlePresetClick = (amount) => {
   setInputValue(formatCurrency(amount));
   setError(null);
 };

 // --- SUBMISSION ---
 const handleAddFunds = async (e) => {
   e.preventDefault();
   setError(null);

   const rawValue = parseFloat(inputValue.replace(/,/g, ''));
   
   if (!rawValue || rawValue <= 0) {
     setError('Please enter a valid amount');
     return;
   }

   if (rawValue < 100) {
     setError('Minimum top-up is ₱100.00');
     return;
   }

   setLoading(true);
   try {
     const { data: { session } } = await supabase.auth.getSession();
     const token = session.access_token;

     await axios.post('http://localhost:8080/api/wallet/add-funds', 
       { amount: rawValue },
       {
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         }
       }
     );

     // 3. Show Success Toast and delay closing
     setToast({ msg: "Funds added successfully!", type: "success" });
     
     setTimeout(() => {
        onSuccess();
        onClose();
     }, 1500);

   } catch (error) {
     console.error("Failed to add funds:", error);
     setError(error.response?.data?.message || "Failed to add funds.");
   } finally {
     setLoading(false);
   }
 };

 // Derived value for summary
 const currentAmount = parseFloat(inputValue.replace(/,/g, '')) || 0;

 return (
   <div className={styles.overlay} onClick={onClose}>
     <div className={styles.modal} onClick={e => e.stopPropagation()}>
       
       {/* Close Button */}
       <button className={styles.closeButton} onClick={onClose} disabled={loading} type="button">
         <CloseIcon />
       </button>

       {/* 1. Header */}
       <div className={styles.header}>
         <div className={styles.iconWrapper}>
           <WalletIcon />
         </div>
         <div>
           <h2 className={styles.title}>Add Funds</h2>
           <p className={styles.subtitle}>Securely top up your wallet</p>
         </div>
       </div>

       {/* 2. Split Body Layout */}
       <div className={styles.modalBody}>
           
           {/* LEFT SIDE: Presets */}
           <div className={styles.leftColumn}>
               <label className={styles.sectionLabel}>Quick Select</label>
               <div className={styles.amountGrid}>
                   {PRESET_AMOUNTS.map((preset) => (
                   <button
                       key={preset}
                       type="button"
                       className={`${styles.amountButton} ${currentAmount === preset ? styles.selected : ''}`}
                       onClick={() => handlePresetClick(preset)}
                       disabled={loading}
                   >
                       <span>₱{formatCurrency(preset)}</span>
                   </button>
                   ))}
               </div>
           </div>

           {/* RIGHT SIDE: Custom Input & Actions */}
           <div className={styles.rightColumn}>
               <div>
                   <label className={styles.sectionLabel}>Custom Amount</label>
                   <div className={styles.inputContainer}>
                       <div className={styles.inputWrapper}>
                           <span className={styles.currencySymbol}>₱</span>
                           {/* Controlled Input with Formatting Logic */}
                           <input 
                               type="text"
                               className={styles.customInput}
                               placeholder="0.00"
                               value={inputValue}
                               onChange={handleInputChange}
                               onBlur={handleBlur}
                               disabled={loading}
                           />
                       </div>
                   </div>

                   {/* Summary is ALWAYS visible (placeholder zeroes if empty) to prevent resizing */}
                   <div className={styles.summaryCard}>
                       <div className={styles.summaryRow}>
                           <span>Amount</span>
                           <span>₱{formatCurrency(currentAmount)}</span>
                       </div>
                       <div className={styles.summaryRow}>
                           <span>Fee</span>
                           <span style={{color: '#10B981', fontWeight: 600}}>FREE</span>
                       </div>
                       <div className={styles.summaryDivider}></div>
                       <div className={styles.totalRow}>
                           <span>Total</span>
                           <span className={styles.totalAmount}>₱{formatCurrency(currentAmount)}</span>
                       </div>
                   </div>
               </div>

               {/* Error displayed absolutely at bottom of inputs to not shift layout */}
               {error && (
                   <div className={styles.errorAlert}>
                       <span>{error}</span>
                   </div>
               )}

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
                       disabled={loading || currentAmount <= 0}
                   >
                       {loading && <span className={styles.spinner}></span>}
                       Confirm
                   </button>
               </div>
           </div>
       </div>

       {/* 4. Render Toast */}
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