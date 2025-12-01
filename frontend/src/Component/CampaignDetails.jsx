import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/CampaignDetails.module.css';
import DonateModal from './DonateModal';
import WithdrawalModal from './WithdrawalModal';
import Skeleton from './Skeleton';

// Icons
const ShareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const LocationIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
<circle cx="12" cy="10" r="3"></circle>
</svg>
);

export default function CampaignDetails({ campaignId, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [donations, setDonations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [activeTab, setActiveTab] = useState('story');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Social State
  const [newComment, setNewComment] = useState('');
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [comments, setComments] = useState([]);
  const [updates, setUpdates] = useState([]);

  // Loading states for posting
  const [postingComment, setPostingComment] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);

  // User State
  const [currentUser, setCurrentUser] = useState(null);

  // --- Social fetch (reused) ---
  const fetchSocialData = async () => {
    try {
      const [commentsRes, updatesRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/social/comments/${campaignId}`),
        axios.get(`http://localhost:8080/api/social/updates/${campaignId}`)
      ]);
      setComments(commentsRes.data || []);
      setUpdates(updatesRes.data || []);
    } catch (e) {
      console.warn("Social data fetch warning", e);
    }
  };

  // --- Fetch Logic ---
  const fetchCampaignData = useCallback(async () => {
    try {
      setError(null);
      if (!campaign) setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      // 1. Campaign
      const campaignRes = await axios.get(`http://localhost:8080/api/campaigns/${campaignId}`);
      const campaignData = campaignRes.data;
      if (!campaignData) throw new Error("Campaign data is empty");
      setCampaign(campaignData);

      // 2. Organizer
      if (campaignData.organizerId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', campaignData.organizerId)
          .single();
        setOrganizer(profileData || {});
      }

      // 3. Donations
      try {
        const donationsRes = await axios.get(`http://localhost:8080/api/donations/campaign/${campaignId}`);
        setDonations(donationsRes.data || []);
      } catch (e) { 
        console.warn("Donations fetch error", e); 
      }

      // 4. Social
      await fetchSocialData();
    } catch (err) {
      console.error("Error fetching details:", err);
      setError(err.message || "Could not load campaign details.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) fetchCampaignData();
  }, [campaignId, fetchCampaignData]);

  // --- Handlers ---
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to comment.");
        setPostingComment(false);
        return;
      }

      await axios.post(
        'http://localhost:8080/api/social/comments',
        { campaignId, content: newComment },
        { headers: { 'Authorization': `Bearer ${session.access_token}` } }
      );

      setNewComment('');
      await fetchSocialData();
    } catch (err) {
      console.error(err);
      alert("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateTitle.trim() || !newUpdateContent.trim()) return;

    setPostingUpdate(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await axios.post(
        'http://localhost:8080/api/social/updates',
        { campaignId, title: newUpdateTitle, content: newUpdateContent },
        { headers: { 'Authorization': `Bearer ${session.access_token}` } }
      );

      setNewUpdateTitle('');
      setNewUpdateContent('');
      await fetchSocialData();
    } catch (err) {
      console.error(err);
      alert("Failed to post update.");
    } finally {
      setPostingUpdate(false);
    }
  };

  // Social sharing
  const handleShareFacebook = () => {
    const url = window.location.href; 
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  const handleShareTwitter = () => {
    const url = window.location.href;
    const text = `Check out this donation drive: ${campaign?.title}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => alert("Link copied!"),
      () => alert("Failed to copy")
    );
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        {/* existing skeleton UI unchanged */}
        {/* ... */}
      </div>
    );
  }
  if (error) return <div className={styles.errorContainer}><div className={styles.errorCard}><p>{error}</p><button className={styles.backButton} onClick={onBack}>Back</button></div></div>;
  if (!campaign) return null;

  // Calculations
  const currentAmount = campaign.currentAmount || 0;
  const goalAmount = campaign.goalAmount || 1; 
  const progress = Math.min((currentAmount / goalAmount) * 100, 100);
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);

  const organizerName = organizer?.full_name || organizer?.username || 'Unknown Organizer';
  const organizerUsername = organizer?.username ? `@${organizer.username}` : '';
  const organizerInitial = organizerName.charAt(0).toUpperCase();

  const isOrganizer = currentUser && campaign.organizerId === currentUser.id;
  const isApproved = campaign.status === 'APPROVED';
  const canWithdraw = isOrganizer && isApproved;
  const availableBalance = currentAmount - (campaign.withdrawnAmount || 0);

  return (
    <div className={styles.pageWrapper}>
      {showDonateModal && (
        <DonateModal
          campaign={campaign}
          onClose={() => setShowDonateModal(false)}
          onSuccess={() => fetchCampaignData()}
        />
      )}
      {showWithdrawModal && (
        <WithdrawalModal
          campaign={campaign}
          availableBalance={availableBalance}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => fetchCampaignData()}
        />
      )}

      {/* Nav */}
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.navActions}>
          <button className={styles.iconButton} title="Share" onClick={handleShareFacebook}><ShareIcon /></button>
          <button className={styles.iconButton} title="Save"><HeartIcon /></button>
        </div>
      </div>

      {/* Title on top */}
      <div className={styles.headerSection}>
        <h1 className={styles.campaignTitle}>{campaign.title}</h1>
      </div>

      
    {/* Image (3/4) + Sidebar (1/4) + Details under image */}
    <div className={styles.heroRow}>
    {/* LEFT: Big image (row 1, col 1) */}
    <div className={styles.heroImageWrapper}>
    <img
      src={campaign.coverImageUrl || 'https://placehold.co/1200x500/EFF6FF/0056D2?text=Campaign+Image'}
      alt={campaign.title}
      className={styles.headerImage}
    />
    
    {campaign.category && (
      <div className={styles.categoryBadge}>
        {campaign.category.replace('_', ' ')}
      </div>
    )}
  </div>

  {/* RIGHT: Sidebar (row 1–2, col 2) */}
  <div className={styles.sidebar}>
    <div className={styles.donationCard}>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{formatCurrency(currentAmount)}</div>
          <div className={styles.statLabel}>raised of {formatCurrency(goalAmount)}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}><HeartIcon /> {donations.length}</div>
          <div className={styles.statLabel}>Donors</div>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <div className={styles.progressLabel}>{Math.round(progress)}% funded</div>
      </div>

      <button className={styles.donateButton} onClick={() => setShowDonateModal(true)}>
        Donate Now
      </button>

      {canWithdraw && (
        <div className={styles.organizerActions}>
          <h4 className={styles.organizerActionsTitle}>Organizer Actions</h4>
          <div className={styles.payoutInfo}>
            Available: <strong className={styles.payoutAmount}>{formatCurrency(availableBalance)}</strong>
          </div>
          <button
            className={styles.withdrawButton}
            onClick={() => setShowWithdrawModal(true)}
            disabled={availableBalance <= 0}
          >
            Request Withdrawal
          </button>
        </div>
      )}

      {isOrganizer && !isApproved && (
        <div className={styles.warningAlert}>
          <strong>Status: {campaign.status}</strong><br />
          You can request withdrawals once approved.
        </div>
      )}

      <div className={styles.donationsSection}>
        <h4 className={styles.sectionTitle} style={{ fontSize: '1rem' }}>Recent Donations</h4>
        <div className={styles.donationsList}>
          {donations.slice(0, 5).map(d => (
            <div key={d.id} className={styles.donationItem} style={{ padding: '0.75rem' }}>
              <div
                className={styles.donorAvatar}
                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
              >
                {d.isAnonymous ? '?' : 'D'}
              </div>
              <div className={styles.donationContent}>
                <div
                  className={styles.donationHeader}
                  style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <span className={styles.donorName} style={{ fontSize: '0.9rem' }}>
                    {d.isAnonymous ? 'Anonymous' : 'Supporter'}
                  </span>
                  <span className={styles.donationAmount} style={{ fontSize: '0.9rem' }}>
                    {formatCurrency(d.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {donations.length === 0 && (
            <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>No donations yet.</p>
          )}
        </div>
      </div>

      <div className={styles.shareSection}>
        <div className={styles.shareDivider}><span>Share</span></div>
        <div className={styles.shareButtons}>
          <button className={styles.shareBtn} onClick={handleShareFacebook}><ShareIcon /></button>
          <button className={styles.shareBtn} onClick={handleShareTwitter}><ShareIcon /></button>
          <button className={styles.shareBtn} onClick={handleCopyLink}><ShareIcon /></button>
        </div>
      </div>
    </div>
  </div>

  {/* BOTTOM-LEFT: Details under the image only (row 2, col 1) */}
  <div className={styles.detailsSection}>
    <div className={styles.metaInfoRow}>
      <div className={styles.metaItem}>
        <CalendarIcon />
        <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
      </div>
    </div>

    <div className={styles.organizerCard}>
      <div className={styles.organizerAvatar}>
        {organizer?.avatar_url ? <img src={organizer.avatar_url} alt="Org" /> : organizerInitial}
      </div>
            <div className={styles.organizerInfo}>
        <div className={styles.organizerLabel}>Organized by</div>
        <div className={styles.organizerName}>{organizerName}</div>
        <div className={styles.organizerUsername}>{organizerUsername}</div>
      </div>
    </div>

    {/* TABS */}
    <div className={styles.tabs}>
      <button
        className={`${styles.tabButton} ${activeTab === 'story' ? styles.active : ''}`}
        onClick={() => setActiveTab('story')}
      >
        Story
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'updates' ? styles.active : ''}`}
        onClick={() => setActiveTab('updates')}
      >
        Updates ({updates.length})
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'comments' ? styles.active : ''}`}
        onClick={() => setActiveTab('comments')}
      >
        Comments ({comments.length})
      </button>
    </div>

    {/* TAB CONTENT */}
    {activeTab === 'story' && (
      <div className={styles.descriptionSection}>
        <p className={styles.description}>{campaign.description}</p>
      </div>
    )}

    {activeTab === 'updates' && (
      <div>
        {isOrganizer && (
          <div className={styles.updateForm}>
            <h4 style={{ marginBottom: '1rem' }}>Post an Update</h4>
            <input
              className="form-control"
              style={{ marginBottom: '1rem' }}
              placeholder="Update Title"
              value={newUpdateTitle}
              onChange={e => setNewUpdateTitle(e.target.value)}
            />
            <textarea
              className="form-control"
              style={{ minHeight: '100px', marginBottom: '1rem' }}
              placeholder="Share the latest news..."
              value={newUpdateContent}
              onChange={e => setNewUpdateContent(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handlePostUpdate}
              disabled={postingUpdate}
            >
              {postingUpdate ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        )}
        {updates.length === 0 ? (
          <p style={{ color: '#6B7280', fontStyle: 'italic' }}>No updates yet.</p>
        ) : (
          updates.map(u => (
            <div key={u.id} className={styles.updateItem}>
              <div className={styles.updateDate}>
                {new Date(u.createdAt).toLocaleDateString()}
              </div>
              <h3 className={styles.updateTitle}>{u.title}</h3>
              <p className={styles.updateBody}>{u.content}</p>
            </div>
          ))
        )}
      </div>
    )}

    {activeTab === 'comments' && (
      <div>
        <form className={styles.commentForm} onSubmit={handlePostComment}>
          <textarea
            className={styles.commentInput}
            placeholder="Leave a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            type="submit"
            disabled={!newComment || postingComment}
          >
            {postingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
        <div className={styles.commentList}>
          {comments.length === 0 ? (
            <p style={{ color: '#6B7280', fontStyle: 'italic' }}>
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map(c => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentAvatar}>?</div>
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>User</span>
                    <span className={styles.commentTime}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}
    </div>

    </div>

    </div>
  );
}
