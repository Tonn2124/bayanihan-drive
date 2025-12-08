import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import styles from '../Style/CampaignDetails.module.css';
import DonateModal from './DonateModal';
import WithdrawalModal from './WithdrawalModal';
import ReportModal from './ReportModal';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8080/api';

// --- Icons ---
const ShareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>);
const HeartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

export default function CampaignDetails({ campaignId, onBack }) {
  const [campaign, setCampaign] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [donations, setDonations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States - Default to 'comments' now
  const [activeTab, setActiveTab] = useState('comments');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Social & Input States
  const [newComment, setNewComment] = useState('');
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [comments, setComments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [postingComment, setPostingComment] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- Fetch Logic ---
  const fetchSocialData = async () => {
    try {
      const [commentsRes, updatesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/social/comments/${campaignId}`),
        axios.get(`${API_BASE_URL}/social/updates/${campaignId}`)
      ]);
      setComments(commentsRes.data || []);
      setUpdates(updatesRes.data || []);
    } catch (e) {
      console.warn("Social data fetch warning", e);
    }
  };

  const fetchCampaignData = useCallback(async () => {
    try {
      setError(null);
      if (!campaign) setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      // 1. Campaign
      const campaignRes = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
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
        const donationsRes = await axios.get(`${API_BASE_URL}/donations/campaign/${campaignId}`);
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
  }, [campaignId, campaign]);

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
      await axios.post(`${API_BASE_URL}/social/comments`, { campaignId, content: newComment }, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
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
      await axios.post(`${API_BASE_URL}/social/updates`, { campaignId, title: newUpdateTitle, content: newUpdateContent }, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
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

  const handleShare = (platform) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?campaignId=${campaignId}`;
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`Check out this donation drive: ${campaign?.title}`);

    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl) 
        .then(() => alert("Link copied!"), () => alert("Failed to copy"));
    }
  };

  // --- Render Helpers ---
  if (loading) return (
    <div className={styles.overlay}>
        <div className={styles.modalContainer} style={{justifyContent:'center', alignItems:'center', height:'300px'}}>
            <div className={styles.spinner}></div>
            <p style={{marginTop:'1rem', color:'#666'}}>Loading campaign...</p>
        </div>
    </div>
  );

  if (error) return (
    <div className={styles.overlay} onClick={onBack}>
        <div className={styles.modalContainer} style={{justifyContent:'center', alignItems:'center', height:'auto', padding:'2rem'}}>
            <div className={styles.errorCard}><p>{error}</p><button className={styles.donateButton} onClick={onBack} style={{width:'auto'}}>Close</button></div>
        </div>
    </div>
  );

  if (!campaign) return null;

  const currentAmount = campaign.currentAmount || 0;
  const goalAmount = campaign.goalAmount || 1; 
  const progress = Math.min((currentAmount / goalAmount) * 100, 100);
  const formatCurrency = (amt) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amt);
  
  const organizerName = organizer?.full_name || organizer?.username || 'Unknown Organizer';
  const organizerUsername = organizer?.username ? `@${organizer.username}` : '';
  const organizerInitial = organizerName.charAt(0).toUpperCase();

  const isOrganizer = currentUser && campaign.organizerId === currentUser.id;
  const isApproved = campaign.status === 'APPROVED';
  const canWithdraw = isOrganizer && isApproved;
  const availableBalance = currentAmount - (campaign.withdrawnAmount || 0);

  return (
    // OVERLAY
    <div className={styles.overlay} onClick={onBack}>
      
      {/* MODAL CONTAINER */}
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        
        {/* Floating Close Button */}
        <button className={styles.closeModalBtn} onClick={onBack} aria-label="Close">
            <CloseIcon />
        </button>

        {showDonateModal && <DonateModal campaign={campaign} onClose={() => setShowDonateModal(false)} onSuccess={fetchCampaignData} />}
        {showWithdrawModal && <WithdrawalModal campaign={campaign} availableBalance={availableBalance} onClose={() => setShowWithdrawModal(false)} onSuccess={fetchCampaignData} />}
        {showReportModal && <ReportModal campaignId={campaignId} onClose={() => setShowReportModal(false)} />}

        <div className={styles.pageWrapper}>
            
            {/* Main Content Grid */}
            <div className={styles.ytLayoutGrid}>
                
                {/* LEFT COLUMN: Main Info */}
                <div className={styles.ytMainColumn}>
                    
                    {/* Hero Image */}
                    <div className={styles.heroImageWrapper}>
                        <img src={campaign.coverImageUrl || 'https://placehold.co/1200x675/EFF6FF/0056D2?text=Campaign+Image'} alt={campaign.title} className={styles.headerImage} />
                        {campaign.category && <span className={styles.categoryBadge}>{campaign.category.replace('_', ' ')}</span>}
                    </div>

                    <h1 className={styles.ytTitle}>{campaign.title}</h1>

                    {/* Meta & Share Row */}
                    <div className={styles.ytMetaRow}>
                        <div className={styles.ytOrganizerProfile}>
                            <div className={styles.organizerAvatar}>
                                {organizer?.avatar_url ? <img src={organizer.avatar_url} alt="Org" /> : organizerInitial}
                            </div>
                            <div className={styles.organizerInfo}>
                                <strong className={styles.organizerName}>{organizerName}</strong>
                                <span className={styles.organizerUsername}>{organizerUsername} • {updates.length} updates</span>
                            </div>
                        </div>

                        <div className={styles.ytActionButtons}>
                            <button className={styles.pillBtn} onClick={() => handleShare('copy')}>
                                <ShareIcon /> <span>Share</span>
                            </button>
                            <button className={styles.pillBtn} onClick={() => setShowReportModal(true)} style={{color:'red'}}>
                                <span>🚩 Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Description & Tabs Box */}
                    <div className={styles.ytDescriptionBox}>
                        <div className={styles.descMeta}>
                            <span className={styles.descDate}>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                            <span className={styles.descTag}>#{campaign.category || 'fundraiser'}</span>
                        </div>
                        
                        {/* STORY SECTION: Always Visible */}
                        <div className={styles.descriptionContent}>
                            <p className={styles.descriptionText}>{campaign.description}</p>
                        </div>
                        
                        {/* Tabs: Only Comments & Updates now */}
                        <div className={styles.tabsContainer}>
                            <button className={`${styles.tabButton} ${activeTab === 'comments' ? styles.activeTab : ''}`} onClick={() => setActiveTab('comments')}>Comments ({comments.length})</button>
                            <button className={`${styles.tabButton} ${activeTab === 'updates' ? styles.activeTab : ''}`} onClick={() => setActiveTab('updates')}>Updates ({updates.length})</button>
                        </div>

                        {/* UPDATES TAB */}
                        {activeTab === 'updates' && (
                            <div className={styles.tabContentSection}>
                                {isOrganizer && (
                                    <div className={styles.updateForm}>
                                        <div className={styles.updateFormTitle}>📢 Post a New Update</div>
                                        <input className={styles.formInput} placeholder="Headline..." value={newUpdateTitle} onChange={e => setNewUpdateTitle(e.target.value)} />
                                        <textarea className={styles.formTextarea} placeholder="Share the news..." value={newUpdateContent} onChange={e => setNewUpdateContent(e.target.value)} />
                                        <div style={{textAlign: 'right'}}>
                                            <button className={styles.donateButton} style={{width:'auto', marginTop:0, padding:'0.6rem 1.5rem'}} onClick={handlePostUpdate} disabled={postingUpdate}>Post</button>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.timelineFeed}>
                                    {updates.length === 0 ? <div className={styles.emptyState}>No updates yet.</div> : updates.map(u => (
                                        <div key={u.id} className={styles.updateItem}>
                                            <div className={styles.updateHeader}>
                                                <h3 className={styles.updateTitle}>{u.title}</h3>
                                                <span className={styles.updateDate}>{new Date(u.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className={styles.updateBody}>{u.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* COMMENTS TAB */}
                        {activeTab === 'comments' && (
                            <div className={styles.tabContentSection}>
                                <div className={styles.commentInputWrapper}>
                                    <div className={styles.commentAvatarSmall}>?</div>
                                    <form className={styles.commentForm} onSubmit={handlePostComment}>
                                        <input className={styles.commentLineInput} placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                                        {newComment && <div className={styles.commentActions}>
                                            <button type="button" className={styles.cancelBtn} onClick={() => setNewComment('')}>Cancel</button>
                                            <button type="submit" className={styles.commentSubmitBtn} disabled={postingComment}>Comment</button>
                                        </div>}
                                    </form>
                                </div>
                                <div className={styles.commentList}>
                                    {comments.map(c => (
                                        <div key={c.id} className={styles.commentItem}>
                                            <div className={styles.commentAvatarSmall}>?</div>
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentHeader}>
                                                    <span className={styles.commentAuthor}>User</span>
                                                    <span className={styles.commentTime}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p>{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Donation Sidebar */}
                <aside className={styles.ytSidebar}>
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
                        <button className={styles.donateButton} onClick={() => setShowDonateModal(true)}>Donate Now</button>
                        
                        {canWithdraw && (
                            <div className={styles.organizerActions}>
                                <div className={styles.payoutInfo}>Available: <strong className={styles.payoutAmount}>{formatCurrency(availableBalance)}</strong></div>
                                <button className={styles.withdrawButton} onClick={() => setShowWithdrawModal(true)} disabled={availableBalance <= 0}>Withdraw</button>
                            </div>
                        )}

                        <div className={styles.donationsSection}>
                            <h4 className={styles.sectionTitle}>Recent Donations</h4>
                            <div className={styles.donationsList}>
                                {donations.slice(0, 5).map(d => (
                                    <div key={d.id} className={styles.donationItem}>
                                        <div className={styles.donorAvatar}>
                                            {d.isAnonymous ? '?' : (d.donorName ? d.donorName.charAt(0).toUpperCase() : 'D')}
                                        </div>
                                        <div className={styles.donationContent}>
                                            <span className={styles.donorName}>
                                                {d.isAnonymous ? 'Anonymous' : (d.donorName || 'Supporter')}
                                            </span>
                                            <span className={styles.donationAmount}>{formatCurrency(d.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                                {donations.length === 0 && <p className={styles.emptySmall}>No donations yet.</p>}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
      </div>
    </div>
  );
}