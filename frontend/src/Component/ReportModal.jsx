import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
// We'll use inline styles for the overlay to ensure it works regardless of module css issues
// But we'll try to use CSS variables for colors

export default function ReportModal({ campaignId, onClose }) {
  const [reason, setReason] = useState('');
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!reason) {
        setError("Please provide a reason.");
        return;
    }
    if (!selectedFile) {
        setError("Please attach proof (screenshot or document).");
        return;
    }

    try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // 1. Upload Proof
        setUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `proofs/${campaignId}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('campaign-images') // Reusing bucket for now, or use separate 'reports' bucket
            .upload(fileName, selectedFile);
            
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('campaign-images')
            .getPublicUrl(fileName);
            
        const proofUrl = publicUrlData.publicUrl;
        setUploading(false);

        // 2. Submit Report
        await axios.post('http://localhost:8080/api/reports', {
            campaignId,
            reason,
            proofUrl
        }, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        alert("Report submitted successfully.");
        onClose();
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Failed to submit report.");
        setUploading(false);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it's on top
    }} onClick={onClose}>
        <div style={{
            backgroundColor: 'var(--card-bg, #fff)',
            color: 'var(--text-primary, #000)',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
        }} onClick={e => e.stopPropagation()}>
            
            <h3 style={{marginTop: 0, color: '#ef4444'}}>Report Campaign</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary, #666)'}}>
                If you believe this campaign is fraudulent or violates our terms, please let us know.
                Note: You can only report a campaign once every 24 hours.
            </p>

            {error && <div style={{padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '10px', fontSize: '0.9rem'}}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem'}}>Reason for Reporting</label>
                    <textarea 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        style={{
                            width: '100%', 
                            height: '100px', 
                            padding: '10px', 
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #ccc)',
                            backgroundColor: 'var(--input-bg, #fff)',
                            color: 'var(--text-primary, #000)',
                            fontFamily: 'inherit'
                        }}
                        placeholder="Explain why this campaign is suspicious..."
                    />
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem'}}>Proof (Required)</label>
                    <input 
                        type="file" 
                        onChange={handleFileSelect}
                        style={{width: '100%'}}
                    />
                    <small style={{display: 'block', marginTop: '4px', color: '#666'}}>
                        Please attach a screenshot or document supporting your claim.
                    </small>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        style={{
                            padding: '10px 20px', 
                            background: 'transparent', 
                            border: '1px solid var(--border-color, #ccc)', 
                            borderRadius: '8px',
                            color: 'var(--text-secondary, #666)',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading || uploading} 
                        style={{
                            padding: '10px 20px', 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',
                            fontWeight: '600',
                            opacity: (loading || uploading) ? 0.7 : 1
                        }}
                    >
                        {(loading || uploading) ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
