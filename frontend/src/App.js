import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Component/Auth'
import Dashboard from './Component/Dashboard'
import CreateCampaign from './Component/CreateCampaign' 
import CampaignDetails from './Component/CampaignDetails' 
import styles from './App.module.css' 
import AdminDashboard from './Component/AdminDashboard';

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard') 
  const [selectedCampaignId, setSelectedCampaignId] = useState(null) 

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

  const renderPage = () => {
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

  return (
    <div className="container">
      {!session ? <Auth /> : renderPage()}
    </div>
  )
}

export default App