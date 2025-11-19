import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../Style/Auth.module.css'

// Eye Icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
)
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
)

// Email Icon
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
)

// User Icon
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
)

// Phone Icon
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)

// Lock Icon
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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
    <div className={styles.authContainer}>
      {/* Left Panel - Branding */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoCircle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <h1 className={styles.brandTitle}>Bayanihan Drive</h1>
          </div>
          <p className={styles.brandTagline}>
            Join our community of giving and make a difference in the Philippines
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3>Secure & Trusted</h3>
                <p>Your donations are safe with us</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3>100% Transparent</h3>
                <p>Track where your money goes</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3>Community Driven</h3>
                <p>Help Filipinos help Filipinos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          {/* Tab Switcher */}
          <div className={styles.tabSwitcher}>
            <button
              type="button"
              className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
              onClick={() => {
                setIsLogin(true)
                clearMessages()
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
              onClick={() => {
                setIsLogin(false)
                clearMessages()
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Welcome Message */}
          <div className={styles.welcomeSection}>
            <h2 className={styles.formTitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className={styles.formSubtitle}>
              {isLogin 
                ? 'Sign in to continue your generosity journey' 
                : 'Join thousands of Filipinos making a difference'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className={styles.alertDanger}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className={styles.alertSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className={styles.form}>
            {!isLogin && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="fullName" className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <UserIcon />
                    <input
                      id="fullName"
                      className={styles.input}
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="username" className={styles.label}>
                    Username <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <UserIcon />
                    <input
                      id="username"
                      className={styles.input}
                      type="text"
                      placeholder="juandelacruz"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <PhoneIcon />
                    <input
                      id="phone"
                      className={styles.input}
                      type="text"
                      placeholder="09xxxxxxxxx"
                      value={phone}
                      maxLength={11}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setPhone(val)
                      }}
                    />
                  </div>
                  {phone && !isValidPhone(phone) && (
                    <span className={styles.validationError}>
                      Must start with 09 (11 digits)
                    </span>
                  )}
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <EmailIcon />
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <LockIcon />
                <input
                  id="password"
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <LockIcon />
                  <input
                    id="confirmPassword"
                    className={styles.input}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    className={styles.eyeToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className={styles.validationError}>
                    Passwords do not match
                  </span>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.formFooter}>
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setIsLogin(!isLogin)
                  clearMessages()
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                }}
              >
                {isLogin ? 'Sign up for free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
