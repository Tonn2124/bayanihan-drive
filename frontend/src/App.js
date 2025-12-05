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
  // NEW: State to hold the full campaign object (for instant loading)
  const [selectedCampaignData, setSelectedCampaignData] = useState(null)
  
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
        // If loading from URL, we don't have the data yet, so it must fetch
        setSelectedCampaignData(null); 
        setCurrentPage('campaignDetails');
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setCurrentPage('dashboard') 
    })

    return () => subscription.unsubscribe()
  }, [])

  // MODIFIED: handleNavigate now accepts an object OR an ID
  const handleNavigate = (page, data = null) => {
    setCurrentPage(page)
    
    if (page === 'campaignDetails' && data) {
      // Check if 'data' is the full object (has an id property)
      if (typeof data === 'object' && data.id) {
        setSelectedCampaignId(data.id);
        setSelectedCampaignData(data); // SAVE THE DATA!
        
        // Update URL
        const newUrl = `${window.location.pathname}?campaignId=${data.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

      } else {
        // Fallback: 'data' is just an ID (string/number)
        setSelectedCampaignId(data);
        setSelectedCampaignData(null); // Clear data so it fetches fresh
        
        // Update URL
        const newUrl = `${window.location.pathname}?campaignId=${data}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
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
              campaignData={selectedCampaignData} // <--- PASSING THE DATA HERE
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