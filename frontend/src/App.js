import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import styles from './App.module.css' // <-- Import styles

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard') 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setCurrentPage('dashboard') 
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      // Use CSS Module class instead of inline style
      <div className={styles.loadingContainer}>
        Loading Bayanihan Drive...
      </div>
    )
  }

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard session={session} onNavigate={setCurrentPage} />
    }
    if (currentPage === 'createCampaign') {
      return <CreateCampaign session={session} onNavigate={setCurrentPage} />
    }
    return <Dashboard session={session} onNavigate={setCurrentPage} />
  }

  return (
    <div className="container">
      {!session ? (
        <Auth />
      ) : (
        renderPage()
      )}
    </div>
  )
}

export default App