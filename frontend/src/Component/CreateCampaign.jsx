import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import axios from 'axios'
import styles from '../Style/CreateCampaign.module.css'

const categories = [
  'community', 'animal_welfare', 'medical', 'education', 'disaster_relief', 'other'
]

const urgencies = ['LIGHT', 'MODERATE', 'SEVERE']

export default function CreateCampaign({ session, onNavigate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [urgency, setUrgency] = useState(urgencies[0])
  const [endDate, setEndDate] = useState('')
  
  // Replaced manual URL input with File Upload state
  const [selectedFiles, setSelectedFiles] = useState([])
  const [imageUrls, setImageUrls] = useState([]) 
  const [uploading, setUploading] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Calculate Date Limits
  const [dateLimits, setDateLimits] = useState({ min: '', max: '' })

  useEffect(() => {
    const today = new Date();
    let minDate = new Date(today);
    let maxDate = new Date(today);

    if (urgency === 'LIGHT') {
      minDate.setMonth(today.getMonth() + 6);
      maxDate.setMonth(today.getMonth() + 12);
    } else if (urgency === 'MODERATE') {
      minDate.setMonth(today.getMonth() + 3);
      maxDate.setMonth(today.getMonth() + 5);
    } else if (urgency === 'SEVERE') {
      minDate.setDate(today.getDate() + 1);
      maxDate.setMonth(today.getMonth() + 2);
    }
    
    setDateLimits({
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    })
    
    // Reset end date if out of range (optional, but good UX)
    setEndDate('') 

  }, [urgency])

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '₱0';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(num);
  }

  // --- FILE UPLOAD LOGIC ---
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError('Maximum 5 images allowed.');
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
    setError(null);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    const urls = [];

    for (const file of selectedFiles) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${session.user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('campaign-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('campaign-images')
                .getPublicUrl(filePath);

            urls.push(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload one or more images. Please try again.');
            setUploading(false);
            return null; // Signal failure
        }
    }
    setUploading(false);
    return urls;
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title || !description || !goalAmount || !category || !urgency || !endDate) {
      setError('Please fill required fields (Title, Story, Goal, Category, Urgency, End Date)')
      return
    }
    const cleanGoalAmount = parseFloat(goalAmount.toString().replace(/,/g, ''));
    if (isNaN(cleanGoalAmount) || cleanGoalAmount <= 0) {
      setError('Invalid goal amount.');
      return;
    }

    if (selectedFiles.length === 0) {
        setError('Please upload at least one image.');
        return;
    }

    setLoading(true); setError(null); setSuccess(null);

    // 1. Upload Images First
    const uploadedUrls = await uploadImages();
    if (!uploadedUrls) {
        setLoading(false);
        return; // Stopped due to upload error
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in.')
      
      const campaignData = {
        title, 
        description, 
        goalAmount: cleanGoalAmount, 
        category, 
        urgency,
        coverImageUrl: uploadedUrls[0], // First image is cover
        images: uploadedUrls,
        endDate: new Date(endDate).toISOString(),
      }

      const response = await axios.post('http://localhost:8080/api/campaigns', campaignData, {
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
      })

      if (response.status === 201) {
        setSuccess('Created!')
        setTimeout(() => { onNavigate ? onNavigate('dashboard') : window.location.reload() }, 1000)
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => onNavigate('dashboard')}>
               ← Cancel
            </button>
            <h1 className={styles.pageTitle}>New Campaign</h1>
        </div>

        <div className={styles.grid}>
            
            {/* Left: Form */}
            <div className={styles.formColumn}>
                <div className={styles.card}>
                    <div className={styles.cardBody}>
                        {error && <div className={styles.alertError}>{error}</div>}
                        {success && <div className={styles.alertSuccess}>{success}</div>}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            
                            <div className={styles.formGroup}>
                                <label>Title <span className={styles.req}>*</span></label>
                                <input 
                                    className={styles.input} 
                                    type="text" 
                                    placeholder="Campaign Title" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    maxLength={80}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Category <span className={styles.req}>*</span></label>
                                    <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                                        {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Goal (₱) <span className={styles.req}>*</span></label>
                                    <input 
                                        className={styles.input} 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={goalAmount}
                                        onChange={e => setGoalAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Urgency <span className={styles.req}>*</span></label>
                                    <select className={styles.select} value={urgency} onChange={e => setUrgency(e.target.value)}>
                                        {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <small className={styles.helperText}>
                                        {urgency === 'LIGHT' && "6 - 12 months"}
                                        {urgency === 'MODERATE' && "3 - 5 months"}
                                        {urgency === 'SEVERE' && "Days to 2 months"}
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>End Date <span className={styles.req}>*</span></label>
                                    <input 
                                        className={styles.input} 
                                        type="date" 
                                        value={endDate} 
                                        min={dateLimits.min}
                                        max={dateLimits.max}
                                        onChange={e => setEndDate(e.target.value)} 
                                    />
                                </div>
                            </div>

                            {/* Images Section (File Upload) */}
                            <div className={styles.formGroup}>
                                <label>Campaign Images (Max 5) <span className={styles.opt}>(First is cover)</span></label>
                                <div className={styles.fileUploadBox}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleFileSelect}
                                        className={styles.fileInput}
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput" className={styles.fileLabel}>
                                        <span>Click to upload images</span>
                                    </label>
                                </div>

                                {/* Preview List */}
                                <div className={styles.previewList}>
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className={styles.previewItem}>
                                            <span className={styles.fileName}>{file.name}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => removeFile(index)}
                                                className={styles.removeBtn}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expanded Story Section */}
                            <div className={styles.flexFormGroup}>
                                <label>Story <span className={styles.req}>*</span></label>
                                <textarea 
                                    className={styles.textarea} 
                                    placeholder="Describe your cause..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    minLength={20}
                                />
                            </div>

                            <button type="submit" className={styles.btnPrimary} disabled={loading || uploading}>
                                {loading || uploading ? 'Processing...' : 'Launch Campaign'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className={styles.previewColumn}>
                <div className={styles.previewCard}>
                    <div className={styles.previewImageWrapper}>
                        <img 
                            src={selectedFiles.length > 0 ? URL.createObjectURL(selectedFiles[0]) : 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Image'} 
                            alt="Preview" 
                            className={styles.previewImage}
                        />
                        <div className={styles.previewBadge}>{category.replace('_', ' ')}</div>
                    </div>
                    <div className={styles.previewContent}>
                        <h3 className={styles.previewTitle}>{title || 'Campaign Title'}</h3>
                        <p className={styles.previewDesc}>
                            {description ? description.substring(0, 120) + (description.length > 120 ? '...' : '') : 'Your description preview...'}
                        </p>
                        
                        <div className={styles.previewStats}>
                            <div className={styles.previewBar}><div className={styles.previewFill} style={{width: '0%'}}></div></div>
                            <div className={styles.previewMeta}><strong>₱0</strong> of {formatCurrency(goalAmount)}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.tipsBox}>
                    <h5>💡 Quick Tips</h5>
                    <ul>
                        <li>Use a catchy title.</li>
                        <li>High-quality images attract more donors.</li>
                        <li>Be clear about how funds will be used.</li>
                    </ul>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}
