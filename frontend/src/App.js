import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import CampaignDetails from './Component/CampaignDetails'
import AdminDashboard from './Component/AdminDashboard'
import LandingPage from './Component/LandingPage' 
import ProfileSettings from './Component/ProfileSettings'
import styles from './App.module.css' 

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Navigation States
  const [currentPage, setCurrentPage] = useState('dashboard') 
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  
  // Auth Flow State
  const [authMode, setAuthMode] = useState('landing') 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)

      // 2. CRITICAL FIX: Check the URL immediately when the app loads
      // This allows "New Tab" or "Refresh" to remember the specific campaign
      const params = new URLSearchParams(window.location.search);
      const urlCampaignId = params.get('campaignId');

      if (session && urlCampaignId) {
        setSelectedCampaignId(urlCampaignId);
        setCurrentPage('campaignDetails');
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Only reset to dashboard if we are logging OUT. 
      // If we are just refreshing, the logic above handles the redirection.
      if (!session) setCurrentPage('dashboard') 
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigate = (page, campaignId = null) => {
    setCurrentPage(page)
    
    // 3. CRITICAL FIX: Update the Browser URL Bar when clicking
    if (page === 'campaignDetails' && campaignId) {
      setSelectedCampaignId(campaignId)
      // Change URL to: http://localhost:3000/?campaignId=123
      // This ensures if they hit Refresh, it stays on this page
      const newUrl = `${window.location.pathname}?campaignId=${campaignId}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      // Clear the ID if going back to dashboard
      // Change URL back to: http://localhost:3000/
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  // --- LOGGED IN VIEWS ---
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
    if (currentPage === 'profileSettings') {
      return <ProfileSettings onBack={() => handleNavigate('dashboard')} />
    }
    if (currentPage === 'admin') {
        return <AdminDashboard onNavigate={handleNavigate} />
    }
    // Fallback
    return <Dashboard session={session} onNavigate={handleNavigate} />
  }

  // --- LOGGED OUT VIEWS ---
  if (authMode === 'login') {
    return <div className="container"><Auth initialMode="login" onBack={() => setAuthMode('landing')} /></div>
  }
  if (authMode === 'signup') {
    return <div className="container"><Auth initialMode="signup" onBack={() => setAuthMode('landing')} /></div>
  }

  // Default: Landing Page
  return (
    <LandingPage 
      onLogin={() => setAuthMode('login')} 
      onSignUp={() => setAuthMode('signup')} 
    />
  )
}

export default App