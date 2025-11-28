import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../Style/Dashboard.module.css'
import CampaignList from './CampaignList'
import AddFundsModal from './AddFundsModal'
import MyCampaigns from './MyCampaigns'
import MyDonations from './MyDonations';

export default function Dashboard({ session, onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState(null)
  const [showAddFunds, setShowAddFunds] = useState(false) 
  const [activeTab, setActiveTab] = useState('all'); 

  const fetchData = useCallback(async () => {
      try {
        const { user } = session
        
        // Fetch Profile including ROLE
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username, role') // <-- Make sure to select 'role'
          .eq('id', user.id)
          .single() 

        if (profileError) throw profileError
        setProfile(profileData)

        let { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single() 

        if (walletError) throw walletError
        setWallet(walletData)

      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
  }, [session])

  useEffect(() => {
    fetchData()
  }, [fetchData]) 

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { 
      style: 'currency',
      currency: 'PHP', 
    }).format(amount)
  }

  // Check if user is admin (case-insensitive check is safer)
  const isAdmin = profile?.role?.toUpperCase() === 'ADMIN';

  return (
    <div className={`card ${styles.dashboardCard}`}>
      {showAddFunds && (
        <AddFundsModal 
          onClose={() => setShowAddFunds(false)} 
          onSuccess={() => {
            fetchData()
            alert("Funds added successfully!")
          }} 
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.welcomeTitle}>Welcome, {profile?.username || 'User'}!</h2>
        
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            {/* FIX: Only show Admin Panel if user is ADMIN */}
            {isAdmin && (
                <button 
                    className="btn btn-secondary" 
                    onClick={() => onNavigate('admin')} 
                    style={{width: 'auto', marginBottom: 0}}
                >
                    Admin Panel
                </button>
            )}
            
            {/* Keep only this Sign Out button */}
            <button 
                className={`btn btn-danger ${styles.logoutButton}`} 
                onClick={handleLogout} 
                disabled={loading}
            >
                {loading ? '...' : 'Sign Out'}
            </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.horizontalGroup}>
              <div className={styles.infoBlock}>
                  <h4>Your Wallet</h4>
                  <p className={styles.walletBalance}>
                    {wallet ? formatCurrency(wallet.balance) : '...'}
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: 'auto' }}
                    onClick={() => setShowAddFunds(true)} 
                  >
                    Add Funds (Mock)
                  </button>
              </div>
              
              <div className={styles.infoBlock}>
                <h4>Your Profile</h4>
                 <p><strong>Name:</strong> {profile?.full_name || 'Not set'}</p>
                 <p><strong>Email:</strong> {session.user.email}</p>
                 <p><strong>Username:</strong> @{profile?.username}</p>
                 {/* Optional: Show role badge */}
                 {isAdmin && <span style={{background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>ADMIN</span>}
              </div>
            </div>
            
            <div className={styles.ctaSection}>
              <h4>Start a new Donation Drive</h4>
              <p>Ready to make a difference? Start your Bayanihan Drive today.</p>
              <button 
                className={`btn btn-primary ${styles.ctaButton}`}
                onClick={() => onNavigate('createCampaign')} 
              >
                Create New Campaign
              </button>
            </div>

            <div className={styles.tabs}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Campaigns
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'my' ? styles.active : ''}`}
                onClick={() => setActiveTab('my')}
              >
                My Campaigns
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'donations' ? styles.active : ''}`}
                onClick={() => setActiveTab('donations')}
              >
                My Donations
              </button>
            </div>

            <div>
              {activeTab === 'all' && <CampaignList onNavigate={onNavigate} />}
              {activeTab === 'my' && <MyCampaigns onNavigate={onNavigate} />}
              {activeTab === 'donations' && <MyDonations />}
            </div>
          </>
        )}
      </div> 
    </div>
  )
}