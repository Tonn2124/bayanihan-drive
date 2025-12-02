import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/MyDonations.module.css';

export default function MyDonations() {
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
        setError("Could not load your donation history.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading history...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  if (donations.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)'}}>
        <h3>No donations yet.</h3>
        <p>Your generosity will show up here!</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <h2 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1c1e21'}}>
        My Donation History
      </h2>
      
      {donations.map((donation) => (
        <div key={donation.id} className={styles.donationItem}>
          <div className={styles.leftSide}>
            <div className={styles.icon}>❤️</div>
            <div className={styles.info}>
              <h4>Donation to Campaign #{donation.campaignId}</h4>
              <div className={styles.date}>
                {new Date(donation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
              {donation.message && <div className={styles.message}>"{donation.message}"</div>}
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