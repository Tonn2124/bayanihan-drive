// src/Component/landingpage.jsx
import React from "react";
import styles from "../Style/LandingPage.module.css";

export default function LandingPage({ onLogin, onSignUp }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>Bayanihan Drive</div>
          <nav className={styles.navButtons}>
            <button className={styles.loginBtn} onClick={onLogin}>
              Log in
            </button>
            <button className={styles.ctaBtn} onClick={onSignUp}>
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <main className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              Empowering Communities
              <br />
              through <span>Bayanihan</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Create verified donation drives, donate securely, and track every
              peso with transparent withdrawals and updates.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primaryBtn} onClick={onSignUp}>
                Start Fundraising
              </button>
              <button className={styles.secondaryBtn} onClick={onLogin}>
                Browse Campaigns
              </button>
            </div>
            
            <div className={styles.statsRow}>
                <div className={styles.statItem}>
                    <strong>Verified</strong>
                    <span>Campaigns</span>
                </div>
                <div className={styles.statItem}>
                    <strong>Secure</strong>
                    <span>Payments</span>
                </div>
                <div className={styles.statItem}>
                    <strong>Transparent</strong>
                    <span>Tracking</span>
                </div>
            </div>
          </div>

          <div className={styles.heroRight}>
             {/* Using a nice abstract shape or illustration if available, else a CSS card */}
             <div className={styles.heroImagePlaceholder}>
                 <div className={styles.floatingCard1}>
                    <span>❤️ Donation Received</span>
                    <strong>₱ 1,000.00</strong>
                 </div>
                 <div className={styles.floatingCard2}>
                    <span>🚀 Campaign Goal Met</span>
                    <strong>100%</strong>
                 </div>
             </div>
          </div>
        </div>
      </main>
      
      <footer className={styles.footer}>
         <p>© 2025 Bayanihan Drive. All rights reserved.</p>
      </footer>
    </div>
  );
}
