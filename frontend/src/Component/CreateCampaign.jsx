import { useState } from 'react'
import { supabase } from '../supabaseClient'
import axios from 'axios'
import styles from '../Style/CreateCampaign.module.css'

const categories = [
  'community', 'animal_welfare', 'medical', 'education', 'disaster_relief', 'other'
]

export default function CreateCampaign({ session, onNavigate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [endDate, setEndDate] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '₱0';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(num);
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title || !description || !goalAmount || !category) {
      setError('Please fill required fields')
      return
    }
    const cleanGoalAmount = parseFloat(goalAmount.toString().replace(/,/g, ''));
    if (isNaN(cleanGoalAmount) || cleanGoalAmount <= 0) {
      setError('Invalid goal amount.');
      return;
    }
    setLoading(true); setError(null); setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not logged in.')
      
      const campaignData = {
        title, description, goalAmount: cleanGoalAmount, category, 
        coverImageUrl: coverImageUrl || null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      }

      const response = await axios.post('http://localhost:8080/api/campaigns', campaignData, {
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
      })

      if (response.status === 201) {
        setSuccess('Created!')
        setTimeout(() => { onNavigate ? onNavigate('dashboard') : window.location.reload() }, 1000)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed.")
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
                                    <label>End Date <span className={styles.opt}>(Opt)</span></label>
                                    <input className={styles.input} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Image URL <span className={styles.opt}>(Opt)</span></label>
                                    <input className={styles.input} type="url" placeholder="https://..." value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} />
                                </div>
                            </div>

                            {/* UPDATED: Description uses flexFormGroup to fill space */}
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

                            <button type="submit" className={styles.btnPrimary} disabled={loading}>
                                {loading ? 'Launching...' : 'Launch Campaign'}
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
                            src={coverImageUrl || 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Image'} 
                            alt="Preview" 
                            className={styles.previewImage}
                            onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/600x400/F3F4F6/9CA3AF?text=Image"}}
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