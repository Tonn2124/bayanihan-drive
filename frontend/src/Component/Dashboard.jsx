import { useState, useEffect, useCallback } from 'react' // <-- Import useCallback
import { supabase } from '../supabaseClient'
import styles from '../Style/Dashboard.module.css'
import CampaignList from './CampaignList'
import AddFundsModal from './AddFundsModal' // <-- 1. Import Modal

export default function Dashboard({ session, onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState(null)
  const [showAddFunds, setShowAddFunds] = useState(false) // <-- 2. Modal State

  // 3. Wrap fetch logic in useCallback so we can re-call it easily
  const fetchData = useCallback(async () => {
      try {
        // Keep loading true only on first load, optional logic
        const { user } = session
        
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username') 
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

  return (
    <div className={`card ${styles.dashboardCard}`}>
      {/* 4. Render Modal if state is true */}
      {showAddFunds && (
        <AddFundsModal 
          onClose={() => setShowAddFunds(false)} 
          onSuccess={() => {
            fetchData() // Refresh wallet balance after adding funds
            alert("Funds added successfully!")
          }} 
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.welcomeTitle}>Welcome, {profile?.username || 'User'}!</h2>
        <button className={`btn btn-danger ${styles.logoutButton}`} onClick={handleLogout} disabled={loading}>
          {loading ? '...' : 'Sign Out'}
        </button>
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
                    onClick={() => setShowAddFunds(true)} // <-- 5. Open Modal
                  >
                    Add Funds (Mock)
                  </button>
              </div>
              
              {/* ... rest of component ... */}
              <div className={styles.infoBlock}>
                <h4>Your Profile</h4>
                 <p><strong>Name:</strong> {profile?.full_name || 'Not set'}</p>
                 <p><strong>Email:</strong> {session.user.email}</p>
                 <p><strong>Username:</strong> @{profile?.username}</p>
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

            <div style={{marginTop: '4rem'}}>
              <CampaignList />
            </div>
          </>
        )}
      </div> 
    </div>
  )
}