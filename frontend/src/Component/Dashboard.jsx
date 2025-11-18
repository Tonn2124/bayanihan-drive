import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../Style/Dashboard.module.css' // <-- Import CSS Module

export default function Dashboard({ session, onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { user } = session
        
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username') 
          .eq('id', user.id)
          .single() 

        if (profileError) {
          throw profileError
        }
        setProfile(profileData)

        let { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single() 

        if (walletError) {
          throw walletError
        }
        setWallet(walletData)

      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session]) 

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { 
      style: 'currency',
      currency: 'PHP', 
    }).format(amount)
  }

  return (
    <div className={`card ${styles.dashboardCard}`}>
      <div className={styles.header}>
        <h2 className={styles.welcomeTitle}>Welcome, {profile?.username || 'User'}!</h2>
        <button className={`btn btn-danger ${styles.logoutButton}`} onClick={handleLogout} disabled={loading}>
          {loading ? '...' : 'Sign Out'}
        </button>
      </div>

      {/* No HR here anymore */}

      <div className={styles.contentArea}> {/* <-- ADD THIS WRAPPER DIV */}
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.horizontalGroup}>
              {/* ... Wallet and Profile blocks same as before ... */}
              <div className={styles.infoBlock}>
                  <h4>Your Wallet</h4>
                  <p className={styles.walletBalance}>
                    {wallet ? formatCurrency(wallet.balance) : '...'}
                  </p>
                  <button className="btn btn-primary" style={{ width: 'auto' }}>
                    Add Funds (Mock)
                  </button>
              </div>

              <div className={styles.infoBlock}>
                <h4>Your Profile</h4>
                 {/* ... profile details ... */}
                 <p><strong>Name:</strong> {profile?.full_name || 'Not set'}</p>
                 <p><strong>Email:</strong> {session.user.email}</p>
                 <p><strong>Username:</strong> @{profile?.username}</p>
              </div>
            </div>
            
            <div className={styles.ctaSection}>
              {/* ... CTA content same as before ... */}
              <h4>Start a new Donation Drive</h4>
              <p>Ready to make a difference? Start your Bayanihan Drive today.</p>
              <button 
                className={`btn btn-primary ${styles.ctaButton}`}
                onClick={() => onNavigate('createCampaign')} 
              >
                Create New Campaign
              </button>
            </div>
          </>
        )}
      </div> {/* <-- END WRAPPER DIV */}
    </div>
  )
}