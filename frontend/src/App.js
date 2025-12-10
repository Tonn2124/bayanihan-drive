import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import CampaignDetails from './Component/CampaignDetails'
import AdminDashboard from './Component/AdminDashboard'
import LandingPage from './Component/LandingPage' 
import ProfileSettings from './Component/ProfileSettings'
import PublicProfile from './Component/PublicProfile/PublicProfile' // New Import
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
  
  // Auth Flow State
  const [authMode, setAuthMode] = useState('landing') 

  useEffect(() => {
    const initApp = async () => {
      // 1. Define how long you want to wait (e.g., 2000ms = 2 seconds)
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2500));
      
      // 2. Start fetching data
      const sessionDataPromise = supabase.auth.getSession();

      // 3. Wait for BOTH the timer and the data to finish
      // The formatting here grabs the result of the session data
      const [_, { data: { session } }] = await Promise.all([minLoadTime, sessionDataPromise]);

      // 4. Now we set the data and remove loading
      setSession(session)
      
      // Check URL for direct campaign links on load
      const params = new URLSearchParams(window.location.search);
      const urlCampaignId = params.get('campaignId');

      if (session && urlCampaignId) {
        setSelectedCampaignId(urlCampaignId);
        setSelectedCampaignData(null); 
        setCurrentPage('campaignDetails');
      }

      setLoading(false); // <--- This only happens after 2.5 seconds now
    };

    initApp();

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
    } else if (page === 'publicProfile') {
        setSelectedUserId(data);
        window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    } else {
      // Reset URL for other pages
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    }
  }

  if (loading) {
    return (
      <div className={styles.splashScreen}>
        {/* Make sure logo.png is in your PUBLIC folder, or import it if it's in src */}
        <img 
            src="/favicon.ico" 
            alt="Bayanihan Drive" 
            className={styles.splashLogo} 
            onError={(e) => e.target.style.display = 'none'} // Hides image if not found
        />
        <div className={styles.splashTitle}>Bayanihan Drive</div>
        
        {/* Optional: Facebook style footer */}
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
        
        {currentPage === 'publicProfile' && (
            <PublicProfile 
                userId={selectedUserId} 
                onNavigate={handleNavigate}
                onBack={() => handleNavigate('dashboard')}
            />
        )}

        {/* 3. Modal Layer (Overlays Dashboard) */}
        {currentPage === 'campaignDetails' && (
            <CampaignDetails 
              campaignId={selectedCampaignId} 
              campaignData={selectedCampaignData} // <--- PASSING THE DATA HERE
              onBack={() => handleNavigate('dashboard')} 
              onNavigate={handleNavigate} // Pass navigation handler
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
