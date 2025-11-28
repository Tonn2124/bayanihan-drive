import React from 'react';
import styles from '../Style/LandingPage.module.css';

export default function LandingPage({ onLogin, onSignUp }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>Bayanihan Drive</div>
        <nav className={styles.navButtons}>
          <button className={styles.loginBtn} onClick={onLogin}>Log in</button>
          <button className={styles.ctaBtn} onClick={onSignUp}>Get Started</button>
        </nav>
      </header>

      <main className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Empowering Communities through <span>Bayanihan</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Join the movement. Create campaigns, donate securely, and track the impact of your generosity in real-time. Together, we can make a difference.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={onSignUp}>Start Fundraising</button>
            <button className={styles.secondaryBtn} onClick={onLogin}>Browse Campaigns</button>
          </div>
        </div>
      </main>

      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Launch Campaigns</h3>
            <p className={styles.featureDesc}>Create a donation drive in minutes with our easy-to-use wizard. Share your story and set your goals.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3 className={styles.featureTitle}>Secure Donations</h3>
            <p className={styles.featureDesc}>Donate with confidence using our secure wallet system. Your contributions go directly to the cause.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>Transparent Tracking</h3>
            <p className={styles.featureDesc}>See exactly where your money goes. Track withdrawals and updates from organizers in real-time.</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Bayanihan Drive. All rights reserved.
      </footer>
    </div>
  );
}