import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ROLES, ROLE_INFO } from './data/mockData';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TicketFormModal from './components/TicketFormModal';
import TicketDetailModal from './components/TicketDetailModal';
import Breadcrumbs from './components/Breadcrumbs';
import AppSkeleton from './components/AppSkeleton';
import { 
  DashboardSkeleton, 
  TicketsSkeleton, 
  ApprovalSkeleton, 
  SLASkeleton, 
  ProfileSkeleton,
  ReportsSkeleton,
  TableSkeleton
} from './components/PageSkeletons';

import DashboardView  from './views/DashboardView';
import MyTicketsView  from './views/MyTicketsView';
import ApprovalView   from './views/ApprovalView';
import SLAView        from './views/SLAView';
import LoginView      from './views/LoginView';
import ReportsView    from './views/ReportsView';
import SettingsView   from './views/SettingsView';
import ProfileView    from './views/ProfileView';
import NotFoundView   from './views/NotFoundView';
import { AnimatePresence, motion } from 'framer-motion';
import PageTransition from './components/PageTransition';

import { renderTextWithIcons } from './utils/render';

import ToastNotification from './components/ToastNotification';
import './index.css';


// ── Toast notifications ──
function ToastContainer() {
  const { toasts, removeToast } = useApp();
  
  return createPortal(
    <div className="toast-container">
      {toasts.map(t => {
        const msgContent = typeof t.msg === 'string' ? renderTextWithIcons(t.msg) : (t.msg?.props?.children || t.msg);
        const titleContent = typeof t.title === 'string' ? renderTextWithIcons(t.title) : t.title;
        return (
          <ToastNotification
            key={t.id}
            variant={t.type || "success"}
            title={titleContent || (t.type === 'error' ? 'เกิดข้อผิดพลาด' : t.type === 'warning' ? 'คำเตือน' : t.type === 'info' ? 'แจ้งเตือน' : 'สำเร็จ')}
            message={msgContent}
            onClose={() => removeToast(t.id)}
          />
        );
      })}
    </div>,
    document.body
  );
}

// ── Placeholder for pages not yet built ──
function PlaceholderView({ title, icon }) {
  return (
    <div className="view-placeholder">
      <div className="placeholder-icon"><i className={`fa-solid fa-${icon || 'wrench'}`}  aria-hidden="true"></i></div>
      <div className="no-access-title">{title}</div>
      <div className="no-access-desc">หน้านี้อยู่ระหว่างการพัฒนา</div>
    </div>
  );
}

