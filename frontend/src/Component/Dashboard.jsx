import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import styles from "../Style/Dashboard.module.css"; 
import CampaignList from "./CampaignList";
import AddFundsModal from "./AddFundsModal";
// Removed WithdrawalModal import
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
  
  // Initialize greeting based on localStorage
  const [greeting, setGreeting] = useState(() => {
    const key = 'last_login_' + session?.user?.id;
    return localStorage.getItem(key) ? "Welcome back" : "Welcome";
  });
  
  // State to track which Public Profile to show (Modal)
  const [viewPublicProfileId, setViewPublicProfileId] = useState(null);

  const [showAddFunds, setShowAddFunds] = useState(false);
  // Removed showWithdrawal state
  
  // Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState("all");

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

    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  }, [session]); 

  useEffect(() => {
    fetchData();
    const key = 'last_login_' + session.user.id;
    
    // Logic for "Welcome" vs "Welcome Back"
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, new Date().toISOString());
    }
  }, [fetchData, session.user.id]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount || 0);

  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  // Navigation Wrapper
  const handleDashboardNavigate = (destination, id) => {
    if (destination === 'publicProfile') {
      setViewPublicProfileId(id); // Open the Modal
    } else {
      if (onNavigate) onNavigate(destination, id); // Pass other navigations up
    }
  };

  return (
    <div className={styles.dashboardRoot}>
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className={styles.leftSidebar}>
        <div className={styles.brandArea} onClick={() => setActiveTab("all")} style={{ cursor: 'pointer' }}>
          <div className={styles.brandName}>Bayanihan Drive</div>
        </div>

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

      {/* --- CENTER PANEL --- */}
      <main className={styles.centerPanel}>
        
        {activeTab === 'settings' ? (
            <ProfileSettings 
                onBack={() => { refreshProfile(); setActiveTab('all'); }} 
            />
        ) : activeTab === 'faqs' ? (
            <FAQs />
        ) : (
            <>
                <header className={styles.centerHeader}>
                  <div className={styles.headerTitle}>
                    <h2>News Feed</h2>
                    <p style={{ textTransform: 'capitalize' }}>
                      {greeting}, {profileLoading ? '...' : (profile?.full_name?.split(' ')[0] || 'User')}
                    </p>
                  </div>

                  <div className={styles.headerActions}>
                    <button className={styles.createBtn} onClick={() => onNavigate("createCampaign")} style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                      + Create
                    </button>
                    
                    <div className={styles.headerProfile} onClick={() => setShowProfileModal(true)} title="View Profile">
                      {profileLoading ? (
                        <div style={{width: '100%', height: '100%', background: '#ccc', borderRadius: '50%'}}></div>
                      ) : profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Me" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                      ) : (
                          profile?.full_name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                  </div>
                </header>

                <div className={styles.scrollableContent}>
                  {error ? (
                     <div className="alert alert-danger">{error}</div>
                  ) : (
                    <>
                      {activeTab === "all" && <CampaignList onNavigate={handleDashboardNavigate} />}
                      {activeTab === "my" && <MyCampaigns onNavigate={handleDashboardNavigate} />}
                      {activeTab === "donations" && <MyDonations />}
                    </>
                  )}
                </div>
            </>
        )}
      </main>

      {/* --- RIGHT SIDEBAR --- */}
      <aside className={styles.rightSidebar}>
        <div className={styles.walletCard}>
          <div className={styles.walletLabel}>My Wallet Balance</div>
          <div className={styles.walletAmount}>{profileLoading ? '...' : formatCurrency(wallet?.balance)}</div>
          <div className={styles.walletActions}>
            <button className={styles.walletBtnPrimary} onClick={() => setShowAddFunds(true)}>+ Add</button>
            {/* Removed Withdraw button */}
          </div>
        </div>
        <h4 className={styles.sectionTitle}>Recent Activity</h4>
        <div style={{ fontSize: '0.85rem', color: '#65676b', fontStyle: 'italic' }}>
          <p>• You logged in just now</p>
        </div>
      </aside>

      {/* --- MODALS --- */}
      
      {viewPublicProfileId && (
        <PublicProfile 
            userId={viewPublicProfileId} 
            onClose={() => setViewPublicProfileId(null)}
            onNavigate={handleDashboardNavigate} 
        />
      )}

      {showProfileModal && (
        <ProfileDetails 
            profile={profile} 
            onClose={() => setShowProfileModal(false)}
            onNavigate={handleDashboardNavigate} 
            onEdit={() => { setShowProfileModal(false); setActiveTab('settings'); }}
        />
      )}

      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} onSuccess={fetchData} />}
      {/* Removed WithdrawalModal rendering */}
    </div>
  );
}