import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import CampaignDetails from './Component/CampaignDetails'
import AdminDashboard from './Component/AdminDashboard'
import LandingPage from './Component/LandingPage' 
import ProfileSettings from './Component/ProfileSettings'
import PublicProfile from './Component/PublicProfile/PublicProfile' 
import TermsAndConditions from './Component/TermsAndConditions'
import styles from './App.module.css' 

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Navigation States
  const [currentPage, setCurrentPage] = useState('dashboard') 
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [selectedCampaignData, setSelectedCampaignData] = useState(null)
  
  // New state for public profile
  const [selectedUserId, setSelectedUserId] = useState(null);
  // ADDED: Track where we came from so "Back" works in the profile modal
  const [previousCampaignId, setPreviousCampaignId] = useState(null);
  
  // Auth Flow State
  const [authMode, setAuthMode] = useState('landing') 

  useEffect(() => {
    const initApp = async () => {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2500));
      const sessionDataPromise = supabase.auth.getSession();
      const [_, { data: { session } }] = await Promise.all([minLoadTime, sessionDataPromise]);

      setSession(session)
      
      const params = new URLSearchParams(window.location.search);
      const urlCampaignId = params.get('campaignId');

      if (session && urlCampaignId) {
        setSelectedCampaignId(urlCampaignId);
        setSelectedCampaignData(null); 
        setCurrentPage('campaignDetails');
      }

      setLoading(false); 
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setCurrentPage('dashboard') 
    })

    return () => subscription.unsubscribe()
  }, [])

  // MODIFIED: Accepts optional 3rd argument, and handles history tracking
  const handleNavigate = (page, data = null, extraData = null) => {
    
    // --- 1. HISTORY TRACKING LOGIC ---
    // If we are going TO PublicProfile FROM CampaignDetails, save the ID.
    if (page === 'publicProfile' && currentPage === 'campaignDetails') {
        // Use the explicit 3rd arg if provided, otherwise use current state
        setPreviousCampaignId(extraData || selectedCampaignId);
    } 
    // If we are going anywhere else (except back to the same profile), clear history
    else if (page !== 'publicProfile') {
        setPreviousCampaignId(null);
    }

    // --- 2. NAVIGATION LOGIC ---
    setCurrentPage(page)
    
    if (page === 'campaignDetails' && data) {
      if (typeof data === 'object' && data.id) {
        setSelectedCampaignId(data.id);
        setSelectedCampaignData(data); 
        const newUrl = `${window.location.pathname}?campaignId=${data.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

      } else {
        setSelectedCampaignId(data);
        setSelectedCampaignData(null); 
        const newUrl = `${window.location.pathname}?campaignId=${data}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } else if (page === 'publicProfile') {
        setSelectedUserId(data);
        // Don't change URL for profile modal to keep it clean, or allow back button to close it
        window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    } else {
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    }
  }

  if (loading) {
    return (
      <div className={styles.splashScreen}>
        <img 
            src="/favicon.ico" 
            alt="Bayanihan Drive" 
            className={styles.splashLogo} 
            onError={(e) => e.target.style.display = 'none'} 
        />
        <div className={styles.splashTitle}>Bayanihan Drive</div>
        <div className={styles.splashFooter}>
            <span style={{display: 'block', fontSize: '10px'}}>from</span>
            <span style={{fontWeight: '600', letterSpacing: '1px'}}>STUDENT DEV</span>
        </div>
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

        {/* 2. Full Page Layers */}
        {currentPage === 'createCampaign' && (
            <CreateCampaign session={session} onNavigate={handleNavigate} />
        )}

        {currentPage === 'profileSettings' && (
            <ProfileSettings onBack={() => handleNavigate('dashboard')} />
        )}

        {currentPage === 'admin' && (
            <AdminDashboard onNavigate={handleNavigate} />
        )}
        
        {/* MODIFIED: Passed 'onClose' and 'fromCampaignId' to fix error */}
        {currentPage === 'publicProfile' && (
            <PublicProfile 
                userId={selectedUserId} 
                onNavigate={handleNavigate}
                // FIX 1: Pass onClose to handle the "X" button
                onClose={() => handleNavigate('dashboard')} 
                // FIX 2: Pass the history ID so the back arrow works
                fromCampaignId={previousCampaignId}
            />
        )}

        {/* 3. Modal Layer */}
        {currentPage === 'campaignDetails' && (
            <CampaignDetails 
              campaignId={selectedCampaignId} 
              campaignData={selectedCampaignData} 
              onBack={() => handleNavigate('dashboard')} 
              onNavigate={handleNavigate} 
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

  return (
    <LandingPage 
      onLogin={() => setAuthMode('login')} 
      onSignUp={() => setAuthMode('signup')} 
    />
  )
}

export default App