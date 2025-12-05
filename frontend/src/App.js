import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import CampaignDetails from './Component/CampaignDetails'
import AdminDashboard from './Component/AdminDashboard'
import LandingPage from './Component/LandingPage' 
import ProfileSettings from './Component/ProfileSettings'
import TermsAndConditions from './Component/TermsAndConditions'
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

      // Check URL for direct campaign links on load
      const params = new URLSearchParams(window.location.search);
      const urlCampaignId = params.get('campaignId');

      if (session && urlCampaignId) {
        setSelectedCampaignId(urlCampaignId);
        setCurrentPage('campaignDetails');
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setCurrentPage('dashboard') 
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigate = (page, campaignId = null) => {
    setCurrentPage(page)
    
    // Update Browser URL for sharing/refreshing
    if (page === 'campaignDetails' && campaignId) {
      setSelectedCampaignId(campaignId)
      const newUrl = `${window.location.pathname}?campaignId=${campaignId}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      // Reset URL for other pages
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
    return (
      <>
        {/* 1. Base Layer: Dashboard */}
        {/* Only show Dashboard if we are on 'dashboard' OR 'campaignDetails' (since that is a modal) */}
        {(currentPage === 'dashboard' || currentPage === 'campaignDetails') && (
            <Dashboard session={session} onNavigate={handleNavigate} />
        )}

        {/* 2. Full Page Layers (Replaces Dashboard) */}
        
        {currentPage === 'createCampaign' && (
            <CreateCampaign session={session} onNavigate={handleNavigate} />
        )}

        {currentPage === 'profileSettings' && (
            <ProfileSettings onBack={() => handleNavigate('dashboard')} />
        )}

        {currentPage === 'admin' && (
            <AdminDashboard onNavigate={handleNavigate} />
        )}

        {/* 3. Modal Layer (Overlays Dashboard) */}
        {currentPage === 'campaignDetails' && (
            <CampaignDetails 
              campaignId={selectedCampaignId} 
              onBack={() => handleNavigate('dashboard')} 
            />
        )}
      </>
    );
  }

  // --- LOGGED OUT VIEWS ---
  if (authMode === 'login') {
    return (
      <div className="container">
        <Auth 
          initialMode="login" 
          onBack={() => setAuthMode('landing')} 
          onTerms={() => setAuthMode('terms')}
        />
      </div>
    )
  }
  if (authMode === 'signup') {
    return (
      <div className="container">
        <Auth 
          initialMode="signup" 
          onBack={() => setAuthMode('landing')} 
          onTerms={() => setAuthMode('terms')}
        />
      </div>
    )
  }
  if (authMode === 'terms') {
    // Return to the previous state (or default to landing/login)
    // For simplicity, let's go back to 'login' or 'signup' if we tracked it, 
    // but here we can just go back to 'landing' or provide a way to go back to where they were.
    // However, usually "Back" from T&C goes to the previous screen.
    // Let's assume we want to go back to 'signup' as that's where T&C is most relevant, 
    // or just 'landing'. 
    // A simple approach is passing a "returnTo" prop, but for now let's just go back to landing 
    // or maybe the Auth component handles the state?
    // Actually, let's just set it to 'landing' for now, or 'login' as a safe default.
    return <TermsAndConditions onBack={() => setAuthMode('landing')} />
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