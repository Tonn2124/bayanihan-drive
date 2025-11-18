import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../Style/Auth.module.css' // <-- 1. Import the CSS module

// Eye Icons (as inline SVG)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
)
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
)

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  
  // Form States
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const clearMessages = () => {
    setError(null)
    setMessage(null)
  }

  const isValidPhone = (num) => {
    const phPhoneRegex = /^09\d{9}$/
    return phPhoneRegex.test(num)
  }

  const handleAuth = async (event) => {
    event.preventDefault()
    clearMessages()

    if (isLogin) {
      // --- LOGIN LOGIC (Email Only) ---
      if (!email || !password) {
        setError('Please enter your email and password.')
        return
      }

      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) setError(error.message)
      setLoading(false)

    } else {
      // --- SIGN UP LOGIC ---
      if (!email || !password || !fullName || !phone || !username || !confirmPassword) {
        setError('All fields are required.')
        return
      }
      if (!isValidPhone(phone)) {
        setError('Phone number must start with 09 and be 11 digits long.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            phone: phone,
            avatar_url: '', 
          },
        },
      })
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Sign up successful! Please check your email to confirm your account.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setPhone('')
        setFullName('')
        setUsername('')
      }
      setLoading(false)
    }
  }

  return (
    <div className={`card ${styles.authCard}`}>
      <h2 className={styles.authTitle}>Bayanihan Drive</h2>
      <p className={styles.authSubtitle}>
        {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleAuth}>
        
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className="form-control"
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className="form-control"
                type="text"
                placeholder="Your unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                className="form-control"
                type="text"
                placeholder="09xxxxxxxxx"
                value={phone}
                maxLength={11}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setPhone(val)
                }}
              />
              {phone && !isValidPhone(phone) && (
                <div className={styles.validationError}>Must start with 09 (11 digits)</div>
              )}
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="form-control"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              className={`form-control ${styles.passwordInput}`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              className={styles.passwordToggleIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.passwordWrapper}>
                <input
                    id="confirmPassword"
                    className={`form-control ${styles.passwordInput}`}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className={styles.passwordToggleIcon}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
                <div className={styles.validationError}>Passwords do not match</div>
            )}
          </div>
        )}

        <button className="btn btn-primary" disabled={loading} type="submit" style={{marginTop: '1rem'}}>
          {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>

        <button
          className="btn btn-secondary"
          disabled={loading}
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            clearMessages()
            setEmail('')
            setPassword('')
            setConfirmPassword('')
          }}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
        </button>
      </form>
    </div>
  )
}