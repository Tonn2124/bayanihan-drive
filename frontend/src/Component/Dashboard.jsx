import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import styles from "../Style/Dashboard.module.css"; 
import CampaignList from "./CampaignList";
import AddFundsModal from "./AddFundsModal";
import WithdrawalModal from "./WithdrawalModal"; 
import MyCampaigns from "./MyCampaigns";
import MyDonations from "./MyDonations";
import ProfileSettings from "./ProfileSettings"; 
import FAQs from "./FAQs";

export default function Dashboard({ session, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [greeting, setGreeting] = useState("Welcome back"); 

  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  
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
      setLoading(true);
      setError(null);
      const { user } = session;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setAuthError("This account does not exist. It may have been deleted.");
        setLoading(false);
        return; 
      }

      setProfile(profileData);

      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();
      
      setWallet(walletData || { balance: 0 });

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      if (!authError) setLoading(false); 
    }
  }, [session, authError]); 

  useEffect(() => {
    fetchData();
    const isNew = localStorage.getItem('isNewUser');
    if (isNew === 'true') {
        setGreeting("Welcome"); 
        localStorage.removeItem('isNewUser'); 
    } else {
        setGreeting("Welcome back");
    }
  }, [fetchData]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount || 0);

  // if (authError) {
  //   return (
  //     <div className={styles.dashboardRoot} style={{ justifyContent: 'center', alignItems: 'center' }}>
  //       <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
  //         <h2 style={{ color: '#dc3545' }}>Access Denied</h2>
  //         <p>{authError}</p>
  //         <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>Return to Login</button>
  //       </div>
  //     </div>
  //   );
  // }

  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  return (
    <div className={styles.dashboardRoot}>
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className={styles.leftSidebar}>
        {/* MODIFIED: Clickable Brand Area */}
        <div 
            className={styles.brandArea} 
            onClick={() => setActiveTab("all")} 
            style={{ cursor: 'pointer' }}
            title="Go to Home Feed"
        >
          <div className={styles.brandName}>Bayanihan Drive</div>
        </div>

        <div className={styles.categoryTitle}>Menu</div>
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === "all" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("all")}>
            <span className={styles.navIcon}>🏠</span> Home Feed
          </button>
          <button className={`${styles.navItem} ${activeTab === "my" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("my")}>
            <span className={styles.navIcon}>📁</span> My Campaigns
          </button>
          <button className={`${styles.navItem} ${activeTab === "donations" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("donations")}>
            <span className={styles.navIcon}>❤️</span> My Donations
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
                onBack={() => {
                    refreshProfile();
                    setActiveTab('all');
                }} 
            />
        ) : activeTab === 'faqs' ? (
            <FAQs />
        ) : (
            <>
                <header className={styles.centerHeader}>
                  <div className={styles.headerTitle}>
                    <h2>{activeTab === 'all' ? 'News Feed' : activeTab === 'my' ? 'My Projects' : 'Donation History'}</h2>
                    <p style={{ textTransform: 'capitalize' }}>
                      {greeting}, {profile?.full_name?.split(' ')[0] || 'User'}
                    </p>
                  </div>

                  <div className={styles.headerActions}>
                    <button className={styles.createBtn} onClick={() => onNavigate("createCampaign")}>
                      + Create
                    </button>
                    
                    <div 
                      className={styles.headerProfile} 
                      onClick={() => setActiveTab('settings')}
                      title="Profile & Settings"
                    >
                      {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Me" 
                            style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} 
                          />
                      ) : (
                          profile?.full_name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                  </div>
                </header>

                <div className={styles.scrollableContent}>
                  {loading ? (
                     <p style={{textAlign: 'center', marginTop: '20px'}}>Loading...</p>
                  ) : error ? (
                     <div className="alert alert-danger">{error}</div>
                  ) : (
                    <>
                      {activeTab === "all" && <CampaignList onNavigate={onNavigate} />}
                      {activeTab === "my" && <MyCampaigns onNavigate={onNavigate} />}
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
          <div className={styles.walletAmount}>
            {formatCurrency(wallet?.balance)}
          </div>
          <div className={styles.walletActions}>
            <button className={styles.walletBtnPrimary} onClick={() => setShowAddFunds(true)}>
              + Add
            </button>
            <button className={styles.walletBtnSecondary} onClick={() => setShowWithdrawal(true)}>
              Withdraw
            </button>
          </div>
        </div>

        <h4 className={styles.sectionTitle}>Recent Activity</h4>
        <div style={{ fontSize: '0.85rem', color: '#65676b', fontStyle: 'italic' }}>
          <p>• You logged in just now</p>
        </div>
      </aside>

      {/* MODALS */}
      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} onSuccess={fetchData} />}
      {showWithdrawal && (
          <WithdrawalModal 
            campaign={{id: null}} 
            availableBalance={wallet?.balance || 0}
            onClose={() => setShowWithdrawal(false)} 
            onSuccess={fetchData} 
          />
      )}
    </div>
  );
}