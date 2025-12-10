import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/CampaignDetails.module.css'; // Reusing existing styles for consistency

const API_BASE_URL = 'http://localhost:8080/api';

export default function EditCampaignModal({ campaign, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: campaign.title || '',
        description: campaign.description || '',
        goalAmount: campaign.goalAmount || '',
        category: campaign.category || 'COMMUNITY',
        coverImageUrl: campaign.coverImageUrl || ''
    });

    const categories = ['COMMUNITY', 'ANIMAL_WELFARE', 'MEDICAL', 'EDUCATION', 'DISASTER_RELIEF', 'OTHER'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // API Call to Update (PUT request)
            await axios.put(
                `${API_BASE_URL}/campaigns/${campaign.id}`, 
                formData, 
                { headers: { 'Authorization': `Bearer ${session.access_token}` } }
            );

            onSuccess(); // Refresh parent data
            onClose(); // Close modal
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update campaign. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} style={{zIndex: 2000}}>
            <div className={styles.modalContainer} style={{maxWidth: '600px', height: 'auto', maxHeight: '90vh', padding: '0'}}>
                
                {/* Header */}
                <div style={{padding: '1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={{fontSize: '1.25rem', fontWeight: '700', margin: 0}}>Edit Campaign</h2>
                    <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
                </div>

                {/* Form Body */}
                <div style={{padding: '1.5rem', overflowY: 'auto'}}>
                    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        
                        {/* Title */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Campaign Title</label>
                            <input 
                                name="title"
                                className={styles.formInput} 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. Help build a library..."
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Category</label>
                            <select 
                                name="category"
                                className={styles.formInput} 
                                value={formData.category} 
                                onChange={handleChange}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        {/* Goal Amount */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Goal Amount (PHP)</label>
                            <input 
                                type="number"
                                name="goalAmount"
                                className={styles.formInput} 
                                value={formData.goalAmount} 
                                onChange={handleChange} 
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Cover Image URL</label>
                            <input 
                                name="coverImageUrl"
                                className={styles.formInput} 
                                value={formData.coverImageUrl} 
                                onChange={handleChange} 
                                placeholder="https://..."
                            />
                            {formData.coverImageUrl && (
                                <img src={formData.coverImageUrl} alt="Preview" style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem'}} 
                                onError={(e) => e.target.style.display='none'}/>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Story / Description</label>
                            <textarea 
                                name="description"
                                className={styles.formTextarea} 
                                value={formData.description} 
                                onChange={handleChange} 
                                style={{minHeight: '150px'}}
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5'}}>
                            <button type="button" onClick={onClose} className={styles.withdrawButton}>Cancel</button>
                            <button type="submit" className={styles.donateButton} style={{marginTop: 0}} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}