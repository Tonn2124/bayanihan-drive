import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// We receive the session as a prop from App.js
export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // This function fetches data from our custom tables
    const fetchData = async () => {
      try {
        setLoading(true)
        const { user } = session
        
        // 1. Fetch Profile
        // We use the user's ID to find their profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single() // We expect only one row

        if (profileError) {
          throw profileError
        }
        setProfile(profileData)

        // 2. Fetch Wallet
        // We use the user's ID to find their wallet
        let { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single() // We expect only one row

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
  }, [session]) // Re-run this effect if the session changes

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    }
    setLoading(false) // The onAuthStateChange in App.js will handle the rest
  }

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // You can change this
    }).format(amount)
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <h2>Welcome!</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <p>Loading your information...</p>
      ) : (
        <>
          {/* Profile Info */}
          <h4>Your Profile</h4>
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Name:</strong> {profile?.full_name || 'Not set'}
          </p>
          
          <hr style={{ margin: '1.5rem 0' }} />

          {/* Wallet Info */}
          <h4>Your Wallet</h4>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)' }}>
            Balance: {wallet ? formatCurrency(wallet.balance) : '...'}
          </p>
          <button className="btn btn-primary" style={{ width: 'auto' }}>
            Add Funds (Mock)
          </button>
        </>
      )}

      <hr style={{ margin: '1.5rem 0' }} />

      <button className="btn btn-danger" onClick={handleLogout} disabled={loading}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}