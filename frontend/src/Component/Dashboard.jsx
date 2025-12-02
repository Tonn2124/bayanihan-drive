import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import styles from "../Style/Dashboard.module.css"; 
import CampaignList from "./CampaignList";
import AddFundsModal from "./AddFundsModal";
import MyCampaigns from "./MyCampaigns";
import MyDonations from "./MyDonations";

const CATEGORIES = [
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'disaster_relief', label: 'Disaster Relief', icon: '🆘' },
  { id: 'animal_welfare', label: 'Animal Welfare', icon: '🐾' },
  { id: 'community', label: 'Community', icon: '🤝' },
  { id: 'other', label: 'Other', icon: '✨' },
];

export default function Dashboard({ session, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  
  const [activeTab, setActiveTab] = useState("all");
  // Optional: You can pass this filter to CampaignList if you want the categories to work immediately
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { user } = session;

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      const { data: walletData } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single();
      setWallet(walletData || { balance: 0 });

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount || 0);

  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  return (
    <div className={styles.dashboardRoot}>
      
      {/* --- LEFT SIDEBAR: NAV + CATEGORIES --- */}
      <aside className={styles.leftSidebar}>
        <div className={styles.brandArea}>
          <div className={styles.brandName}>Bayanihan Drive</div>
        </div>

        {/* Main Links */}
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === "all" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("all")}>
            <span className={styles.navIcon}>🏠</span> Home
          </button>
          <button className={`${styles.navItem} ${activeTab === "my" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("my")}>
            <span className={styles.navIcon}>📁</span> My Campaigns
          </button>
          <button className={`${styles.navItem} ${activeTab === "donations" ? styles.navItemActive : ""}`} onClick={() => setActiveTab("donations")}>
            <span className={styles.navIcon}>❤️</span> My Donations
          </button>
        </nav>

        <div className={styles.separator}></div>

        {/* Categories Section (Like FB Shortcuts) */}
        <div className={styles.categoryTitle}>Categories</div>
        <nav className={styles.navMenu}>
          {CATEGORIES.map((cat) => (
             <button key={cat.id} className={styles.subItem} onClick={() => { setActiveTab("all"); setCategoryFilter(cat.id); }}>
               <span>{cat.icon}</span> {cat.label}
             </button>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </aside>

      {/* --- CENTER PANEL --- */}
      <main className={styles.centerPanel}>
        
        {/* HEADER: Title Left, Profile Right (Like FB) */}
        <header className={styles.centerHeader}>
          <div className={styles.headerTitle}>
            <h2>{activeTab === 'all' ? 'News Feed' : activeTab === 'my' ? 'My Projects' : 'Donation History'}</h2>
            <p>Welcome back, {profile?.full_name?.split(' ')[0]}</p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.createBtn} onClick={() => onNavigate("createCampaign")}>
              + Create
            </button>
            
            {/* PROFILE CIRCLE */}
            <div 
              className={styles.headerProfile} 
              onClick={() => onNavigate('profileSettings')}
              title="Profile & Settings"
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
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
              {/* Note: You might want to pass 'categoryFilter' prop to CampaignList to make filtering work */}
              {activeTab === "all" && <CampaignList onNavigate={onNavigate} />}
              {activeTab === "my" && <MyCampaigns onNavigate={onNavigate} />}
              {activeTab === "donations" && <MyDonations />}
            </>
          )}
        </div>
      </main>

      {/* --- RIGHT SIDEBAR: CONTEXT --- */}
      <aside className={styles.rightSidebar}>
        {/* Wallet Widget */}
        <div className={styles.walletCard}>
          <div className={styles.walletLabel}>My Wallet Balance</div>
          <div className={styles.walletAmount}>
            {formatCurrency(wallet?.balance)}
          </div>
          <button className={styles.addFundsBtn} onClick={() => setShowAddFunds(true)}>
            + Add Funds
          </button>
        </div>

        {/* Recent Activity (Placeholder for future features) */}
        <h4 className={styles.sectionTitle}>Recent Activity</h4>
        <div style={{ fontSize: '0.85rem', color: '#65676b', fontStyle: 'italic' }}>
          <p>• You logged in just now</p>
          {/* You can map recent donations here later */}
        </div>
      </aside>

      {showAddFunds && <AddFundsModal onClose={() => setShowAddFunds(false)} onSuccess={fetchData} />}
    </div>
  );
}