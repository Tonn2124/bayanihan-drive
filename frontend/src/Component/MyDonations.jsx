import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/MyDonations.module.css';

// 1. We accept 'onNavigate' as a prop
export default function MyDonations({ onNavigate }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Please log in.");
        
        const token = session.access_token;
        const response = await axios.get('http://localhost:8080/api/donations/my-donations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setDonations(response.data);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Could not load donation history.");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const handleItemClick = (campaignId) => {
    // 2. We use YOUR custom navigation from App.js
    if (onNavigate) {
      onNavigate('campaignDetails', campaignId);
    } else {
      console.error("Navigation function not found. Please check Dashboard.jsx");
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading history...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  if (donations.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '3rem', color: '#666'}}>
        <h3>No donations yet.</h3>
        <p>Your generosity will show up here!</p>
      </div>
    );
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);

  return (
    // If isModal is true, we remove the default container class to avoid double padding
    <div className={!isModal ? styles.container : ''}>
      {!isModal && (
        <h2 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1c1e21'}}>
            My Donation History
        </h2>
      )}
      
      {donations.map((donation) => (
        <div 
            key={donation.id} 
            className={styles.donationItem}
            // 3. Trigger the click handler here
            onClick={() => handleItemClick(donation.campaignId)} 
        >
          <div className={styles.leftSide}>
            <div className={styles.icon}>❤️</div>
            <div className={styles.info}>
              <h4>Donated to Campaign #{donation.campaignId}</h4>
              <div className={styles.date}>
                {new Date(donation.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className={styles.amount}>
            {formatCurrency(donation.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}