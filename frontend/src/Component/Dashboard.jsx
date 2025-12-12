import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import styles from "../Style/Dashboard.module.css";

// Components
import CampaignList from "./CampaignList";
import AddFundsModal from "./AddFundsModal";
import ProfileSettings from "./ProfileSettings";
import ProfileDetails from "./ProfileDetails";
import PublicProfile from "./PublicProfile/PublicProfile";
import FAQs from "./FAQs";
import MyCampaigns from "./MyCampaigns";
import MyDonations from "./MyDonations";

export default function Dashboard({ session, onNavigate }) {
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("Welcome");

  // Navigation
  const [activeTab, setActiveTab] = useState("all");

  // Modals
  const [viewPublicProfileId, setViewPublicProfileId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }, []);

  const refreshProfile = async () => {
    const { user } = session;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  };

  const fetchData = useCallback(async () => {
    try {
      setProfileLoading(true);
      setError(null);
      const { user } = session;
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);
      const { data: walletData } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single();
      setWallet(walletData || { balance: 0 });
    } catch (err) { console.error(err); } finally { setProfileLoading(false); }
  }, [session]);

  useEffect(() => {
    fetchData();
    const key = 'last_login_' + session.user.id;
    if (localStorage.getItem(key)) { setGreeting("Welcome back"); }
    else { localStorage.setItem(key, new Date().toISOString()); setGreeting("Welcome"); }
  }, [fetchData, session.user.id]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount || 0);
  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  const handleDashboardNavigate = (destination, id) => {
    if (destination === 'publicProfile') setViewPublicProfileId(id);
    else if (destination === 'my') { setActiveTab('my'); setShowProfileModal(false); }
    else if (destination === 'donations') { setActiveTab('donations'); setShowProfileModal(false); }
    else if (onNavigate) onNavigate(destination, id);
  };

  return (
    <div className={styles.dashboardRoot}>
      {/* LEFT SIDEBAR */}
      <aside className={styles.leftSidebar}>
        <div className={styles.brandArea} onClick={() => setActiveTab("all")} style={{ cursor: 'pointer' }}>
          <div className={styles.brandName}>Bayanihan Drive</div>
        </div>

        {/* COMPACT WALLET */}
        <div className={styles.walletCard}>
          <div className={styles.walletHeader}>
            <span className={styles.walletLabel}>My Balance</span>
            <div className={styles.walletAmount}>
              {profileLoading ? '...' : formatCurrency(wallet?.balance)}
            </div>
          </div>
          <button className={styles.walletBtnPrimary} onClick={() => setShowAddFunds(true)}>
            + Add Funds
          </button>
        </div>

        <div className={styles.separator}></div>

        <div className={styles.categoryTitle}>Menu</div>
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === "all" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("all")}>
            <span className={styles.navIcon}>🏠</span> Home Feed
          </button>
        </nav>

        <div className={styles.separator}></div>

        <div className={styles.categoryTitle}>Account</div>
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === "settings" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("settings")}>
            <span className={styles.navIcon}>⚙️</span> Settings
          </button>
          <button className={`${styles.navItem} ${activeTab === "faqs" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("faqs")}>
             <span className={styles.navIcon}>❓</span> FAQs
          </button>
          {isAdmin && (
            <button className={`${styles.navItem} ${styles.adminItem}`} onClick={() => onNavigate("admin")}>
              <span className={styles.navIcon}>🛡️</span> Admin Panel
            </button>
          )}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </aside>

      {/* CENTER PANEL */}
      <main className={styles.centerPanel}>
        {activeTab === 'settings' ? (
            <ProfileSettings
                profileData={profile} 
                onBack={() => { refreshProfile(); setActiveTab('all'); }} 
            />
        ) : activeTab === 'faqs' ? (
            <FAQs />
        ) : (
            <>
                <header className={styles.centerHeader}>
                  <div className={styles.headerTitle}>
                    <h2>{activeTab === 'all' ? 'News Feed' : activeTab === 'my' ? 'My Projects' : 'Donation History'}</h2>
                    <p style={{ textTransform: 'capitalize' }}>
                      {greeting}, {profileLoading ? '...' : (profile?.full_name?.split(' ')[0] || 'User')}
                    </p>
                  </div>
                  <div className={styles.headerActions}>
                    <button className={styles.createBtn} onClick={() => onNavigate("createCampaign")}>+ Create</button>
                    <div className={styles.headerProfile} onClick={() => setShowProfileModal(true)}>
                      {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Me" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                      ) : (
                          profile?.full_name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                  </div>
                </header>

                <div className={styles.scrollableContent}>
                  {error ? <div className="alert alert-danger">{error}</div> : (
                    <>
                      {activeTab === "all" && <CampaignList onNavigate={handleDashboardNavigate} />}
                      {activeTab === "my" && <MyCampaigns onNavigate={handleDashboardNavigate} />}
                      {activeTab === "donations" && <MyDonations onNavigate={handleDashboardNavigate} />}
                    </>
                  )}
                </div>
            </>
        )}
      </main>

      {/* MODALS */}
      {viewPublicProfileId && <PublicProfile userId={viewPublicProfileId} onClose={() => setViewPublicProfileId(null)} onNavigate={handleDashboardNavigate} />}
      {showProfileModal && <ProfileDetails profile={profile} onClose={() => setShowProfileModal(false)} onNavigate={handleDashboardNavigate} onEdit={() => { setShowProfileModal(false); setActiveTab('settings'); }} />}
      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} onSuccess={fetchData} />}
    </div>
  );
}