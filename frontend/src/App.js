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
  
  // Track where we came from for Public Profile back button
  const [previousCampaignId, setPreviousCampaignId] = useState(null);

  // --- NEW: View Context (Keeps track if we are in 'dashboard' or 'admin' mode) ---
  const [viewContext, setViewContext] = useState('dashboard'); 
  
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

  // MODIFIED: Handles Context Switching
  const handleNavigate = (page, data = null, extraData = null) => {
    
    // --- 1. CONTEXT LOGIC ---
    // If going to Admin, switch context
    if (page === 'admin') {
        setViewContext('admin');
    } 
    // If explicitly going to Dashboard, switch context
    else if (page === 'dashboard') {
        setViewContext('dashboard');
    }
    // If we are opening details FROM Admin (passed via extraData), ensure context stays Admin
    else if (page === 'campaignDetails' && extraData === 'ADMIN') {
        setViewContext('admin');
    }

    // --- 2. HISTORY TRACKING LOGIC ---
    if (page === 'publicProfile' && currentPage === 'campaignDetails') {
        setPreviousCampaignId(extraData || selectedCampaignId);
    } 
    else if (page !== 'publicProfile') {
        setPreviousCampaignId(null);
    }

    // --- 3. STANDARD NAVIGATION ---
    setCurrentPage(page)
    
    if (page === 'campaignDetails' && data) {
      if (typeof data === 'object' && data.id) {
        setSelectedCampaignId(data.id);
        setSelectedCampaignData(data); 
        
        // Only update URL if we are in normal dashboard mode (keep Admin URLs clean)
        if (viewContext !== 'admin') {
            const newUrl = `${window.location.pathname}?campaignId=${data.id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }

      } else {
        setSelectedCampaignId(data);
        setSelectedCampaignData(null); 
        
        if (viewContext !== 'admin') {
            const newUrl = `${window.location.pathname}?campaignId=${data}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
      }
    } else if (page === 'publicProfile') {
        setSelectedUserId(data);
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
        {/* 1. BASE LAYER: DASHBOARD 
            Only render if we are in 'dashboard' context
        */}
        {viewContext === 'dashboard' && (currentPage === 'dashboard' || currentPage === 'campaignDetails') && (
            <Dashboard session={session} onNavigate={handleNavigate} />
        )}

        {/* 2. BASE LAYER: ADMIN
            Render if currentPage is admin OR if we are viewing details while in admin context
        */}
        {(currentPage === 'admin' || (currentPage === 'campaignDetails' && viewContext === 'admin')) && (
            <AdminDashboard onNavigate={handleNavigate} />
        )}

        {/* 3. Full Page Layers */}
        {currentPage === 'createCampaign' && (
            <CreateCampaign session={session} onNavigate={handleNavigate} />
        )}

        {currentPage === 'profileSettings' && (
            <ProfileSettings onBack={() => handleNavigate('dashboard')} />
        )}
        
        {currentPage === 'publicProfile' && (
            <PublicProfile 
                userId={selectedUserId} 
                onNavigate={handleNavigate}
                // Smart Close: Return to the correct context (Admin or Dashboard)
                onClose={() => handleNavigate(viewContext === 'admin' ? 'admin' : 'dashboard')} 
                fromCampaignId={previousCampaignId}
            />
        )}

        {/* 4. Modal Layer */}
        {currentPage === 'campaignDetails' && (
            <CampaignDetails 
              campaignId={selectedCampaignId} 
              campaignData={selectedCampaignData} 
              // Smart Back: Return to the correct context
              onBack={() => handleNavigate(viewContext === 'admin' ? 'admin' : 'dashboard')} 
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