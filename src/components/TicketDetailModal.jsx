import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES, ROLES } from '../data/mockData';
import { SLADetail } from './SLAComponents';
import * as api from '../utils/api';
import { renderTextWithIcons } from '../utils/render';

const URGENCY_INFO = {
  low: { label: 'ต่ำ', cls: 'badge-low', color: '#059669', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: 'circle-check' },
  medium: { label: 'ปานกลาง', cls: 'badge-medium', color: '#b45309', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: 'circle-minus' },
  high: { label: 'สูง', cls: 'badge-high', color: '#dc2626', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: 'circle-exclamation' },
  critical: { label: 'วิกฤต', cls: 'badge-critical', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', icon: 'triangle-exclamation' },
};

// Helper component for loading avatar images with fallback to initials on error
function CommentAvatar({ actor, actorAvatar, isMe }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [actorAvatar]);

  const initials = actor ? actor.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: isMe ? 'var(--primary)' : 'var(--primary-pale)',
      color: isMe ? '#fff' : 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 11, flexShrink: 0,
      border: isMe ? 'none' : '1px solid var(--border-light)',
      boxShadow: isMe ? 'var(--shadow-sm)' : 'none',
      overflow: 'hidden'
    }}>
      {actorAvatar && !imageError ? (
        <img 
          src={actorAvatar} 
          alt="avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={() => setImageError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

// Helper component for loading user avatars with fallback to initials
function UserAvatar({ name, avatarUrl, size = 32, defaultBg = 'var(--primary)' }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const initials = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: (!name || name === 'รอมอบหมาย') ? 'var(--bg-main)' : defaultBg,
      color: (!name || name === 'รอมอบหมาย') ? 'var(--text-muted)' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.375, border: '1px solid var(--border-light)',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {name && name !== 'รอมอบหมาย' && avatarUrl && !imageError ? (
        <img 
          src={avatarUrl} 
          alt="avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={() => setImageError(true)}
        />
      ) : (
        (!name || name === 'รอมอบหมาย') ? (
          <i className="fa-solid fa-hourglass-half" style={{ fontSize: size * 0.34 }}></i>
        ) : (
          initials
        )
      )}
    </div>
  );
}

// Reusable Image component that handles loading, network errors, and retries
function SafeImage({ src, alt, style, onClick, overlayIcon = "magnifying-glass-plus", isUploading = false, objectFit = 'cover', fallbackSrc = null }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (isUploading) {
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    
    // Check if the image has already finished loading (e.g. from browser cache)
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth === 0) {
        setError(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [src, retryKey, isUploading]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setRetryKey(prev => prev + 1);
  };

  return (
    <div 
      onClick={error || loading ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        position: 'relative', 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        minWidth: 120,
        minHeight: 80,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        cursor: (error || loading) ? 'default' : (onClick ? 'pointer' : 'default'),
        ...style
      }}
    >
      {/* Loading State */}
      {loading && (
        fallbackSrc ? (
          <img 
            src={fallbackSrc} 
            alt="loading-fallback" 
            style={{ width: '100%', height: '100%', objectFit: objectFit, opacity: 0.8 }} 
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--bg-main)',
            color: 'var(--text-muted)',
            zIndex: 10,
            padding: 8
          }}>
            <div style={{
              width: '70%',
              height: 4,
              background: 'var(--border-light)',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0, top: 0, height: '100%',
                background: 'var(--primary)',
                borderRadius: 2,
                width: '100%',
                animation: 'uploadProgressFill 1.4s infinite linear',
                transformOrigin: 'left'
              }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px' }}>กำลังโหลดรูป...</span>
          </div>
        )
      )}

      {/* Error State */}
      {error && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'var(--danger-pale)',
          color: 'var(--danger)',
          fontSize: 11,
          padding: 8,
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 8
        }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 16 }}></i>
          <span style={{ fontWeight: 600 }}>โหลดรูปไม่สำเร็จ</span>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              background: 'var(--danger)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <i className="fa-solid fa-rotate-right"></i> โหลดใหม่
          </button>
        </div>
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={src ? ((src.startsWith('blob:') || src.startsWith('data:')) ? src : `${src}${src.includes('?') ? '&' : '?'}_t=${retryKey}`) : ''}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: (isUploading || (!loading && !error)) ? '100%' : 0,
          height: (isUploading || (!loading && !error)) ? '100%' : 0,
          opacity: (isUploading || (!loading && !error)) ? 1 : 0,
          objectFit: objectFit
        }}
      />

      {/* Hover Overlay */}
      {!loading && !error && onClick && overlayIcon && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
          pointerEvents: 'none'
        }}>
          <i className={`fa-solid fa-${overlayIcon}`} style={{ fontSize: 24, color: 'var(--primary)' }}></i>
        </div>
      )}

      {/* Uploading/Sending Overlay (Spinner style matching rest of app) */}
      {isUploading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.65)',
          color: '#ffffff',
          zIndex: 10,
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          borderRadius: 8
        }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 20, color: 'var(--primary-light)' }} aria-hidden="true" />
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.5px' }}>กำลังส่ง...</span>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail-grid-container" style={{
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 24,
      alignItems: 'stretch',
      width: '100%'
    }}>
      {/* Left Column: Info Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="detail-info-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <div className="skeleton-shimmer" style={{ width: '100px', height: '26px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '80px', height: '26px', borderRadius: '12px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '50%', height: '24px', borderRadius: '6px', marginTop: 10 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--border-light)', paddingTop: 16, marginTop: 10 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="skeleton-shimmer" style={{ width: '100px', height: '14px', borderRadius: '3px' }} />
                <div className="skeleton-shimmer" style={{ width: '180px', height: '14px', borderRadius: '3px' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
            <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', borderRadius: '3px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100px', borderRadius: '8px' }} />
          </div>
        </div>
      </div>

      {/* Right Column: Chat Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="detail-chat-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: 'var(--shadow-sm)',
          height: '100%',
          minHeight: 450
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="skeleton-shimmer" style={{ width: '80px', height: '30px', borderRadius: '6px' }} />
            <div className="skeleton-shimmer" style={{ width: '80px', height: '30px', borderRadius: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'flex-end', paddingBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
              <div className="skeleton-shimmer" style={{ width: '150px', height: '38px', borderRadius: '12px' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <div className="skeleton-shimmer" style={{ width: '180px', height: '48px', borderRadius: '12px' }} />
              <div className="skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
              <div className="skeleton-shimmer" style={{ width: '120px', height: '38px', borderRadius: '12px' }} />
            </div>
          </div>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '44px', borderRadius: '10px' }} />
        </div>

        {/* Approval Section Skeleton */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
            <div className="skeleton-shimmer" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '150px', height: '18px', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '14px', borderRadius: '3px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '54px', borderRadius: '8px' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-shimmer" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
            <div className="skeleton-shimmer" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailModal({ ticket, onClose }) {
  const { 
    role, 
    updateTicketStatus, 
    approveTicket, 
    assignTicket, 
    currentUser, 
    reloadTickets,
    addToast,
    showConfirm: showCustomConfirm
  } = useApp();

  const [detailTicket, setDetailTicket] = useState(ticket);
  const [viewImage, setViewImage] = useState(null);
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [commentFilePreview, setCommentFilePreview] = useState(null);
  const [postingComment, setPostingComment] = useState(false);
  const [tempComment, setTempComment] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [openMenuCommentId, setOpenMenuCommentId] = useState(null);
  const [menuDirection, setMenuDirection] = useState('up');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [menuCommentId, setMenuCommentId] = useState(null);
  const [menuCommentText, setMenuCommentText] = useState('');
  
  const longPressTimers = useRef({});
  const chatInputRef = useRef(null);
  const lastUploadedFileRef = useRef(null);

  useEffect(() => {
    const closeMenu = () => setOpenMenuCommentId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    if (!commentFile) {
      setCommentFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(commentFile);
    setCommentFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [commentFile]);
  useEffect(() => {
    if (showBottomSheet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showBottomSheet]);
  
  
  // Filter for Timeline
  const [activeChatTab, setActiveChatTab] = useState('chat');
  
  // Transfer / Forward States
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferDeptId, setTransferDeptId] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [reloading, setReloading] = useState(false);
  const [transferDeptSearch, setTransferDeptSearch] = useState('');
  const [showTransferDeptDropdown, setShowTransferDeptDropdown] = useState(false);
  const transferDeptDropdownRef = useRef(null);
  const chatFileRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (transferDeptDropdownRef.current && !transferDeptDropdownRef.current.contains(e.target)) {
        setShowTransferDeptDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const [statusUpdating, setStatusUpdating] = useState(null);
  
  // Department list for transfers
  const [deptsList, setDeptsList] = useState([]);
  const [deptsLoadError, setDeptsLoadError] = useState(null);

  const rootContainerRef = useRef(null);

  // Load ticket details on mount
  const loadData = async (active = true, force = false) => {
    try {
      setDeptsLoadError(null);
      const details = await api.getTicketDetail(ticket.id, force);
      if (!active) return;
      setDetailTicket(details);
      
      try {
        const depts = await api.getDepartments(true);
        if (!active) return;
        setDeptsList(depts || []);
      } catch (deptErr) {
        console.error("Error loading departments:", deptErr);
        if (active) setDeptsLoadError(deptErr.message || "Failed to load departments");
      }
    } catch (error) {
      console.error("Error loading ticket detail:", error);
    }
  };

  const handleReload = async () => {
    if (reloading) return;
    setReloading(true);
    try {
      await loadData(true, true);
      if (reloadTickets) {
        await reloadTickets();
      }
      addToast('รีโหลดข้อมูลล่าสุดเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error("Reload error:", error);
      addToast('รีโหลดข้อมูลล้มเหลว', 'error');
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => {
    let active = true;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadData(active);
    return () => {
      active = false;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [ticket.id]);

  // Background polling for ticket detail updates (refresh chat/comments every 5 seconds)
  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      if (active && document.visibilityState === 'visible') {
        api.getTicketDetail(ticket.id)
          .then(details => {
            if (active) {
              setDetailTicket(details);
            }
          })
          .catch(err => console.error("Error polling ticket details:", err));
      }
    }, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [ticket.id]);

  // Prevent background scrolling and lock to top of page content on mount
  useEffect(() => {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      const originalOverflow = pageContent.style.overflow;
      const originalScrollTop = pageContent.scrollTop;
      
      pageContent.style.overflow = 'hidden';
      pageContent.scrollTop = 0;
      
      return () => {
        pageContent.style.overflow = originalOverflow;
        pageContent.scrollTop = originalScrollTop;
      };
    }
  }, []);

  useEffect(() => {
    if (reloading || statusUpdating) {
      if (rootContainerRef.current) {
        rootContainerRef.current.scrollTop = 0;
      }
      const pageContent = document.querySelector('.page-content');
      if (pageContent) {
        pageContent.scrollTop = 0;
      }
    }
  }, [reloading, statusUpdating]);

  // Scroll ONLY the chat container to bottom when comments count updates, active tab changes, or temp uploading starts
  useEffect(() => {
    if (chatContainerRef.current) {
      const timer = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [detailTicket?.timeline?.length, activeChatTab, tempComment]);

  const catInfo = CATEGORIES[detailTicket.category];
  const urgInfo = URGENCY_INFO[detailTicket.urgency] || URGENCY_INFO.medium;

  // Determine permissions
  const isOwner = currentUser && (
    detailTicket.createdBy === currentUser.name || 
    detailTicket.userId === currentUser.id || 
    detailTicket.reporterId === currentUser.id
  );
  const isMyCase = detailTicket.assignedTo === currentUser?.name;
  const isAssigned = detailTicket.assignedTo && detailTicket.assignedTo !== 'รอมอบหมาย';
  const isColleagueOfAssignee = 
    isAssigned && 
    !isMyCase && 
    (role === ROLES.ADMIN || (currentUser && detailTicket.targetDepartment && currentUser.department?.name === detailTicket.targetDepartment));

  // If claimed (assigned), only the assignee can control, unless bypassed by ADMIN or MANAGER
  const isTargetDeptStaff = currentUser?.department && detailTicket.targetDepartment && currentUser.department.name === detailTicket.targetDepartment;

  const canControl = 
    !['rejected', 'cancelled', 'resolved', 'closed'].includes(detailTicket.status?.toLowerCase()) &&
    (role !== ROLES.EMPLOYEE || isTargetDeptStaff) && 
    (!isOwner || role === ROLES.ADMIN) && (
      role === ROLES.ADMIN || 
      isMyCase ||
      (role === ROLES.MANAGER && (
        !detailTicket.targetDepartment || 
        isTargetDeptStaff
      )) ||
      (!isAssigned && (
        role === ROLES.ADMIN ||
        isTargetDeptStaff
      ))
    );

  const canClaim = 
    !['rejected', 'cancelled', 'resolved', 'closed'].includes(detailTicket.status?.toLowerCase()) &&
    (role !== ROLES.EMPLOYEE || isTargetDeptStaff) &&
    !isOwner &&
    (role === ROLES.ADMIN || 
      (currentUser && (
        !detailTicket.targetDepartment || 
        isTargetDeptStaff
      ))
    );
  const canCancel = (role === ROLES.ADMIN || isOwner) && !isAssigned && !['rejected', 'cancelled', 'resolved', 'closed'].includes(detailTicket.status?.toLowerCase());
  
  // If assigned, only assignee, ADMIN, or MANAGER can transfer
  const canTransfer = 
    (!isAssigned ? (role === ROLES.ADMIN || role === ROLES.MANAGER || canClaim || isOwner) : (role === ROLES.ADMIN || role === ROLES.MANAGER || isMyCase)) && 
    !['rejected', 'resolved', 'closed', 'cancelled'].includes(detailTicket.status?.toLowerCase());

  const canApprove = 
    !isOwner && (
      role === ROLES.ADMIN || 
      (role === ROLES.MANAGER && currentUser?.department && (
        detailTicket.department === currentUser.department.name ||
        detailTicket.targetDepartment === currentUser.department.name
      ))
    );
  const needsManagerApproval = 
    isAssigned &&
    detailTicket.status === 'wait-approve' && 
    !detailTicket.managerApproval;

  const canTakeover = isAssigned && !isMyCase && (role === ROLES.ADMIN || role === ROLES.MANAGER || canClaim) && !['rejected', 'cancelled', 'resolved', 'closed'].includes(detailTicket.status?.toLowerCase());

  const hasStaffPrivileges = !['rejected', 'cancelled', 'resolved', 'closed'].includes(detailTicket.status?.toLowerCase()) && (role !== ROLES.EMPLOYEE || isTargetDeptStaff) && (!isOwner || role === ROLES.ADMIN) && (role === ROLES.ADMIN || role === ROLES.MANAGER || isMyCase || isColleagueOfAssignee || canClaim);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (editingCommentId) {
      await handleEditCommentSubmit(editingCommentId);
      return;
    }
    const text = commentText.trim();
    const file = commentFile;
    if (!text && !file) return;

    if (file) {
      // Store info for cache matching to prevent flicker
      lastUploadedFileRef.current = {
        name: file.name,
        blobUrl: commentFilePreview
      };

      // Optimistic temporary comment for files (like Facebook Messenger)
      setTempComment({
        id: 'temp-' + Date.now(),
        event: text || "ส่งรูปภาพประกอบ",
        attachmentUrl: commentFilePreview,
        actor: currentUser?.name || 'Me',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        isUploading: true
      });
      // Clear inputs immediately so user can continue typing
      setCommentText('');
      setCommentFile(null);
      setCommentFilePreview(null);
    } else {
      setPostingComment(true);
    }

    try {
      if (text && file) {
        // Send text first
        await api.addComment(detailTicket.id, text, null);
        // Send image next
        await api.addComment(detailTicket.id, "", file);
      } else {
        await api.addComment(detailTicket.id, text, file);
      }
      
      // Clear tempComment immediately after API success to prevent race conditions
      setTempComment(null);

      if (!file) {
        setCommentText('');
      }
      setActiveChatTab('chat'); // Auto-switch to chat tab to see the new comment
      await loadData(true, true);
      await reloadTickets();
    } catch (err) {
      console.error("Failed to post comment:", err);
      addToast(`ส่งความคิดเห็นล้มเหลว: ${err.message}`, 'error');
    } finally {
      setPostingComment(false);
      setTempComment(null);
    }
  };

  const handleEditCommentSubmit = async (commentId) => {
    const trimmed = (commentText || "").trim();
    if (!trimmed) {
      addToast("กรุณากรอกข้อความ", "warning");
      return;
    }
    try {
      await api.editComment(detailTicket.id, commentId, trimmed);
      setEditingCommentId(null);
      setCommentText('');
      await loadData(true, true);
      await reloadTickets();
      addToast("แก้ไขข้อความเรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("Failed to edit comment:", err);
      addToast(`แก้ไขข้อความล้มเหลว: ${err.message}`, 'error');
    }
  };

  const handleDeleteCommentAction = async (commentId) => {
    const confirmed = await showCustomConfirm({
      title: "ยกเลิกการส่งข้อความ",
      message: "คุณต้องการยกเลิกการส่งข้อความนี้ใช่หรือไม่?"
    });
    if (!confirmed) return;

    try {
      await api.deleteComment(detailTicket.id, commentId);
      await loadData(true, true);
      await reloadTickets();
      addToast("ยกเลิกการส่งข้อความเรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      addToast(`ยกเลิกการส่งข้อความล้มเหลว: ${err.message}`, 'error');
    }
  };

  const handleLongPressStart = (commentId, itemText) => (e) => {
    // Only trigger for own, editable comments
    const timer = setTimeout(() => {
      // Trigger long-press vibration feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setMenuCommentId(commentId);
      setMenuCommentText(itemText);
      setShowBottomSheet(true);
    }, 600); // 600ms threshold
    longPressTimers.current[commentId] = timer;
  };

  const handleLongPressEnd = (commentId) => () => {
    if (longPressTimers.current[commentId]) {
      clearTimeout(longPressTimers.current[commentId]);
      delete longPressTimers.current[commentId];
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferDeptId) return;
    setTransferring(true);
    try {
      await api.transferTicket(detailTicket.id, transferDeptId, transferNote);
      setShowTransferForm(false);
      setTransferDeptId('');
      setTransferNote('');
      setTransferDeptSearch('');
      setShowTransferDeptDropdown(false);
      await reloadTickets();
      addToast('โอนย้ายงานไปยังแผนกใหม่สำเร็จแล้ว', 'success');
      onClose();
    } catch (err) {
      console.error("Failed to transfer ticket:", err);
      addToast(`โอนย้ายงานล้มเหลว: ${err.message}`, 'error');
    } finally {
      setTransferring(false);
    }
  };

  // Helper for workflow steps
  const getStepStatus = (step) => {
    const s = detailTicket.status;
    if (step === 1) return 'completed'; // always done
    if (step === 2) {
      return (s !== 'pending' && s !== 'NEW') ? 'completed' : 'active';
    }
    if (step === 3) {
      return (s === 'resolved' || s === 'closed' || s === 'RESOLVED' || s === 'CLOSED') ? 'completed' : 'pending';
    }
    return 'pending';
  };

  const getCategoryPath = (t) => {
    const catMap = {
      hardware: 'ฮาร์ดแวร์ / อุปกรณ์',
      software: 'ซอฟต์แวร์ / โปรแกรม',
      network: 'อินเทอร์เน็ต / Wi-Fi',
      access: 'สิทธิ์เข้าใช้งาน',
      other: 'ทั่วไป / บริการอื่นๆ'
    };
    const subMap = {
      computer_laptop: "คอมพิวเตอร์ / โน้ตบุ๊ก",
      monitor: "หน้าจอ / จอภาพ",
      printer_scanner: "ปริ้นเตอร์",
      accessory: "คีย์บอร์ด / เมาส์",
      hardware_other: "อุปกรณ์อื่นๆ",
      os_system: "OS (Windows / macOS)",
      office_apps: "Microsoft 365 / Outlook",
      internal_systems: "ERP / ระบบงานภายใน",
      install_update: "ติดตั้ง / อัปเดตโปรแกรม",
      software_other: "ซอฟต์แวร์อื่นๆ",
      wifi_issue: "ต่อ Wi-Fi ไม่ได้",
      lan_issue: "เน็ตสายแลนเสีย",
      vpn_remote: "VPN / เข้าถึงระยะไกล",
      slow_network: "เน็ตช้า / หลุดบ่อย",
      network_other: "ระบบเครือข่ายอื่นๆ",
      password_reset: "รีเซ็ตรหัสผ่าน / ปลดล็อกบัญชี",
      shared_folder: "ขอสิทธิ์โฟลเดอร์แชร์",
      license_request: "ขอสิทธิ์ใช้งานโปรแกรม / อีเมล",
      keycard_building: "บัตรพนักงาน / สิทธิ์เข้าออกอาคาร",
      access_other: "สิทธิ์เข้าใช้งานอื่นๆ",
      desk_chair: "ขอโต๊ะทำงาน / เก้าอี้",
      stationery: "อุปกรณ์สำนักงาน / เครื่องเขียน",
      intern_coord: "ประสานงานนักศึกษาฝึกงาน",
      consultation: "ขอคำปรึกษา / แนะนำทั่วไป",
      other_general: "บริการและคำขอทั่วไปอื่นๆ",
    };
    const catLabel = catMap[t.category] || t.category;
    const subLabel = subMap[t.subCategory] || t.subCategory;
    return subLabel ? `${catLabel} > ${subLabel}` : catLabel;
  };

  // Filtered timeline
  const timeline = detailTicket.timeline || [];
  const chatTimeline = timeline.filter(item => !(item.event.includes('ระบบ:') || item.event.includes('🔄') || item.actor === 'System'));
  
  // Prevent double rendering of the optimistic comment once the real one arrives in the timeline
  const finalChatTimeline = tempComment 
    ? (chatTimeline.some(item => item.attachmentUrl && lastUploadedFileRef.current && item.attachmentUrl.endsWith(lastUploadedFileRef.current.name))
        ? chatTimeline 
        : [...chatTimeline, tempComment])
    : chatTimeline;

  const systemTimeline = timeline
    .filter(item => item.event.includes('ระบบ:') || item.event.includes('🔄') || item.actor === 'System')
    .reverse();

  const filteredTimeline = activeChatTab === 'chat' ? finalChatTimeline : systemTimeline;

  return (
    <div ref={rootContainerRef} style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-main)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      overflowY: 'auto',
    }} className="full-screen-detail-view">

      
      {/* ── Main Body Container ── */}
      <div className="detail-body-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24, width: '100%', flex: 1 }}>
        
        {/* 1. Workflow Progress Steps */}
        <div className="detail-steps-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Steps */}
          {reloading || statusUpdating ? (
            <div className="detail-steps-flex" style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' }}>
              {/* Step 1 Skeleton */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="skeleton-shimmer" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton-shimmer" style={{ width: 90, height: 14, borderRadius: 3 }} />
                  <div className="skeleton-shimmer" style={{ width: 60, height: 10, borderRadius: 3 }} />
                </div>
              </div>
              {/* Line 1 */}
              <div className="skeleton-shimmer" style={{ height: 2.5, flex: 1, maxWidth: 120, minWidth: 40, borderRadius: 1.25 }} />
              {/* Step 2 Skeleton */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="skeleton-shimmer" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton-shimmer" style={{ width: 90, height: 14, borderRadius: 3 }} />
                  <div className="skeleton-shimmer" style={{ width: 60, height: 10, borderRadius: 3 }} />
                </div>
              </div>
              {/* Line 2 */}
              <div className="skeleton-shimmer" style={{ height: 2.5, flex: 1, maxWidth: 120, minWidth: 40, borderRadius: 1.25 }} />
              {/* Step 3 Skeleton */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="skeleton-shimmer" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton-shimmer" style={{ width: 90, height: 14, borderRadius: 3 }} />
                  <div className="skeleton-shimmer" style={{ width: 60, height: 10, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-steps-flex" style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' }}>
              {/* Step 1: Created */}
              <div className="detail-step-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--success)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                }}>1</div>
                <div className="detail-step-text">
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>ยื่น Ticket แล้ว</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>รับเรื่องแล้ว</div>
                </div>
              </div>

              {/* Line 1-2 */}
              <div className="detail-step-line" style={{
                height: 2.5, flex: 1, maxWidth: 120,
                background: getStepStatus(2) === 'completed' ? 'var(--success)' : 'var(--border-light)',
                minWidth: 40
              }} />

              {/* Step 2: Processing */}
              <div className="detail-step-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: getStepStatus(2) === 'completed' ? 'var(--success)' : 'var(--bg-main)',
                  color: getStepStatus(2) === 'completed' ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14,
                  boxShadow: getStepStatus(2) === 'completed' ? '0 4px 10px rgba(16,185,129,0.2)' : 'none',
                  border: getStepStatus(2) === 'completed' ? 'none' : '1.5px solid var(--border-light)'
                }}>2</div>
                <div className="detail-step-text">
                  <div style={{ fontSize: 14, fontWeight: 800, color: getStepStatus(2) === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>กำลังดำเนินการ</div>
                  <div style={{ fontSize: 11, color: getStepStatus(2) === 'completed' ? 'var(--text-muted)' : 'var(--text-muted)' }}>เจ้าหน้าที่กำลังแก้ไข</div>
                </div>
              </div>

              {/* Line 2-3 */}
              <div className="detail-step-line" style={{
                height: 2.5, flex: 1, maxWidth: 120,
                background: getStepStatus(3) === 'completed' ? 'var(--success)' : 'var(--border-light)',
                minWidth: 40
              }} />

              {/* Step 3: Resolved */}
              <div className="detail-step-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: getStepStatus(3) === 'completed' ? 'var(--success)' : 'var(--bg-main)',
                  color: getStepStatus(3) === 'completed' ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14,
                  boxShadow: getStepStatus(3) === 'completed' ? '0 4px 10px rgba(16,185,129,0.2)' : 'none',
                  border: getStepStatus(3) === 'completed' ? 'none' : '1.5px solid var(--border-light)'
                }}>3</div>
                <div className="detail-step-text">
                  <div style={{ fontSize: 14, fontWeight: 800, color: getStepStatus(3) === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>แก้ไขเสร็จสิ้น</div>
                  <div style={{ fontSize: 11, color: getStepStatus(3) === 'completed' ? 'var(--text-muted)' : 'var(--text-muted)' }}>ปัญหาได้รับการแก้ไข</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Top Actions: Reload and Close */}
          <div className="detail-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              className="detail-reload-btn"
              onClick={handleReload}
              disabled={reloading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: reloading ? 'var(--bg-main)' : 'var(--primary-bg)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                color: reloading ? 'var(--text-muted)' : 'var(--primary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: reloading ? 'not-allowed' : 'pointer',
                transition: 'background 0.18s'
              }}
              onMouseEnter={e => { if (!reloading) e.currentTarget.style.background = 'var(--primary-pale)'; }}
              onMouseLeave={e => { if (!reloading) e.currentTarget.style.background = 'var(--primary-bg)'; }}
            >
              <i className={`fa-solid fa-arrows-rotate ${reloading ? 'fa-spin' : ''}`}></i>
              <span className="desktop-only" style={{ marginLeft: 6 }}>{reloading ? 'กำลังรีโหลด...' : 'รีโหลดข้อมูล'}</span>
            </button>

            <button 
              className="detail-close-btn"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-pale)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              title="ปิด"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>        {/* 2. Middle Section Grid: Info vs Chat */}
        {reloading || statusUpdating ? (
          <DetailSkeleton />
        ) : (
          <div className="detail-grid-container" style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: 24,
            alignItems: 'stretch'
          }}>
            {/* Left Column: Ticket Info */}
          <div className="detail-info-card" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Row of Pills */}
            <div className="detail-pills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {/* Status Pill */}
              {(() => {
                const STATUS_LABEL = {
                  pending:      { label: 'รอดำเนินการ',    cls: 'status-pending',      icon: 'clock' },
                  progress:     { label: 'กำลังแก้ไข',     cls: 'status-progress',     icon: 'spinner' },
                  'wait-approve': { label: 'รออนุมัติ',    cls: 'status-wait-approve', icon: 'hourglass-half' },
                  approved:     { label: 'อนุมัติแล้ว',    cls: 'status-approved',     icon: 'circle-check' },
                  rejected:     { label: 'ปฏิเสธ',         cls: 'status-rejected',     icon: 'circle-xmark' },
                  forwarded:    { label: 'ส่งต่อแผนก',     cls: 'status-forwarded',    icon: 'share-from-square' },
                  'wait-parts': { label: 'รออะไหล่/อุปกรณ์', cls: 'status-wait-parts', icon: 'box-open' },
                  resolved:     { label: 'แก้ไขเสร็จสิ้น', cls: 'status-resolved',    icon: 'circle-check' },
                  cancelled:    { label: 'ยกเลิก',          cls: 'status-cancelled',   icon: 'ban' },
                };
                const st = STATUS_LABEL[detailTicket.status] || { label: detailTicket.status, cls: 'status-pending', icon: 'info' };
                // Map color configurations matching style or fallback
                const statusColors = {
                  pending: { bg: 'rgba(71,85,105,0.08)', color: '#475569', border: 'rgba(71,85,105,0.2)' },
                  progress: { bg: 'rgba(59,130,246,0.08)', color: '#2563eb', border: 'rgba(59,130,246,0.2)' },
                  'wait-approve': { bg: 'rgba(245,158,11,0.08)', color: '#d97706', border: 'rgba(245,158,11,0.2)' },
                  approved: { bg: 'rgba(16,185,129,0.08)', color: '#059669', border: 'rgba(16,185,129,0.2)' },
                  rejected: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.2)' },
                  forwarded: { bg: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: 'rgba(124,58,237,0.2)' },
                  'wait-parts': { bg: 'rgba(245,158,11,0.12)', color: '#b45309', border: 'rgba(245,158,11,0.25)' },
                  resolved: { bg: 'rgba(16,185,129,0.08)', color: '#16a34a', border: 'rgba(16,185,129,0.2)' },
                  cancelled: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.2)' },
                };
                const col = statusColors[detailTicket.status] || { bg: 'var(--primary-bg)', color: 'var(--primary)', border: 'var(--border-light)' };
                return (
                  <span style={{
                    background: col.bg,
                    border: `1.5px solid ${col.border}`,
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 800,
                    color: col.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <i className={`fa-solid fa-${st.icon}`} style={{ fontSize: 10 }}></i>
                    {st.label}
                  </span>
                );
              })()}

              {/* ID */}
              <span style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--border-light)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                #{detailTicket.id.substring(0, 8)}
              </span>
              
              {/* Category Path */}
              <span style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary-light)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <i className={`fa-solid fa-${catInfo?.icon || 'folder'}`} style={{ fontSize: 10 }}></i>
                {getCategoryPath(detailTicket)}
              </span>

              {/* Urgency */}
              <span style={{
                background: urgInfo.bg,
                border: `1.5px solid ${urgInfo.border}`,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                color: urgInfo.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: urgInfo.color }}></span>
                {urgInfo.label}
              </span>

              {/* Target Dept */}
              <span style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: 'rgb(99, 102, 241)'
              }}>
                ส่งถึง: {detailTicket.targetDepartment || '-'}
              </span>

              {/* SLA */}
              <span style={{
                background: 'rgba(236,72,153,0.08)',
                border: '1px solid rgba(236,72,153,0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: '#ec4899'
              }}>
                เป้าหมายเวลา: {detailTicket.urgency === 'critical' ? '1 ชม.' : detailTicket.urgency === 'high' ? '4 ชม.' : '24-72 ชม.'}
              </span>

              {/* Approval status pill */}
              {(detailTicket.status === 'wait-approve' || detailTicket.managerApproval) && (
                <span style={{
                  background: detailTicket.managerApproval === 'approved' 
                    ? 'rgba(16,185,129,0.08)' 
                    : detailTicket.managerApproval === 'rejected' 
                      ? 'rgba(239,68,68,0.08)' 
                      : 'rgba(245,158,11,0.08)',
                  border: `1px solid ${
                    detailTicket.managerApproval === 'approved' 
                      ? 'rgba(16,185,129,0.2)' 
                      : detailTicket.managerApproval === 'rejected' 
                        ? 'rgba(239,68,68,0.2)' 
                        : 'rgba(245,158,11,0.2)'
                  }`,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: detailTicket.managerApproval === 'approved' 
                    ? 'var(--success)' 
                    : detailTicket.managerApproval === 'rejected' 
                      ? 'var(--danger)' 
                      : '#d97706',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <i className={`fa-solid fa-${
                    detailTicket.managerApproval === 'approved' 
                      ? 'circle-check' 
                      : detailTicket.managerApproval === 'rejected' 
                        ? 'circle-xmark' 
                        : 'hourglass-half'
                  }`} style={{ fontSize: 11 }}></i>
                  อนุมัติ: {
                    detailTicket.managerApproval === 'approved' 
                      ? 'อนุมัติแล้ว' 
                      : detailTicket.managerApproval === 'rejected' 
                        ? 'ปฏิเสธแล้ว' 
                        : 'รอการอนุมัติ'
                  }
                </span>
              )}
            </div>

            {/* Subject */}
            <h1 className="detail-subject" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              {detailTicket.subject}
            </h1>

            {/* Description Section */}
            <div className="detail-desc-section" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="detail-desc-title" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                รายละเอียด
              </div>
              <div className="detail-desc-content" style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: 14,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {detailTicket.description}
              </div>
            </div>

            {/* Image Attachments */}
            {detailTicket.image && (
              <div className="detail-attachment-section" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa-solid fa-image"></i> รูปภาพหลักฐาน (คลิกเพื่อขยาย)
                </div>
                <SafeImage 
                  src={detailTicket.image} 
                  alt="หลักฐาน" 
                  style={{ maxWidth: '100%', maxHeight: 260, minWidth: 200, minHeight: 150, borderRadius: 12 }} 
                  onClick={() => setViewImage(detailTicket.image)}
                  objectFit="contain"
                />
              </div>
            )}

            {/* SLA breakdown box */}
            <div className="detail-sla-section" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <SLADetail ticket={detailTicket} />
            </div>

            {/* Left Card Footer / Requester Info */}
            <div className="detail-requester-section" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-light)',
              paddingTop: 16,
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserAvatar name={detailTicket.createdBy} avatarUrl={detailTicket.creatorAvatar} defaultBg="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    ผู้แจ้ง: {detailTicket.createdBy}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    แผนก: {detailTicket.department}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>ส่งเมื่อ: {detailTicket.createdAt}</span>
                {canCancel && (
                  <button 
                    onClick={async () => {
                      if (statusUpdating !== null) return;
                      const confirmed = await showCustomConfirm({
                        title: 'ยืนยันการยกเลิก Ticket',
                        message: 'คุณต้องการยกเลิก Ticket นี้ใช่หรือไม่?'
                      });
                      if (!confirmed) return;
                      
                      setStatusUpdating('cancelled');
                      try {
                        await updateTicketStatus(detailTicket.id, 'cancelled');
                        await loadData(true, true);
                        if (reloadTickets) {
                          await reloadTickets();
                        }
                        addToast('ยกเลิก Ticket เรียบร้อยแล้ว', 'success');
                      } catch (err) {
                        console.error(err);
                        addToast(`ยกเลิก Ticket ล้มเหลว: ${err.message || err}`, 'error');
                      } finally {
                        setStatusUpdating(null);
                      }
                    }}
                    disabled={statusUpdating !== null}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1.5px solid rgba(239, 68, 68, 0.25)',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-md)',
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: (statusUpdating !== null) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: (statusUpdating !== null) ? 0.4 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    onMouseEnter={e => { if (statusUpdating === null) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                    onMouseLeave={e => { if (statusUpdating === null) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                  >
                    {statusUpdating === 'cancelled' ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        กำลังยกเลิก...
                      </>
                    ) : (
                      'ยกเลิก Ticket'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Chat & Control Panel */}
          <div className="detail-right-column-wrapper">
            <div className="detail-right-column" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}>
              {/* Right Column: Chat & Timeline */}
              <div className="detail-chat-card" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                maxHeight: 'clamp(400px, 70vh, 760px)'
              }}>
              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-comments" style={{ color: 'var(--primary)' }}></i> ประวัติแชท & บันทึก
                </div>
                
                {/* Tab Selector (ปุ่มแยกแชทกับระบบ) */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-main)', padding: 4, borderRadius: 10, border: '1px solid var(--border-light)', width: 'fit-content' }}>
                  <button
                    type="button"
                    onClick={() => setActiveChatTab('chat')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: activeChatTab === 'chat' ? 'var(--bg-card)' : 'transparent',
                      color: activeChatTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: activeChatTab === 'chat' ? 800 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                      boxShadow: activeChatTab === 'chat' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <i className="fa-solid fa-comments"></i>
                    <span>แชทสนทนา</span>
                    <span style={{
                      background: activeChatTab === 'chat' ? 'var(--primary-bg)' : 'var(--border-light)',
                      color: activeChatTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)',
                      padding: '1px 6px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700
                    }}>{chatTimeline.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChatTab('system')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: activeChatTab === 'system' ? 'var(--bg-card)' : 'transparent',
                      color: activeChatTab === 'system' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: activeChatTab === 'system' ? 800 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                      boxShadow: activeChatTab === 'system' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    <span>ประวัติระบบ</span>
                    <span style={{
                      background: activeChatTab === 'system' ? 'var(--primary-bg)' : 'var(--border-light)',
                      color: activeChatTab === 'system' ? 'var(--primary)' : 'var(--text-muted)',
                      padding: '1px 6px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700
                    }}>{systemTimeline.length}</span>
                  </button>
                </div>
              </div>

              {/* Message Area - scrollable for both chat and system tabs */}
              <div 
                ref={chatContainerRef}
                style={{
                  flex: '1 1 0',
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  paddingRight: 4
                }}
              >
                {filteredTimeline.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    {activeChatTab === 'chat' ? (
                      <>
                        <i className="fa-solid fa-message-slash" style={{ fontSize: 24, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                        ไม่มีประวัติการพูดคุยสนทนา
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 24, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                        ไม่มีประวัติการอัปเดตระบบ
                      </>
                    )}
                  </div>
                ) : (
                  (() => {
                    const { lastReadCommentIndex, lastSentCommentIndex } = (() => {
                      let lastReadIdx = -1;
                      let lastSentIdx = -1;
                      for (let i = filteredTimeline.length - 1; i >= 0; i--) {
                        const it = filteredTimeline[i];
                        const isSystem = it.event.includes('ระบบ:') || it.event.includes('🔄') || it.actor === 'System';
                        const isMe = currentUser && it.actor === currentUser.name;
                        const isTemp = it.isUploading || (it.id && String(it.id).startsWith('temp-'));
                        if (!isSystem && isMe && !isTemp) {
                          if (it.readAt && lastReadIdx === -1) {
                            lastReadIdx = i;
                          }
                          if (!it.readAt && lastSentIdx === -1) {
                            lastSentIdx = i;
                          }
                        }
                      }
                      return { lastReadCommentIndex: lastReadIdx, lastSentCommentIndex: lastSentIdx };
                    })();

                    return filteredTimeline.map((item, index) => {
                    const isSystem = item.event.includes('ระบบ:') || item.event.includes('🔄') || item.actor === 'System';
                    
                    if (isSystem) {
                      const hasSystemLabel = item.event.includes('ระบบ:');
                      let displayEvent = item.event;
                      let labelElement = null;

                      if (hasSystemLabel) {
                        const indexSplit = item.event.indexOf('ระบบ:');
                        const prefix = item.event.substring(0, indexSplit).trim();
                        const suffix = item.event.substring(indexSplit + 5).trim(); // "ระบบ:" is 5 chars
                        
                        labelElement = (
                          <>
                            {prefix ? <span style={{ marginRight: 6 }}>{renderTextWithIcons(prefix)}</span> : null}
                            <strong style={{ color: 'var(--primary)', fontWeight: 800, marginRight: 6, fontSize: '13px' }}>ระบบ:</strong>
                          </>
                        );
                        displayEvent = suffix;
                      }

                      return (
                        <div key={index} style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 12.5,
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <i className="fa-solid fa-gears" style={{ marginTop: 3, flexShrink: 0, color: 'var(--primary)', opacity: 0.8 }}></i>
                          <div style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>
                            <div style={{ color: 'var(--text-secondary)' }}>
                              {labelElement}
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                {renderTextWithIcons(displayEvent)}
                              </span>
                            </div>
                            <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                              {item.time}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const isMe = currentUser && item.actor === currentUser.name;
                    const prevItem = index > 0 ? filteredTimeline[index - 1] : null;
                    const prevIsSystem = prevItem && (prevItem.event.includes('ระบบ:') || prevItem.event.includes('🔄') || prevItem.actor === 'System');
                    const isConsecutive = prevItem && !isSystem && !prevIsSystem && prevItem.actor === item.actor;
                    const isCommentEditable = isMe && item.id && item.event !== "ส่งรูปภาพประกอบ" && item.event !== "ยกเลิกการส่งข้อความแล้ว" && !item.event.includes('ระบบ:') && !item.event.includes('🔄');
                    const isCommentDeletable = isMe && item.id && item.event !== "ยกเลิกการส่งข้อความแล้ว" && !item.event.includes('ระบบ:') && !item.event.includes('🔄');
                    const isEdited = item.isEdited;
                    const isBeingEdited = editingCommentId === item.id;
                    const anyCommentEditing = !!editingCommentId;

                    return (
                      <div key={index} className="chat-message-row" style={{ 
                        display: 'flex', 
                        gap: 10, 
                        alignItems: 'flex-start', 
                        flexDirection: isMe ? 'row-reverse' : 'row',
                        marginTop: isConsecutive ? -8 : 0,
                        opacity: anyCommentEditing ? (isBeingEdited ? 1 : 0.45) : 1,
                        transition: 'opacity 0.25s ease'
                      }}>
                        {isConsecutive ? (
                          <div style={{ width: 28, height: 28, flexShrink: 0 }} />
                        ) : (
                          <CommentAvatar actor={item.actor} actorAvatar={item.actorAvatar} isMe={isMe} />
                        )}
                        <div className="chat-bubble-container" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          {!isConsecutive && (
                            <div className="chat-message-meta" style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{item.actor}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.time}</span>
                            </div>
                          )}
                          {isEdited && (
                            <span style={{ fontSize: 9.5, color: '#3b82f6', fontWeight: 600, marginBottom: 2, marginRight: isMe ? 4 : 0, marginLeft: isMe ? 0 : 4 }}>
                              แก้ไขแล้ว
                            </span>
                          )}
                          <div className={`bubble-wrapper ${isMe ? 'bubble-wrapper-me' : 'bubble-wrapper-other'}`} style={{ position: 'relative' }}>
                            <>
                              {(() => {
                                const isUnsent = item.event === "ยกเลิกการส่งข้อความแล้ว";
                                return (
                                  <div className="chat-bubble" style={{
                                      background: isUnsent ? 'rgba(0,0,0,0.02)' : ((item.event === "ส่งรูปภาพประกอบ" && item.attachmentUrl) ? 'transparent' : (isMe ? 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' : 'var(--bg-main)')),
                                      border: isUnsent ? '1px dashed var(--border)' : ((item.event === "ส่งรูปภาพประกอบ" && item.attachmentUrl) ? 'none' : (isMe ? 'none' : '1px solid var(--border-light)')),
                                      borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                      padding: (item.event === "ส่งรูปภาพประกอบ" && item.attachmentUrl) ? '0' : '10px 12px',
                                      fontSize: 13,
                                      color: isUnsent ? 'var(--text-muted)' : (isMe ? '#ffffff' : 'var(--text-secondary)'),
                                      fontStyle: isUnsent ? 'italic' : 'normal',
                                      wordBreak: 'break-word',
                                      lineHeight: 1.4,
                                      boxShadow: isUnsent ? 'none' : ((item.event === "ส่งรูปภาพประกอบ" && item.attachmentUrl) ? 'none' : (isMe ? '0 2px 8px rgba(37,99,235,0.15)' : 'none')),
                                      textAlign: 'left',
                                      cursor: isCommentDeletable ? 'pointer' : 'default',
                                      userSelect: 'none',
                                      WebkitUserSelect: 'none',
                                      WebkitTouchCallout: 'none'
                                    }}
                                    onTouchStart={isCommentDeletable ? handleLongPressStart(item.id, item.event) : undefined}
                                    onTouchEnd={isCommentDeletable ? handleLongPressEnd(item.id) : undefined}
                                    onTouchMove={isCommentDeletable ? handleLongPressEnd(item.id) : undefined}
                                  >
                                    {isUnsent ? (
                                      <span>{isMe ? "คุณได้ยกเลิกการส่งข้อความนี้" : `${item.actor} ได้ยกเลิกการส่งข้อความนี้`}</span>
                                    ) : (
                                      <>
                                        {item.event !== "ส่งรูปภาพประกอบ" && renderTextWithIcons(item.event)}
                                        
                                        {item.attachmentUrl && (
                                          <div style={{ marginTop: (item.event === "ส่งรูปภาพประกอบ") ? 0 : 8 }}>
                                            <SafeImage 
                                              src={item.attachmentUrl} 
                                              alt="แชทประกอบ" 
                                              style={{ maxWidth: 180, minWidth: 120, maxHeight: 150, minHeight: 90, borderRadius: 8 }} 
                                              onClick={item.isUploading ? undefined : () => setViewImage(item.attachmentUrl)}
                                              overlayIcon={item.isUploading ? null : "magnifying-glass-plus"}
                                              isUploading={item.isUploading}
                                              fallbackSrc={
                                                lastUploadedFileRef.current && 
                                                item.attachmentUrl && 
                                                item.attachmentUrl.endsWith(lastUploadedFileRef.current.name)
                                                  ? lastUploadedFileRef.current.blobUrl
                                                  : null
                                              }
                                            />
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })()}

                                {isCommentDeletable && (
                                  <div style={{ position: 'relative', display: 'flex', alignSelf: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                         const rect = e.currentTarget.getBoundingClientRect();
                                         const container = chatContainerRef.current;
                                         if (container) {
                                           const containerRect = container.getBoundingClientRect();
                                           const distanceToTop = rect.top - containerRect.top;
                                           if (distanceToTop < 110) {
                                             setMenuDirection('down');
                                           } else {
                                             setMenuDirection('up');
                                           }
                                         } else {
                                           setMenuDirection('up');
                                         }
                                         setOpenMenuCommentId(openMenuCommentId === item.id ? null : item.id);
                                      }}
                                      className="comment-menu-trigger-btn"
                                      title="เมนูข้อความ"
                                    >
                                      <i className="fa-solid fa-ellipsis-vertical" style={{ fontSize: 13 }} />
                                    </button>
                                    
                                    {openMenuCommentId === item.id && (
                                      <div className="comment-menu-dropdown" style={menuDirection === 'down' ? { top: 'calc(100% + 4px)', bottom: 'auto' } : {}}>
                                        {isCommentEditable && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingCommentId(item.id);
                                              setCommentText(item.event);
                                              setOpenMenuCommentId(null);
                                              setTimeout(() => {
                                                if (chatInputRef.current) {
                                                  chatInputRef.current.focus();
                                                }
                                              }, 50);
                                            }}
                                          >
                                            <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
                                            <span>แก้ไขข้อความ</span>
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleDeleteCommentAction(item.id);
                                            setOpenMenuCommentId(null);
                                          }}
                                          className="delete-action"
                                        >
                                          <i className="fa-solid fa-trash" style={{ fontSize: 11 }} />
                                          <span>ยกเลิกการส่ง</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            <span className="bubble-time-hover">
                              {item.time ? item.time.trim().split(' ').pop() : ''}
                            </span>
                          </div>
                           {isMe && (index === lastReadCommentIndex || index === lastSentCommentIndex) && (
                             <div style={{ fontSize: 9.5, color: '#8a8d91', marginTop: 0, marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                               {index === lastReadCommentIndex ? (
                                 <span style={{ color: '#8a8d91', fontWeight: 500 }} title={`อ่านเมื่อ: ${item.readAt}`}>อ่านแล้ว</span>
                               ) : (
                                 <span>ส่งแล้ว</span>
                               )}
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })
                })()
              )}
              </div>

              {/* Input Form at Bottom */}
              {detailTicket.status !== 'cancelled' && detailTicket.status !== 'closed' && (
                <form onSubmit={handlePostComment} style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  {/* Image Preview Thumbnail (above input field like Facebook) */}
                  {commentFile && commentFilePreview && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0 4px 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Thumbnail Preview */}
                        <div style={{ 
                          position: 'relative', 
                          width: 68, 
                          height: 68, 
                          borderRadius: '8px', 
                          overflow: 'hidden', // changed to hidden so the loading overlay doesn't spill out
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-main)',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <img 
                            src={commentFilePreview} 
                            alt="preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                          />
                          
                          {/* Image Uploading Loading Overlay */}
                          {postingComment && (
                            <div style={{
                              position: 'absolute',
                              top: 0, left: 0, right: 0, bottom: 0,
                              background: 'rgba(15, 23, 42, 0.65)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                              zIndex: 10,
                              backdropFilter: 'blur(1px)',
                              WebkitBackdropFilter: 'blur(1px)'
                            }}>
                              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 16, color: 'var(--primary-light)' }} aria-hidden="true" />
                              <span style={{ fontSize: 9, color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>กำลังส่ง...</span>
                            </div>
                          )}

                          {/* Remove button (Only show when not uploading) */}
                          {!postingComment && (
                            <button
                              type="button"
                              onClick={() => setCommentFile(null)}
                              style={{
                                position: 'absolute',
                                top: 2, right: 2,
                                width: 18, height: 18,
                                borderRadius: '50%',
                                background: 'var(--danger)',
                                border: 'none',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 9,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                                transition: 'transform 0.15s',
                                zIndex: 11
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              title="ลบรูปภาพ"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                        
                        {/* File info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all', maxWidth: '180px' }}>
                            {commentFile.name}
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                            {(commentFile.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingCommentId && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px 4px 8px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '2px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>กำลังแก้ไขข้อความ</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingCommentId(null);
                          setCommentText('');
                        }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '4px 10px', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* File attach button */}
                    <button 
                      type="button"
                      onClick={() => chatFileRef.current?.click()}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                      title="แนบรูปภาพ"
                    >
                      <i className="fa-solid fa-paperclip" style={{ fontSize: 12, color: 'var(--text-muted)' }}></i>
                    </button>
                    <input 
                      ref={chatFileRef}
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setCommentFile(file);
                          setTimeout(() => {
                            chatInputRef.current?.focus();
                          }, 50);
                        }
                        e.target.value = '';
                      }}
                    />

                    {/* Input message */}
                    <input
                      ref={chatInputRef}
                      type="text"
                      placeholder="พิมพ์ข้อความตอบกลับ..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        padding: '8px 0'
                      }}
                    />

                    {/* Submit icon */}
                    <button 
                      type="submit" 
                      disabled={postingComment || (!commentText.trim() && !commentFile)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%',
                        background: (commentText.trim() || commentFile) ? 'var(--primary)' : 'var(--border)',
                        border: 'none',
                        color: '#fff',
                        cursor: (commentText.trim() || commentFile) ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                      }}
                    >
                      <i className="fa-solid fa-paper-plane" style={{ fontSize: 11 }}></i>
                    </button>


                  </div>

                </form>
              )}
            </div>

            {/* Staff Control Panel / Assignee Info */}
            <div className="detail-control-card" style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {hasStaffPrivileges ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
                    <i className="fa-solid fa-shield-halved" style={{ color: 'var(--success)', fontSize: 16 }}></i>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>แผงควบคุมเจ้าหน้าที่</h2>
                  </div>

                  <div className="detail-control-actions" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    alignItems: 'stretch'
                  }}>
                    {/* Top Section: Action Buttons */}
                    <div className="detail-control-buttons-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        จัดการสถานะ {!canControl ? `(เฝ้าดูอย่างเดียว — เคสนี้${detailTicket.assignedTo && detailTicket.assignedTo !== 'รอมอบหมาย' ? `เป็นของ${detailTicket.assignedTo}` : 'ยังไม่มีผู้รับผิดชอบ'})` : `(สำหรับคุณ — ${currentUser?.name})`}
                      </span>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {((!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') && canClaim) ? (
                          <span style={{ fontSize: 13, color: 'var(--danger)', fontStyle: 'italic', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <i className="fa-solid fa-circle-exclamation"></i> กรุณากดปุ่ม "รับผิดชอบงานนี้" ขวาก่อนเพื่อจัดการสถานะตั๋ว
                          </span>
                        ) : (
                          <>
                            {[
                              { statusVal: 'progress', label: 'เริ่มดำเนินการ', icon: 'fa-play', color: '#2563eb', bg: 'rgba(37,99,235,0.06)' },
                              { statusVal: 'wait-approve', label: 'ขออนุมัติ', icon: 'fa-hourglass-half', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
                              { statusVal: 'wait-parts', label: 'รออะไหล่', icon: 'fa-wrench', color: '#b45309', bg: 'rgba(245,158,11,0.06)' },
                              { statusVal: 'resolved', label: 'แก้ไขแล้ว', icon: 'fa-circle-check', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                            ].filter(btn => {
                              // Managers and Admins do not need to request approval (wait-approve)
                              if (btn.statusVal === 'wait-approve' && (role === ROLES.MANAGER || role === ROLES.ADMIN)) {
                                return false;
                              }
                              return true;
                            }).map((btn) => {
                              const isCurrent = detailTicket.status === btn.statusVal;
                              const isUpdating = statusUpdating === btn.statusVal;
                              const isDisabled = !canControl || isCurrent || ['resolved', 'closed'].includes(detailTicket.status) || statusUpdating !== null;

                              let btnBg = 'transparent';
                              let btnColor = isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)';
                              let btnBorder = `1.5px solid ${isDisabled ? 'var(--border-light)' : 'var(--border-strong)'}`;
                              let btnShadow = 'none';
                              let btnOpacity = isDisabled ? 0.4 : 1;

                              if (isCurrent) {
                                btnBg = btn.color;
                                btnColor = '#ffffff';
                                btnBorder = `1.5px solid ${btn.color}`;
                                btnShadow = `0 4px 12px ${btn.color}40`;
                                btnOpacity = 1;
                              } else if (isUpdating) {
                                btnBg = btn.bg;
                                btnColor = btn.color;
                                btnBorder = `1.5px solid ${btn.color}`;
                                btnOpacity = 1;
                              }

                              return (
                                <button
                                  key={btn.statusVal}
                                  onClick={async () => {
                                    if (isDisabled) return;
                                    const confirmed = await showCustomConfirm({
                                      title: 'ยืนยันการเปลี่ยนสถานะ',
                                      message: `คุณต้องการเปลี่ยนสถานะของ Ticket เป็น "${btn.label}" ใช่หรือไม่?`
                                    });
                                    if (!confirmed) return;
                                    
                                    setStatusUpdating(btn.statusVal);
                                    try {
                                      await updateTicketStatus(detailTicket.id, btn.statusVal);
                                      await loadData(true, true);
                                      if (reloadTickets) {
                                        await reloadTickets();
                                      }
                                      addToast(`เปลี่ยนสถานะเป็น "${btn.label}" เรียบร้อยแล้ว`, 'success');
                                    } catch (err) {
                                      console.error(err);
                                      addToast(`เปลี่ยนสถานะล้มเหลว: ${err.message || err}`, 'error');
                                    } finally {
                                      setStatusUpdating(null);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: btnBg,
                                    color: btnColor,
                                    border: btnBorder,
                                    boxShadow: btnShadow,
                                    padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                                    opacity: btnOpacity,
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.18s',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={e => {
                                    if (!isDisabled && !isCurrent && !isUpdating) {
                                      e.currentTarget.style.background = btn.bg;
                                      e.currentTarget.style.color = btn.color;
                                      e.currentTarget.style.borderColor = btn.color;
                                      e.currentTarget.style.boxShadow = `0 4px 10px ${btn.color}15`;
                                    }
                                  }}
                                  onMouseLeave={e => {
                                    if (!isDisabled && !isCurrent && !isUpdating) {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.color = 'var(--text-secondary)';
                                      e.currentTarget.style.borderColor = 'var(--border-strong)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }
                                  }}
                                >
                                  {isUpdating ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                  ) : (
                                    <>
                                      {isCurrent && <i className="fa-solid fa-check" style={{ marginRight: -2 }}></i>}
                                      <i className={`fa-solid ${btn.icon}`}></i>
                                    </>
                                  )}
                                  <span>{btn.label}{isCurrent ? ' (ปัจจุบัน)' : ''}</span>
                                </button>
                              );
                            })}

                            <button
                              onClick={() => setShowTransferForm(true)}
                              disabled={!canTransfer || statusUpdating !== null}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border-light)',
                                color: (!canTransfer || statusUpdating !== null) ? 'var(--text-muted)' : 'var(--text-secondary)',
                                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                                opacity: (!canTransfer || statusUpdating !== null) ? 0.4 : 1,
                                cursor: (!canTransfer || statusUpdating !== null) ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <i className="fa-solid fa-circle-arrow-right"></i> ส่งต่อไปแผนกอื่น
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Section: Agent Claim/Release */}
                    <div className="detail-control-assignee-wrapper" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: 14,
                      flexWrap: 'wrap',
                    }}>
                      {/* Agent Profile display */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          เจ้าหน้าที่ผู้รับผิดชอบ
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <UserAvatar name={detailTicket.assignedTo} avatarUrl={detailTicket.agentAvatar} />
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                              {detailTicket.assignedTo || 'รอมอบหมาย'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {(!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? 'รอเจ้าหน้าที่รับเคส' : 'เจ้าหน้าที่ผู้ดูแล'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Claim / Release button */}
                      {(!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? (
                        canClaim && (
                          <button
                            onClick={async () => {
                              if (!currentUser || statusUpdating !== null) return;
                              const confirmed = await showCustomConfirm({
                                title: 'ยืนยันการรับผิดชอบงาน',
                                message: 'คุณต้องการรับผิดชอบ Ticket นี้ใช่หรือไม่?'
                              });
                              if (!confirmed) return;
                              setStatusUpdating('claim');
                              try {
                                await assignTicket(detailTicket.id, currentUser.id);
                                await loadData(true, true);
                                if (reloadTickets) {
                                  await reloadTickets();
                                }
                                addToast('รับผิดชอบงานสำเร็จเรียบร้อยแล้ว', 'success');
                              } catch (err) {
                                console.error(err);
                                addToast(`รับผิดชอบงานล้มเหลว: ${err.message || err}`, 'error');
                              } finally {
                                setStatusUpdating(null);
                              }
                            }}
                            disabled={statusUpdating !== null}
                            style={{
                              background: 'var(--primary)', border: 'none', color: '#fff',
                              borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 800,
                              cursor: (statusUpdating !== null) ? 'not-allowed' : 'pointer',
                              transition: 'background 0.2s',
                              opacity: (statusUpdating !== null) ? 0.4 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => { if (statusUpdating === null) e.currentTarget.style.background = 'var(--primary-light)'; }}
                            onMouseLeave={e => { if (statusUpdating === null) e.currentTarget.style.background = 'var(--primary)'; }}
                          >
                            {statusUpdating === 'claim' ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                กำลังดำเนินการ...
                              </>
                            ) : (
                              'รับผิดชอบงานนี้'
                            )}
                          </button>
                        )
                      ) : (
                        <>
                          <div className="detail-control-assignee-buttons" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {(detailTicket.assignedTo === currentUser?.name || role === ROLES.ADMIN || role === ROLES.MANAGER) && (
                              <button
                                onClick={async () => {
                                  if (statusUpdating !== null) return;
                                  const confirmed = await showCustomConfirm({
                                    title: 'ยืนยันการยกเลิกรับงาน',
                                    message: 'คุณต้องการยกเลิกรับงานนี้และให้ Ticket กลับไปสถานะรอมอบหมายใช่หรือไม่?'
                                  });
                                  if (!confirmed) return;
                                  setStatusUpdating('release');
                                  try {
                                    await assignTicket(detailTicket.id, null);
                                    await loadData(true, true);
                                    if (reloadTickets) {
                                      await reloadTickets();
                                    }
                                    addToast('ยกเลิกรับงานสำเร็จเรียบร้อยแล้ว', 'success');
                                  } catch (err) {
                                    console.error(err);
                                    addToast(`ยกเลิกรับงานล้มเหลว: ${err.message || err}`, 'error');
                                  } finally {
                                    setStatusUpdating(null);
                                  }
                                }}
                                disabled={statusUpdating !== null}
                                style={{
                                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)',
                                  borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 800,
                                  cursor: (statusUpdating !== null) ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  opacity: (statusUpdating !== null) ? 0.4 : 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={e => { if (statusUpdating === null) e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                                onMouseLeave={e => { if (statusUpdating === null) e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                              >
                                {statusUpdating === 'release' ? (
                                  <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    กำลังดำเนินการ...
                                  </>
                                ) : (
                                  'ยกเลิกรับงาน'
                                )}
                              </button>
                            )}
                             {canTakeover && !['resolved', 'closed', 'cancelled'].includes(detailTicket.status) && (
                              <>
                                <button
                                  onClick={async () => {
                                    if (statusUpdating !== null) return;
                                    const confirmed = await showCustomConfirm({
                                      title: 'ยืนยันการรับช่วงงานแทน',
                                      message: `คุณต้องการรับช่วงต่อดูแล Ticket นี้แทน ${detailTicket.assignedTo} ใช่หรือไม่?`
                                    });
                                    if (!confirmed) return;
                                    
                                    setStatusUpdating('takeover');
                                    try {
                                      await assignTicket(detailTicket.id, currentUser.id);
                                      await loadData(true, true);
                                      if (reloadTickets) {
                                        await reloadTickets();
                                      }
                                      addToast(`รับช่วงต่อดูแล Ticket นี้เรียบร้อยแล้ว`, 'success');
                                    } catch (err) {
                                      console.error(err);
                                      addToast(`รับช่วงต่อล้มเหลว: ${err.message || err}`, 'error');
                                    } finally {
                                      setStatusUpdating(null);
                                    }
                                  }}
                                  disabled={statusUpdating !== null}
                                  style={{
                                    background: 'var(--primary)', border: 'none', color: '#fff',
                                    borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 800,
                                    cursor: (statusUpdating !== null) ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    opacity: (statusUpdating !== null) ? 0.4 : 1,
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={e => { if (statusUpdating === null) e.currentTarget.style.background = 'var(--primary-light)'; }}
                                  onMouseLeave={e => { if (statusUpdating === null) e.currentTarget.style.background = 'var(--primary)'; }}
                                >
                                  {statusUpdating === 'takeover' ? (
                                    <>
                                      <i className="fa-solid fa-spinner fa-spin"></i> รับช่วงงาน...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-arrows-spin"></i> รับช่วงงานแทน
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (statusUpdating !== null) return;
                                    const note = await showCustomConfirm({
                                      title: 'เหตุผลในการยกเลิก Ticket แทน',
                                      message: `กรุณาระบุเหตุผลในการยกเลิก Ticket แทน ${detailTicket.assignedTo}:`,
                                      showInput: true,
                                      inputPlaceholder: 'ระบุเหตุผลที่นี่...',
                                      requiredInput: true
                                    });
                                    if (note !== null) {
                                      setStatusUpdating('cancelled-colleague');
                                      try {
                                        await updateTicketStatus(detailTicket.id, 'cancelled', note || 'ยกเลิกแทนผู้รับผิดชอบหลักที่ไม่อยู่ปฏิบัติงาน');
                                        await loadData(true, true);
                                        if (reloadTickets) {
                                          await reloadTickets();
                                        }
                                        addToast('ยกเลิก Ticket แทนผู้รับผิดชอบเรียบร้อยแล้ว', 'success');
                                      } catch (err) {
                                        console.error(err);
                                        addToast(`ยกเลิก Ticket ล้มเหลว: ${err.message || err}`, 'error');
                                      } finally {
                                        setStatusUpdating(null);
                                      }
                                    }
                                  }}
                                  disabled={statusUpdating !== null}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1.5px solid rgba(239, 68, 68, 0.25)',
                                    color: 'var(--danger)',
                                    borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 800,
                                    cursor: (statusUpdating !== null) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    opacity: (statusUpdating !== null) ? 0.4 : 1,
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={e => { if (statusUpdating === null) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                                  onMouseLeave={e => { if (statusUpdating === null) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                                >
                                  {statusUpdating === 'cancelled-colleague' ? (
                                    <>
                                      <i className="fa-solid fa-spinner fa-spin"></i> กำลังยกเลิก...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-ban"></i> ยกเลิก Ticket แทน
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
                    <i className="fa-solid fa-user-shield" style={{ color: 'var(--primary)', fontSize: 16 }}></i>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>เจ้าหน้าที่ผู้รับผิดชอบดูแล</h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                    <UserAvatar name={detailTicket.assignedTo} avatarUrl={detailTicket.agentAvatar} size={40} />
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {detailTicket.assignedTo || 'รอมอบหมาย'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {(!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? 'อยู่ระหว่างรอเจ้าหน้าที่รับเรื่องและมอบหมายงาน' : 'เจ้าหน้าที่ผู้ดูแลและแก้ไขตั๋วปัญหา'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>
        </div>
        )}

        {/* Manager/Admin Approval Section */}
        {needsManagerApproval && !reloading && !statusUpdating ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1.5px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: 'var(--shadow-sm)',
            marginTop: 8,
            marginBottom: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
              <i className="fa-solid fa-stamp" style={{ color: 'var(--primary)', fontSize: 16 }}></i>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>การพิจารณาอนุมัติคำขอ</h2>
            </div>
            
            {canApprove ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Ticket นี้อยู่ในหมวดหมู่ที่ต้องการการอนุมัติก่อนดำเนินการ กรุณาป้อนข้อเสนอแนะหรือหมายเหตุ (ถ้ามี) แล้วเลือกดำเนินการ:
                </p>
                <textarea
                  placeholder="ป้อนความเห็นการอนุมัติ / เหตุผลในการปฏิเสธ (ไม่บังคับ)..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'var(--bg-main)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    id="btn-approve-ticket"
                    onClick={async () => {
                      try {
                        await approveTicket(detailTicket.id, true, approvalNote);
                        setApprovalNote('');
                        await loadData(true, true);
                        await reloadTickets();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    style={{
                      background: 'var(--success)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 'var(--radius-lg)',
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 4px rgba(16,185,129,0.1)'
                    }}
                  >
                    <i className="fa-solid fa-check"></i> อนุมัติ Ticket
                  </button>
                  <button
                    id="btn-reject-ticket"
                    onClick={async () => {
                      if (!approvalNote || !approvalNote.trim()) {
                        addToast('กรุณาระบุเหตุผลในการปฏิเสธการขออนุมัติ', 'error');
                        return;
                      }
                      try {
                        await approveTicket(detailTicket.id, false, approvalNote);
                        setApprovalNote('');
                        await loadData(true, true);
                        await reloadTickets();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    style={{
                      background: 'var(--danger)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 'var(--radius-lg)',
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 4px rgba(239,68,68,0.1)'
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i> ปฏิเสธ Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(245, 158, 11, 0.04)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#d97706'
              }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 16 }}></i>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  Ticket นี้ต้องการการพิจารณาอนุมัติจากหัวหน้าแผนกก่อนที่เจ้าหน้าที่จะเริ่มดำเนินการแก้ไข
                </div>
              </div>
            )}
          </div>
        ) : (
          (detailTicket.managerApproval === 'rejected' || detailTicket.status === 'rejected') && !reloading && !statusUpdating && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1.5px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: 'var(--shadow-sm)',
              marginTop: 8,
              marginBottom: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
                <i className="fa-solid fa-circle-xmark" style={{ fontSize: 18 }}></i>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>คำขอรับบริการนี้ถูกปฏิเสธแล้ว</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                ตั๋วปัญหานี้ได้รับการพิจารณาและมีผลการตัดสินคือ <strong>"ปฏิเสธ (Rejected)"</strong> ส่งผลให้การดำเนินการแก้ไขปัญหาของเจ้าหน้าที่ถูกระงับ
              </p>
              {detailTicket.approvalNote && (
                <div style={{
                  background: 'var(--bg-main)',
                  borderLeft: '4px solid var(--danger)',
                  padding: '12px 16px',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  fontStyle: 'italic'
                }}>
                  <strong>เหตุผล/หมายเหตุจากผู้อนุมัติ:</strong> {detailTicket.approvalNote}
                </div>
              )}
            </div>
          )
        )}


      </div>

      {showTransferForm && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>ส่งต่อ Ticket ไปแผนกอื่น</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>เปลี่ยนความรับผิดชอบ Ticket เพื่อแก้ไขปัญหาอย่างถูกจุด</p>
              </div>
              <button
                onClick={() => {
                  setShowTransferForm(false);
                  setTransferDeptId('');
                  setTransferNote('');
                  setTransferDeptSearch('');
                  setShowTransferDeptDropdown(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>

            {/* Target Department Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} ref={transferDeptDropdownRef}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>เลือกแผนกเป้าหมาย</label>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => {
                    setTransferDeptSearch('');
                    setShowTransferDeptDropdown(!showTransferDeptDropdown);
                  }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer',
                    background: 'var(--bg-main)',
                    border: showTransferDeptDropdown ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px 12px 44px',
                    minHeight: '44px',
                    userSelect: 'none',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                  id="transfer-department-dropdown-trigger"
                >
                  <i className="fa-solid fa-building" style={{
                    position: 'absolute',
                    left: '16px',
                    color: 'var(--text-muted)',
                    fontSize: '16px',
                    pointerEvents: 'none'
                  }}></i>
                  <span style={{ color: transferDeptId ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '14px' }}>
                    {deptsList.find(d => String(d.id) === String(transferDeptId))?.name || '-- เลือกแผนกที่ต้องการส่งต่อ --'}
                  </span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, color: 'var(--text-muted)' }} aria-hidden="true"></i>
                </div>

                {showTransferDeptDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 100,
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      animation: 'fadeIn 0.12s ease',
                    }}
                  >
                    {/* Search Input Inside the Dropdown Menu */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="พิมพ์เพื่อค้นหาแผนก..."
                        value={transferDeptSearch}
                        onChange={(e) => setTransferDeptSearch(e.target.value)}
                        style={{ 
                          width: '100%', 
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '8px 32px 8px 12px',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                        autoFocus
                        autoComplete="off"
                        onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking the search box
                      />
                      <i 
                        className="fa-solid fa-magnifying-glass" 
                        style={{ 
                          position: 'absolute', 
                          right: 12, 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: 'var(--text-muted)', 
                          fontSize: 12 
                        }} 
                        aria-hidden="true"
                      ></i>
                    </div>

                    {/* Options List */}
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {deptsLoadError ? (
                        <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} aria-hidden="true"></i>
                          โหลดข้อมูลแผนกล้มเหลว: {deptsLoadError}
                        </div>
                      ) : deptsList
                        .filter(d => d.name !== detailTicket.targetDepartment)
                        .filter(d => d.name !== detailTicket.department)
                        .filter(d => d.name.toLowerCase().includes(transferDeptSearch.toLowerCase())).length === 0 ? (
                        <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} aria-hidden="true"></i>
                          ไม่พบแผนกที่ค้นหา
                        </div>
                      ) : (
                        deptsList
                          .filter(d => d.name !== detailTicket.targetDepartment)
                          .filter(d => d.name !== detailTicket.department)
                          .filter(d => d.name.toLowerCase().includes(transferDeptSearch.toLowerCase()))
                          .map(d => {
                            const isSelected = String(transferDeptId) === String(d.id);
                            return (
                              <button
                                type="button"
                                key={d.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTransferDeptId(d.id);
                                  setTransferDeptSearch('');
                                  setShowTransferDeptDropdown(false);
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: isSelected ? 'var(--primary-pale)' : 'transparent',
                                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                  fontSize: 13.5,
                                  fontWeight: isSelected ? 700 : 500,
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-main)';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <span>{d.name}</span>
                                {isSelected && <i className="fa-solid fa-check" style={{ fontSize: 11 }} aria-hidden="true"></i>}
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Note Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>เหตุผลในการส่งต่อ (บันทึกลงประวัติ)</label>
              <textarea
                value={transferNote}
                onChange={e => setTransferNote(e.target.value)}
                placeholder="ระบุเหตุผลในการส่งมอบงาน เพื่อให้แผนกปลายทางเข้าใจรายละเอียด..."
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.5',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowTransferForm(false);
                  setTransferDeptId('');
                  setTransferNote('');
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={transferring || !transferDeptId}
                style={{
                  flex: 1,
                  background: (!transferDeptId || transferring) ? 'rgba(37, 99, 235, 0.5)' : 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (!transferDeptId || transferring) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  if (transferDeptId && !transferring) {
                    e.currentTarget.style.background = 'var(--primary-light)';
                  }
                }}
                onMouseLeave={e => {
                  if (transferDeptId && !transferring) {
                    e.currentTarget.style.background = 'var(--primary)';
                  }
                }}
              >
                {transferring ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>กำลังส่งต่อ...</span>
                  </>
                ) : (
                  <span>ส่งต่อแผนก</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox zoom */}
      {viewImage && createPortal(
        <div 
          onClick={() => setViewImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={viewImage} 
            alt="ขยายใหญ่" 
            style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain', borderRadius: 8, boxShadow: 'var(--shadow-xl)' }} 
          />
          <button
            onClick={() => setViewImage(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', fontSize: 18, transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>,
        document.body
      )}


      

      {/* Message Actions Instagram-style Context Overlay for Mobile Long-press */}
      {showBottomSheet && createPortal(
        <div 
          onClick={() => setShowBottomSheet(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.25s ease-out'
          }}
          className="bottom-sheet-backdrop"
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              animation: 'scaleUpUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >

            {/* Standout Bubble Preview */}
            {(() => {
              const selectedComment = filteredTimeline.find(c => c.id === menuCommentId);
              const previewAttachmentUrl = selectedComment ? selectedComment.attachmentUrl : null;
              
              if (menuCommentText === "ส่งรูปภาพประกอบ" && previewAttachmentUrl) {
                return (
                  <div style={{
                    alignSelf: 'flex-end',
                    background: 'transparent',
                    borderRadius: '12px',
                    padding: '0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    maxWidth: '85%',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={previewAttachmentUrl} 
                      alt="ตัวอย่างรูปภาพ" 
                      style={{ maxWidth: 180, maxHeight: 150, borderRadius: 12, display: 'block', objectFit: 'cover' }} 
                    />
                  </div>
                );
              }
              
              return menuCommentText !== "ส่งรูปภาพประกอบ" ? (
                <div style={{
                  alignSelf: 'flex-end',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  borderRadius: '16px 0px 16px 16px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: '0 10px 25px rgba(37,99,235,0.25)',
                  wordBreak: 'break-word',
                  maxWidth: '85%'
                }}>
                  {menuCommentText}
                </div>
              ) : null;
            })()}

            {/* Premium Instagram Menu Container */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 24,
              padding: '8px 6px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {/* Header Date */}
              <div style={{
                padding: '8px 14px 6px 14px',
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-light)',
                marginBottom: 4
              }}>
                {(() => {
                  const item = filteredTimeline.find(c => c.id === menuCommentId);
                  return item ? item.time : 'วันที่แชท';
                })()}
              </div>



              {/* Edit Option */}
              {menuCommentText !== "ส่งรูปภาพประกอบ" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(menuCommentId);
                    setCommentText(menuCommentText);
                    setShowBottomSheet(false);
                    setTimeout(() => {
                      if (chatInputRef.current) {
                        chatInputRef.current.focus();
                      }
                    }, 50);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px',
                    borderRadius: 14, border: 'none', background: 'transparent', color: 'var(--text-primary)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <i className="fa-solid fa-arrow-rotate-left" style={{ fontSize: 15, width: 20 }} />
                  <span>แก้ไขข้อความ</span>
                </button>
              )}

              {/* Delete Option */}
              <button
                type="button"
                onClick={() => {
                  setShowBottomSheet(false);
                  handleDeleteCommentAction(menuCommentId);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px',
                  borderRadius: 14, border: 'none', background: 'transparent', color: 'var(--danger)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <i className="fa-regular fa-trash-can" style={{ fontSize: 15, width: 20 }} />
                <span>ยกเลิกการส่ง (ลบข้อความ)</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
