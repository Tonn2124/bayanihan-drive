import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import styles from "../Style/Dashboard.module.css";
import CampaignList from "./CampaignList";
import AddFundsModal from "./AddFundsModal";
import MyCampaigns from "./MyCampaigns";
import MyDonations from "./MyDonations";

export default function Dashboard({ session, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

 const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const { user } = session;

    // PROFILE
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, username, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      setError("Failed to load profile");
    } else {
      setProfile(profileData);
    }

    // WALLET
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (walletError) {
      console.warn("Wallet error:", walletError);
      // If wallet row does not exist yet, treat as zero balance instead of failing
      if (walletError.code === "PGRST116") {
        setWallet({ balance: 0 });
      } else {
        setError("Failed to load wallet");
      }
    } else {
      setWallet(walletData);
    }
  } catch (err) {
    console.error("Dashboard fetch fatal error:", err);
    setError("Unexpected error while loading dashboard.");
  } finally {
    setLoading(false);
  }
}, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  // MAIN RENDER
  return (
    <div className={styles.dashboardRoot}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>Bayanihan Drive</div>

        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>
            {profile?.fullname?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <div className={styles.sidebarName}>
              {profile?.fullname || "User"}
            </div>
            <div className={styles.sidebarEmail}>{session.user.email}</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${
              activeTab === "all" ? styles.navItemActive : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Campaigns
          </button>
          <button
            className={`${styles.navItem} ${
              activeTab === "my" ? styles.navItemActive : ""
            }`}
            onClick={() => setActiveTab("my")}
          >
            My Campaigns
          </button>
          <button
            className={`${styles.navItem} ${
              activeTab === "donations" ? styles.navItemActive : ""
            }`}
            onClick={() => setActiveTab("donations")}
          >
            My Donations
          </button>

          {isAdmin && (
            <button
              className={styles.navItem}
              onClick={() => onNavigate("admin")}
            >
              Admin Panel
            </button>
          )}

          <button
            className={styles.navItem}
            onClick={() => onNavigate("profileSettings")}
          >
            Profile Settings
          </button>
        </nav>

        <button
          className={styles.sidebarLogout}
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Signing out..." : "Sign Out"}
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className={styles.mainArea}>
        <header className={styles.mainHeader}>
          <div>
            <h2 className={styles.welcomeTitle}>
              Welcome, {profile?.username || "User"}!
            </h2>
            <p className={styles.welcomeSubtitle}>
              Manage your wallet, campaigns, and donations in one place.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.addFundsBtn}
              onClick={() => setShowAddFunds(true)}
            >
              Add Funds
            </button>
            <button
              className={styles.newCampaignBtn}
              onClick={() => onNavigate("createCampaign")}
            >
              New Campaign
            </button>
          </div>
        </header>

        <main className={styles.contentArea}>
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              {/* TOP INFO BLOCKS */}
              <section className={styles.horizontalGroup}>
                <div className={styles.infoBlock}>
                  <h4>Your Wallet</h4>
                  <p className={styles.walletBalance}>
                    {wallet ? formatCurrency(wallet.balance) : "₱0"}
                  </p>
                  <p>Available balance for donations and withdrawals.</p>
                </div>

                <div className={styles.infoBlock}>
                  <h4>Your Profile</h4>
                  <p>
                    <strong>Name</strong> {profile?.fullname || "Not set"}
                  </p>
                  <p>
                    <strong>Email</strong> {session.user.email}
                  </p>
                  <p>
                    <strong>Username</strong> {profile?.username || "—"}
                  </p>
                  {isAdmin && (
                    <span className={styles.adminBadge}>ADMIN</span>
                  )}
                </div>
              </section>

              {/* TABS + CONTENT */}
              <section className={styles.tabsSection}>
                <div className={styles.tabs}>
                  <button
                    className={`${styles.tabButton} ${
                      activeTab === "all" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Campaigns
                  </button>
                  <button
                    className={`${styles.tabButton} ${
                      activeTab === "my" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("my")}
                  >
                    My Campaigns
                  </button>
                  <button
                    className={`${styles.tabButton} ${
                      activeTab === "donations" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("donations")}
                  >
                    My Donations
                  </button>
                </div>

                <div className={styles.tabContent}>
                  {activeTab === "all" && (
                    <CampaignList onNavigate={onNavigate} />
                  )}
                  {activeTab === "my" && (
                    <MyCampaigns onNavigate={onNavigate} />
                  )}
                  {activeTab === "donations" && <MyDonations />}
                </div>
              </section>
            </>
          )}
        </main>

        {showAddFunds && (
          <AddFundsModal
            onClose={() => setShowAddFunds(false)}
            onSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
}
