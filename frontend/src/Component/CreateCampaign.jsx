import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient' 
import axios from 'axios'
// Make sure this path matches where you saved your CSS file!
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
  
  // --- FILE UPLOAD STATE ---
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([]) 
  const [uploading, setUploading] = useState(false)
  
  // --- CAROUSEL & MODAL STATE ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [dateLimits, setDateLimits] = useState({ min: '', max: '' })

  // Date Logic
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
    setEndDate('') 
  }, [urgency])

  // --- HANDLERS ---
  const openModal = (url) => {
    setModalImage(url);
    setIsModalOpen(true);
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === previewUrls.length - 1 ? 0 : prev + 1));
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? previewUrls.length - 1 : prev - 1));
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError('Maximum 5 images allowed.');
      return;
    }
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
    setSelectedFiles([...selectedFiles, ...files]);
    setError(null);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
    setCurrentImageIndex(0); 
  };

  const uploadImagesToSupabase = async () => {
    if (selectedFiles.length === 0) return [];
    setUploading(true);
    const uploadedUrls = [];

    try {
        for (const file of selectedFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
            const filePath = `${session?.user?.id || 'guest'}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('campaign-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('campaign-images')
                .getPublicUrl(filePath);

            uploadedUrls.push(data.publicUrl);
        }
    } catch (err) {
        console.error('Upload failed:', err);
        setError('Image upload failed. Please try again.');
        setUploading(false);
        return null; 
    }

    setUploading(false);
    return uploadedUrls;
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '₱0';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(num);
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null); setSuccess(null);

    if (!title || !description || !goalAmount || !endDate) {
      setError('Please fill in all required fields.')
      return
    }
    if (selectedFiles.length === 0) {
        setError('Please upload at least one image.');
        return;
    }

    const cleanGoal = parseFloat(goalAmount.toString().replace(/,/g, ''));
    setLoading(true);

    const imageUrls = await uploadImagesToSupabase();
    if (!imageUrls) { setLoading(false); return; }

    try {
      const campaignData = {
        title, 
        description, 
        goalAmount: cleanGoal, 
        category, 
        urgency,
        coverImageUrl: imageUrls[0], 
        images: imageUrls, 
        endDate: new Date(endDate).toISOString(),
      }

      const token = session?.access_token;
      
      const response = await axios.post('http://localhost:8080/api/campaigns', campaignData, {
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) }
      })

      if (response.status === 201 || response.status === 200) {
        setSuccess('Campaign Launched Successfully!')
        setTimeout(() => { 
            if(onNavigate) onNavigate('dashboard'); 
            else window.location.reload();
        }, 1500)
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create campaign.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      
      {/* --- MODAL (POPUP) --- */}
      {isModalOpen && (
           <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
               <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                   <button className={styles.closeModal} onClick={() => setIsModalOpen(false)}>×</button>
                   <img src={modalImage} alt="Full View" className={styles.fullImage} />
               </div>
           </div>
       )}

      <div className={styles.container}>
        
        {/* HEADER */}
        <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => onNavigate && onNavigate('dashboard')}>
               ← Cancel
            </button>
            <h1 className={styles.pageTitle}>New Campaign</h1>
        </div>

        <div className={styles.grid}>
            
            {/* LEFT: FORM INPUTS */}
            <div className={styles.formColumn}>
                <div className={styles.card}>
                    <div className={styles.cardBody}>
                        {error && <div className={styles.alertError}>{error}</div>}
                        {success && <div className={styles.alertSuccess}>{success}</div>}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formSection}>
                                <div className={styles.formGroup}>
                                    <label>Title <span className={styles.req}>*</span></label>
                                    <input className={styles.input} type="text" placeholder="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} maxLength={80}/>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Category</label>
                                        <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                                            {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Goal (₱)</label>
                                        <input className={styles.input} type="number" placeholder="0.00" value={goalAmount} onChange={e => setGoalAmount(e.target.value)}/>
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Urgency</label>
                                        <select className={styles.select} value={urgency} onChange={e => setUrgency(e.target.value)}>
                                            {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>End Date</label>
                                        <input className={styles.input} type="date" value={endDate} min={dateLimits.min} max={dateLimits.max} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* --- FIXED UPLOAD SECTION --- */}
                            <div className={styles.uploadSection}>
                                <label className={styles.label}>Campaign Images (Max 5)</label>
                                <div className={styles.fileUploadContainer}>
                                    {/* The Button */}
                                    <input type="file" accept="image/*" multiple onChange={handleFileSelect} className={styles.fileInput} id="fileInput"/>
                                    <label htmlFor="fileInput" className={styles.uploadButton}>
                                        <span className={styles.plusIcon}>+</span>
                                        <span>Add</span>
                                    </label>
                                    
                                    {/* The Thumbnails (Replaces the ugly text list) */}
                                    <div className={styles.thumbnailStrip}>
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className={styles.thumbnailWrapper}>
                                                <img 
                                                    src={url} 
                                                    alt="preview" 
                                                    onClick={() => openModal(url)} 
                                                    className={styles.thumbnailImg}
                                                />
                                                <button type="button" className={styles.removeBtn} onClick={() => removeFile(index)}>×</button>
                                            </div>
                                        ))}
                                        {previewUrls.length === 0 && <span className={styles.emptyText}>No photos selected yet</span>}
                                    </div>
                                </div>
                            </div>

                            {/* FLEXIBLE STORY BOX */}
                            <div className={styles.flexFormGroup}>
                                <label className={styles.label}>Story <span className={styles.req}>*</span></label>
                                <textarea className={styles.textarea} placeholder="Tell the story about your cause..." value={description} onChange={e => setDescription(e.target.value)}/>
                            </div>

                            <button type="submit" className={styles.btnPrimary} disabled={loading || uploading}>
                                {uploading ? 'Uploading Images...' : loading ? 'Launching...' : 'Launch Campaign'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* RIGHT: LIVE PREVIEW */}
            <div className={styles.previewColumn}>
                <div className={styles.stickyWrapper}>
                    <h4 className={styles.previewHeader}>Live Preview</h4>
                    <div className={styles.previewCard}>
                        <div className={styles.previewImageWrapper}>
                            <img 
                                src={previewUrls.length > 0 ? previewUrls[currentImageIndex] : 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=No+Image'} 
                                alt="Preview" 
                                className={styles.previewImage}
                            />
                            
                            {/* CAROUSEL CONTROLS */}
                            {previewUrls.length > 1 && (
                                <>
                                    <button type="button" onClick={prevImage} className={styles.navBtnLeft}>‹</button>
                                    <button type="button" onClick={nextImage} className={styles.navBtnRight}>›</button>
                                    <div className={styles.imageCounter}>
                                        {currentImageIndex + 1} / {previewUrls.length}
                                    </div>
                                </>
                            )}

                            <div className={styles.previewBadge}>{category.replace('_', ' ')}</div>
                        </div>
                        <div className={styles.previewContent}>
                            <h3 className={styles.previewTitle}>{title || 'Your Campaign Title'}</h3>
                            <p className={styles.previewDesc}>
                                {description ? description.substring(0, 100) : 'Your story description will appear here...'}
                                {description.length > 100 && '...'}
                            </p>
                            
                            <div className={styles.previewStats}>
                                <div className={styles.previewBar}><div className={styles.previewFill} style={{width: '0%'}}></div></div>
                                <div className={styles.previewMeta}>
                                    <strong>₱0</strong> raised of {formatCurrency(goalAmount)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}
