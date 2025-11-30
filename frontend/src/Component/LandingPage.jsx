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
          </div>

          {/* Neutral, non‑data visual block – safe for defense */}
          <div className={styles.heroRight}>
            <div className={styles.heroPreview}>
              <div className={styles.previewHeader}>
                <span className={styles.previewTag}>Platform overview</span>
                <span className={styles.previewBrand}>Bayanihan Hub</span>
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewRow}>
                  <span>Campaigns</span>
                  <span>Created and managed via Supabase + Spring Boot</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Wallet</span>
                  <span>Top‑ups, donations, and withdrawals with audit trail</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Transparency</span>
                  <span>Organizer updates, comments, and recent donors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Keep your existing features + footer (unchanged) */}
    </div>
  );
}
