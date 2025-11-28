import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import CampaignDetails from './Component/CampaignDetails'
import AdminDashboard from './Component/AdminDashboard'
import LandingPage from './Component/LandingPage' 
import styles from './App.module.css' 

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Navigation States
  const [currentPage, setCurrentPage] = useState('dashboard') 
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  
  // Auth Flow State: 'landing', 'login', 'signup'
  const [authMode, setAuthMode] = useState('landing') 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setCurrentPage('dashboard') 
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigate = (page, campaignId = null) => {
    setCurrentPage(page)
    if (campaignId) setSelectedCampaignId(campaignId)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        Loading Bayanihan Drive...
      </div>
    )
  }

  // If logged in, show the main app pages
  if (session) {
    if (currentPage === 'dashboard') {
      return <Dashboard session={session} onNavigate={handleNavigate} />
    }
    if (currentPage === 'createCampaign') {
      return <CreateCampaign session={session} onNavigate={handleNavigate} />
    }
    if (currentPage === 'campaignDetails') {
      return (
        <CampaignDetails 
          campaignId={selectedCampaignId} 
          onBack={() => handleNavigate('dashboard')} 
        />
      )
    }
    if (currentPage === 'admin') {
        return <AdminDashboard onNavigate={handleNavigate} />
    }
    return <Dashboard session={session} onNavigate={handleNavigate} />
  }

  // If NOT logged in, manage Landing/Auth flow
  if (authMode === 'login') {
    return <div className="container"><Auth initialMode="login" onBack={() => setAuthMode('landing')} /></div>
  }
  if (authMode === 'signup') {
    return <div className="container"><Auth initialMode="signup" onBack={() => setAuthMode('landing')} /></div>
  }

  // Default: Show Landing Page
  return (
    <LandingPage 
      onLogin={() => setAuthMode('login')} 
      onSignUp={() => setAuthMode('signup')} 
    />
  )
}

export default App