// ── Topbar ──
function Topbar({ onCreateTicket }) {
  const { role, activeNav, setActiveNav, notifications, clearAllNotifications, markNotifAsRead, openTicketDetail, currentUser, setShowMobileSidebar } = useApp();
  const info = ROLE_INFO[role];
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifications.filter(n => n.read === false || n.isRead === false).length;

  return (
    <header className="topbar">



      <div className="topbar-brand" onClick={() => setActiveNav('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="topbar-logo-icon">
          <i className="fa-solid fa-ticket" style={{ color: '#fff' }} aria-hidden="true"></i>
        </div>
        <span className="topbar-logo-text">Ticket Hub</span>
      </div>
      <div className="topbar-separator"></div>

      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {activeNav !== 'dashboard' && (
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title="ย้อนกลับ"
            className="topbar-back-btn"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        )}
        <Breadcrumbs />
      </div>

      <div className="topbar-actions">
        {/* Create Ticket btn */}
        {(role === ROLES.EMPLOYEE || role === ROLES.MANAGER || role === ROLES.ADMIN) && (
          <button
            className="btn btn-primary topbar-create-btn"
            onClick={onCreateTicket}
            id="topbar-create-btn"
          >
            <i className="fa-solid fa-ticket" style={{marginRight: 6}}></i> สร้าง Ticket
          </button>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            id="notif-btn"
            onClick={() => setShowNotif(!showNotif)}
            style={{
              position: 'relative',
              background: showNotif ? 'var(--bg-main)' : 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <i className={`fa-solid fa-bell ${unreadCount > 0 ? 'bell-ringing' : ''}`} style={{ fontSize: 16, color: 'var(--text-secondary)' }}></i>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  borderRadius: 10,
                  background: 'var(--danger, #ef4444)',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                  lineHeight: 1,
                  animation: 'pulseRed 2s infinite'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <>
                <div 
                  onClick={() => setShowNotif(false)}
                  style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 999,
                    background: 'transparent'
                  }}
                />
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '360px',
                    maxWidth: '92vw',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.08)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    transformOrigin: 'top right',
                  }}
                  className="notif-dropdown"
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    background: 'var(--bg-main)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>การแจ้งเตือน</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: 11, cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
                        <i className="fa-solid fa-bell-slash" style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-muted)', opacity: 0.5, display: 'block' }}></i>
                        ไม่มีการแจ้งเตือนใหม่
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            markNotifAsRead(n.id);
                            if (n.ticketId && n.ticketId !== 'N/A') {
                              openTicketDetail(n.ticketId);
                            }
                            setShowNotif(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-light)',
                            background: n.read ? 'transparent' : 'var(--primary-pale)',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start'
                          }}
                          className="notif-item"
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-md)',
                              background: n.type === 'success' ? 'var(--success-pale)' : n.type === 'error' ? 'var(--danger-pale)' : n.type === 'warning' ? 'var(--warning-pale)' : 'var(--primary-pale)',
                              color: n.type === 'success' ? 'var(--success)' : n.type === 'error' ? 'var(--danger)' : n.type === 'warning' ? 'var(--warning)' : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px'
                            }}>
                              <i className={`fa-solid fa-${n.type === 'success' ? 'check' : n.type === 'error' ? 'triangle-exclamation' : n.type === 'warning' ? 'circle-exclamation' : 'circle-info'}`}></i>
                            </div>
                            {(!n.read && !n.isRead) && (
                              <span style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '8px',
                                height: '8px',
                                background: 'var(--primary)',
                                borderRadius: '50%',
                                border: '1.5px solid var(--bg-card)'
                              }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-word', flex: 1 }}>
                                {renderTextWithIcons(n.title)}
                              </span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {n.time}
                              </span>
                            </div>
                            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {renderTextWithIcons(n.message)}
                            </p>
                            {n.ticketId && n.ticketId !== 'N/A' && (
                              <span style={{ fontSize: 9.5, color: 'var(--primary)', fontWeight: 600, marginTop: 4, display: 'inline-block', wordBreak: 'break-all' }}>
                                #{n.ticketId}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile + Logout */}
        <div 
          className="topbar-profile-box" 
          onClick={() => setActiveNav('profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="topbar-profile-avatar-container" style={{ background: currentUser?.avatarUrl ? 'transparent' : info.color }}>
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : info.initials
            )}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">
              {currentUser?.name || info.name}
            </span>
            <div className="topbar-profile-badges">
              <span className="topbar-profile-role-badge" style={{
                background: role === ROLES.ADMIN ? 'var(--critical-pale)' : role === ROLES.MANAGER ? 'var(--success-pale)' : 'var(--primary-pale)',
                color: role === ROLES.ADMIN ? 'var(--critical)' : role === ROLES.MANAGER ? '#065f46' : 'var(--primary)',
                border: `1px solid ${role === ROLES.ADMIN ? 'rgba(124,58,237,0.3)' : role === ROLES.MANAGER ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`
              }}>
                {info.label}
              </span>
              <span className="topbar-profile-dept-badge">
                {currentUser?.department?.name || ''}
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

// ── Helper: when user clicks "แจ้งเรื่อง" nav item, open the modal ──
function CreateTicketRedirect({ onOpen, onRedirect }) {
  useEffect(() => {
    onOpen();
    onRedirect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ── Main router ──
function MainContent() {
  const { activeNav, setActiveNav, activeTicketId, closeTicketDetail, showCreateModal, setShowCreateModal, ticketsLoading } = useApp();
  const { tickets } = useApp();

  // Reset scroll position to top when changing page views
  useEffect(() => {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      pageContent.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [activeNav]);

  const renderView = () => {
    // Ticket-dependent views load when ticketsLoading is true
    const isTicketView = ['dashboard', 'my-own-tickets', 'track', 'my-sent-tickets', 'all-dept-tickets', 'dept-tickets', 'all-tickets', 'escalated', 'approval', 'approved-history', 'sla', 'reports'].includes(activeNav);

    if (ticketsLoading && isTicketView && tickets.length === 0) {
      if (activeNav === 'dashboard') return <DashboardSkeleton />;
      if (['my-own-tickets', 'track', 'my-sent-tickets', 'all-dept-tickets', 'dept-tickets', 'all-tickets', 'escalated'].includes(activeNav)) {
        return <TicketsSkeleton />;
      }
      if (['approval', 'approved-history'].includes(activeNav)) return <ApprovalSkeleton />;
      if (['sla'].includes(activeNav)) return <SLASkeleton />;
      if (activeNav === 'reports') return <ReportsSkeleton />;
      return <DashboardSkeleton />; // Fallback
    }

    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;

      // ผู้ใช้สร้าง Ticket
      case 'my-own-tickets':
        return <MyTicketsView defaultTab="my-assigned" titleOverride="งานในการดูแลของฉัน" />;
      case 'track':
        return <MyTicketsView defaultTab="my-created" titleOverride="Ticket ของฉัน" />;
      case 'my-sent-tickets':
        return <MyTicketsView defaultTab="outbound" titleOverride="Ticket ที่แผนกเราส่งไป" />;
      case 'all-dept-tickets':
        return <MyTicketsView defaultTab="inbound" titleOverride="Ticket ทั้งหมดของแผนก" />;


      case 'create-ticket': {
        // Open the modal and redirect to my-tickets (track)
        return <CreateTicketRedirect onOpen={() => setShowCreateModal(true)} onRedirect={() => setActiveNav('track')} />;
      }

      // Manager
      case 'dept-tickets':
        return <MyTicketsView defaultTab="inbound" />;

      // Admin
      case 'all-tickets':
        return <MyTicketsView defaultTab="inbound" titleOverride="Ticket ทั้งหมด" />;

      case 'escalated':
        return (
          <MyTicketsView
            defaultTab="inbound"
            filterOverride={tickets.filter(t => ['high', 'critical'].includes(t.urgency) && !['closed', 'resolved'].includes(t.status))}
            titleOverride="รายการ Ticket เร่งด่วน / วิกฤต"
          />
        );

      // Shared approval
      case 'approval':
      case 'approved-history':
        return <ApprovalView />;

      // Profile View
      case 'profile':
        return <ProfileView />;

      // SLA
      case 'sla': {
        // If on mobile layout, render unified SettingsView
        const isMobile = window.innerWidth <= 768;
        return isMobile ? (
          <SettingsView defaultActiveTab="sla" />
        ) : (
          <div className="view-container">
            <SLAView />
          </div>
        );
      }

      // Admin views
      case 'reports': {
        const isMobile = window.innerWidth <= 768;
        return isMobile ? (
          <SettingsView defaultActiveTab="reports" />
        ) : (
          <div className="view-container">
            <ReportsView />
          </div>
        );
      }
      
      case 'settings':
        return <SettingsView defaultActiveTab="webhooks" />;
      case 'faq':
        return <PlaceholderView title="คู่มือความปลอดภัย / FAQ" icon="question" />;

      case '404':
        return <NotFoundView onGoHome={() => changeActiveNav('dashboard')} />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <Topbar onCreateTicket={() => setShowCreateModal(true)} />
      <main className="page-content">
        <AnimatePresence mode="wait">
          <PageTransition key={activeNav}>
            {renderView()}
          </PageTransition>
        </AnimatePresence>
        {activeTicketId && <TicketDetailModal ticket={{ id: activeTicketId }} onClose={closeTicketDetail} />}
      </main>
      {showCreateModal && <TicketFormModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}


// ── Root ──
function AppShell() {
  const { isLoggedIn, authLoading, activeNav } = useApp();

  if (authLoading) {
    return <AppSkeleton />;
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  if (activeNav === '404') {
    return (
      <>
        <NotFoundView onGoHome={() => changeActiveNav('dashboard')} />
        <ToastContainer />
      </>
    );
  }

  const isTicketList = ['my-own-tickets', 'track', 'my-sent-tickets', 'all-dept-tickets', 'dept-tickets', 'all-tickets', 'escalated'].includes(activeNav);

  return (
    <div className={`app-layout ${isTicketList ? 'has-mobile-header' : ''}`}>
      <Sidebar />
      <div className="main-content">
        <MainContent />
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}

function GlobalConfirmModal() {
  const { globalConfirm, addToast } = useApp();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (globalConfirm) {
      setInputValue('');
    }
  }, [globalConfirm]);

  if (!globalConfirm) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      animation: 'fadeIn 0.2s ease',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        width: '90%',
        maxWidth: '440px',
        padding: '24px 28px',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: globalConfirm.dangerConfirm ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)',
            color: globalConfirm.dangerConfirm ? 'var(--danger)' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0
          }}>
            <i className={globalConfirm.dangerConfirm ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-question"}></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {globalConfirm.title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {globalConfirm.message}
        </p>

        {/* Input field (if showInput is true) */}
        {globalConfirm.showInput && (
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={globalConfirm.inputPlaceholder || 'ระบุเหตุผล...'}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-main)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: 13.5,
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            autoFocus
          />
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button
            onClick={() => globalConfirm.onCancel()}
            style={{
              flex: 1,
              background: 'var(--bg-main)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              color: 'var(--text-secondary)',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-main)'}
          >
            {globalConfirm.cancelText || 'ยกเลิก'}
          </button>
          <button
            onClick={() => {
              if (globalConfirm.showInput && globalConfirm.requiredInput && !inputValue.trim()) {
                addToast('กรุณาระบุข้อมูลที่จำเป็น', 'error');
                return;
              }
              globalConfirm.onConfirm(inputValue);
            }}
            disabled={globalConfirm.showInput && globalConfirm.requiredInput && !inputValue.trim()}
            style={{
              flex: 1,
              background: (globalConfirm.showInput && globalConfirm.requiredInput && !inputValue.trim())
                ? 'var(--border)'
                : (globalConfirm.dangerConfirm ? 'var(--danger)' : 'var(--primary)'),
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: (globalConfirm.showInput && globalConfirm.requiredInput && !inputValue.trim()) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => {
              if (!(globalConfirm.showInput && globalConfirm.requiredInput && !inputValue.trim())) {
                e.currentTarget.style.background = globalConfirm.dangerConfirm ? '#b91c1c' : 'var(--primary-light)';
              }
            }}
            onMouseLeave={e => {
              if (!(globalConfirm.showInput && globalConfirm.requiredInput && !inputValue.trim())) {
                e.currentTarget.style.background = globalConfirm.dangerConfirm ? 'var(--danger)' : 'var(--primary)';
              }
            }}
          >
            {globalConfirm.confirmText || 'ตกลง'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
      <GlobalConfirmModal />
    </AppProvider>
  );
}
