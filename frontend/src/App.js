import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient' // We created this in the last step
import Auth from './Component/Auth' 
import Dashboard from './Component/Dashboard' 

function App() {
  // This state will hold the user's session information if they are logged in
  const [session, setSession] = useState(null)
  // This state tracks if the initial session check is complete
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Try to get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false) // Finished initial check
    })

    // 2. Listen for changes in authentication state (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // 3. Clean up the listener when the component unmounts
    return () => subscription.unsubscribe()
  }, [])

  // Show a loading message while we check for a session
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        Loading...
      </div>
    )
  }

  return (
    <div className="container">
      {!session ? (
        // If there is no session, show the Auth (Login/Signup) component
        <Auth />
      ) : (
        // If there IS a session, show the user's Dashboard
        // We pass the session as a prop
        <Dashboard key={session.user.id} session={session} />
      )}
    </div>
  )
}

export default App