import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from '../Style/Auth.module.css'

// --- CONSTANTS ---
const MAX_FULLNAME_LENGTH = 50;
const MAX_USERNAME_LENGTH = 20;

const ALLOWED_DOMAINS = [
  "@gmail.com",
  "@yahoo.com",
  "@hotmail.com",
  "@outlook.com",
  "@icloud.com"
];

// --- ICONS ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
)
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
)
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.logoIcon}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
)

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  
  // Form States
  const [emailUser, setEmailUser] = useState('')
  const [emailDomain, setEmailDomain] = useState(ALLOWED_DOMAINS[0])
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const clearMessages = () => {
    setError(null)
    setMessage(null)
  }

  // --- STRONG PASSWORD CHECKER ---
  const validatePassword = (pwd) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(pwd);
  }

  const checkUsernameTaken = async (usernameToCheck) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck)
      
      if (error) return false; 
      return data && data.length > 0;
    } catch (err) {
      return false;
    }
  }

  const handleAuth = async (event) => {
    event.preventDefault()
    clearMessages()

    const fullEmail = `${emailUser}${emailDomain}`

    if (isLogin) {
      if (!emailUser || !password) {
        setError('Please enter email & password.')
        return
      }
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ 
        email: fullEmail, 
        password 
      })
      if (error) setError(error.message)
      setLoading(false)

    } else {
      // SIGN UP VALIDATION
      if (!emailUser || !password || !fullName || !username || !confirmPassword) {
        setError('All fields are required.')
        return
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      if (!validatePassword(password)) {
        setError('Password must be 8+ chars, with 1 uppercase, 1 number, & 1 symbol.')
        return
      }

      if (fullName.length > MAX_FULLNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
        setError('Character limit exceeded.')
        return
      }

      setLoading(true)

      const isTaken = await checkUsernameTaken(username);
      if (isTaken) {
        setError('Username is already taken.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email: fullEmail, 
        password,
        options: { 
          data: { full_name: fullName, username: username, avatar_url: '' } 
        },
      })

      if (error) {
        if (error.message.includes('registered') || error.message.includes('already exists')) {
            setError('This email address is already registered. Please Log In instead.')
        } else {
            setError(error.message)
        }
      } else {
        setMessage('Sign up success! Please check your email to verify.')
        
        // --- NEW: SET FLAG FOR FIRST LOGIN ---
        // We save this in browser storage so the Dashboard knows this is a fresh account
        localStorage.setItem('isNewUser', 'true');

        // Clear Fields
        setEmailUser('')
        setPassword('')
        setConfirmPassword('')
        setFullName('')
        setUsername('')
        setEmailDomain(ALLOWED_DOMAINS[0])
        
        setIsLogin(true) 
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgCircle1}></div>
      <div className={styles.bgCircle2}></div>

      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <HeartIcon />
          </div>
          <h1 className={styles.title}>Bayanihan Drive</h1>
          <p className={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Join the community'}
          </p>
        </div>

        <div className={styles.toggleContainer}>
          <button 
            type="button"
            className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
            onClick={() => { 
                setIsLogin(true); 
                clearMessages(); 
                setEmailUser(''); setPassword('');
            }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
            onClick={() => { 
                setIsLogin(false); 
                clearMessages();
                setEmailUser(''); setPassword('');
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {message && <div className={styles.alertSuccess}>{message}</div>}

        <form onSubmit={handleAuth} className={styles.form}>
          
          {!isLogin && (
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <input 
                  className={styles.input} 
                  type="text" 
                  placeholder="Full Name" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  maxLength={MAX_FULLNAME_LENGTH} 
                  required
                />
                {fullName.length >= MAX_FULLNAME_LENGTH && (
                  <span className={styles.limitWarning}>Max limit reached</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input 
                  className={styles.input} 
                  type="text" 
                  placeholder="Username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  maxLength={MAX_USERNAME_LENGTH}
                  required
                />
                {username.length >= MAX_USERNAME_LENGTH && (
                  <span className={styles.limitWarning}>Max limit reached</span>
                )}
              </div>
            </div>
          )}

          <div className={styles.emailContainer}>
            <input 
              className={`${styles.input} ${styles.emailUser}`} 
              type="text" 
              placeholder="Email username" 
              value={emailUser} 
              onChange={e => setEmailUser(e.target.value)} 
              required
            />
            <select 
              className={`${styles.input} ${styles.emailDomain}`}
              value={emailDomain}
              onChange={e => setEmailDomain(e.target.value)}
            >
              {ALLOWED_DOMAINS.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input 
                className={styles.input} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
              </button>
            </div>
            
            {!isLogin && (
                <p className={styles.passwordHint}>
                  Must contain 8+ chars, 1 Uppercase, 1 Number, 1 Symbol.
                </p>
            )}
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <div className={styles.passwordWrapper}>
                <input 
                  className={styles.input} 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.loader}></span> : (isLogin ? 'Log In' : 'Create Account')}
          </button>

        </form>

        <div className={styles.footer}>
          <p>By continuing, you agree to our <span>Terms</span>.</p>
        </div>
      </div>
    </div>
  )
}