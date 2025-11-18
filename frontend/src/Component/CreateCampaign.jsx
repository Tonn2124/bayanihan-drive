import { useState } from 'react'
import { supabase } from '../supabaseClient'
import axios from 'axios'
import styles from '../Style/CreateCampaign.module.css' // <-- Import CSS Module

const categories = [
  'community',
  'animal_welfare',
  'medical',
  'education',
  'disaster_relief',
  'other'
]

export default function CreateCampaign({ session, onNavigate }) {
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [endDate, setEndDate] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to create a campaign.')
      }
      const token = session.access_token

      const campaignData = {
        title,
        description,
        goalAmount: parseFloat(goalAmount), 
        category: category, // Send lowercase string
        coverImageUrl: coverImageUrl || null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      }

      const response = await axios.post(
        'http://localhost:8080/api/campaigns', 
        campaignData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 201) {
        setSuccess('Your campaign has been created successfully!')
        setTitle('')
        setDescription('')
        setGoalAmount('')
        setCategory(categories[0])
        setEndDate('')
        setCoverImageUrl('')
        setTimeout(() => {
          onNavigate('dashboard')
        }, 2000)
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.title || err.message
      setError(`Failed to create campaign: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`card ${styles.formCard}`}>
      <h2 className={styles.formTitle}>Start Your Bayanihan Drive</h2>
      <p className={styles.formSubtitle}>Fill out the details to launch your campaign.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Campaign Title</label>
          <input
            id="title"
            className="form-control"
            type="text"
            placeholder="e.g. Help Rebuild the Community Library"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Campaign Story</label>
          <textarea
            id="description"
            className={styles.textarea}
            placeholder="Tell your story... Why is this important?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={20}
          />
        </div>

        <div className={styles.horizontalGroup}>
          <div className="form-group">
            <label htmlFor="goalAmount">Goal Amount (in PHP)</label>
            <input
              id="goalAmount"
              className="form-control"
              type="number"
              placeholder="e.g. 50000"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.horizontalGroup}>
          <div className="form-group">
            <label htmlFor="coverImageUrl">Cover Image URL</label>
            <input
              id="coverImageUrl"
              className="form-control"
              type="url"
              placeholder="https://..."
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <input
              id="endDate"
              className="form-control"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <hr style={{margin: '1.5rem 0'}} />

        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            disabled={loading}
            onClick={() => onNavigate('dashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Launch Campaign'}
          </button>
        </div>
      </form>
    </div>
  )
}