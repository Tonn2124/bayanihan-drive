import { useState } from 'react'
import { supabase } from '../supabaseClient'
import axios from 'axios'
import styles from '../Style/CreateCampaign.module.css'

const categories = [
  'community',
  'animal_welfare',
  'medical',
  'education',
  'disaster_relief',
  'other'
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!title || !description || !goalAmount || !category) {
      setError('Please fill in all required fields')
      return
    }

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
        category: category,
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
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.mainTitle}>Start a Donation Drive</h1>
          <p className={styles.mainSubtitle}>
            Share your story and let the community help you reach your goal
          </p>
        </div>

        {/* Main Form Card */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Drive Details</h2>
            <p className={styles.cardDescription}>
              Fill in the information about your donation drive. Be clear and honest to build trust.
            </p>
          </div>

          <div className={styles.cardContent}>
            {error && <div className={styles.alertDanger}>{error}</div>}
            {success && <div className={styles.alertSuccess}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Title */}
              <div className={styles.formField}>
                <label htmlFor="title" className={styles.label}>
                  Title <span className={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  className={styles.input}
                  type="text"
                  placeholder="e.g., Help Juan recover from surgery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className={styles.formField}>
                <label htmlFor="category" className={styles.label}>
                  Category <span className={styles.required}>*</span>
                </label>
                <select
                  id="category"
                  className={styles.select}
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

              {/* Description */}
              <div className={styles.formField}>
                <label htmlFor="description" className={styles.label}>
                  Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="description"
                  className={styles.textarea}
                  placeholder="Tell your story. Why do you need help? How will the funds be used?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={20}
                  rows={8}
                />
                <p className={styles.helpText}>
                  Be specific and transparent. Share details that help people understand your situation.
                </p>
              </div>

              {/* Goal Amount */}
              <div className={styles.formField}>
                <label htmlFor="goalAmount" className={styles.label}>
                  Fundraising Goal (₱) <span className={styles.required}>*</span>
                </label>
                <input
                  id="goalAmount"
                  className={styles.input}
                  type="number"
                  placeholder="50000"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  required
                  min="1"
                />
                <p className={styles.helpText}>
                  Set a realistic goal based on your actual needs
                </p>
              </div>

              {/* Cover Image URL */}
              <div className={styles.formField}>
                <label htmlFor="coverImageUrl" className={styles.label}>
                  Image URL
                </label>
                <input
                  id="coverImageUrl"
                  className={styles.input}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
                <p className={styles.helpText}>
                  Add a photo that represents your cause. Photos help build trust and connection.
                </p>
              </div>

              {/* End Date */}
              <div className={styles.formField}>
                <label htmlFor="endDate" className={styles.label}>
                  End Date (Optional)
                </label>
                <input
                  id="endDate"
                  className={styles.input}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Donation Drive'}
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => onNavigate('dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tips Card */}
        <div className={styles.tipsCard}>
          <div className={styles.tipsContent}>
            <h3 className={styles.tipsTitle}>Tips for a successful drive</h3>
            <ul className={styles.tipsList}>
              <li>Use a clear, compelling title that explains your need</li>
              <li>Include specific details about how funds will be used</li>
              <li>Add authentic photos that show your situation</li>
              <li>Share regular updates with your donors</li>
              <li>Set a realistic goal based on actual costs</li>
              <li>Be honest and transparent throughout your campaign</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
