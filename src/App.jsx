import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ROLES, ROLE_INFO } from './data/mockData';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TicketTable from './components/TicketTable';
import SearchModal from './components/SearchModal';
import TicketFormModal from './components/TicketFormModal';
import Breadcrumbs from './components/Breadcrumbs';

import DashboardView  from './views/DashboardView';
import MyTicketsView  from './views/MyTicketsView';
import ApprovalView   from './views/ApprovalView';
import SLAView        from './views/SLAView';
import LoginView      from './views/LoginView';
import TrackView      from './views/TrackView';
import UsersView      from './views/UsersView';
import ReportsView    from './views/ReportsView';
import SettingsView   from './views/SettingsView';
import ProfileView    from './views/ProfileView';

import './index.css';

// ── Toast notifications ──
function ToastContainer() {
  const { toasts, removeToast } = useApp();
  const typeIcon = { success: 'circle-check', error: 'circle-xmark', warning: 'triangle-exclamation', info: 'circle-info' };
  
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon"><i className={`fa-solid fa-${typeIcon[t.type] || 'circle-check'}`} aria-hidden="true"></i></span>
          <span className="toast-msg">{t.msg}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Close">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      ))}
    </div>
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
  const { role, activeNav, notifications, markNotifAsRead, clearAllNotifications, currentUser } = useApp();
  const info = ROLE_INFO[role];
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="topbar">
      <div>
        <Breadcrumbs />
      </div>

      <div className="topbar-actions">
        {/* Create Ticket btn for employee */}
        {role === ROLES.EMPLOYEE && (
          <button
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: 13 }}
            onClick={onCreateTicket}
            id="topbar-create-btn"
          >
            <i className="fa-solid fa-ticket" style={{marginRight: 6}}></i> แจ้งเรื่องใหม่
          </button>
        )}

        {/* Search */}
        <div className="icon-btn tooltip tooltip-bottom tooltip-left" data-tip="ค้นหา" id="search-btn" onClick={() => setShowSearch(true)}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>

        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <div 
            className="icon-btn tooltip tooltip-bottom tooltip-left" 
            data-tip="การแจ้งเตือน" 
            id="notif-btn"
            onClick={() => setShowNotif(!showNotif)}
          >
            <i className={`fa-solid fa-bell ${unreadCount > 0 ? 'bell-ringing' : ''}`}></i>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

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
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  overflow: 'hidden',
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
                  <div style={{ display: 'flex', gap: 10 }}>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          notifications.forEach(n => !n.read && markNotifAsRead(n.id));
                        }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: 11, cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontWeight: 500, padding: 0 }}
                      >
                        ล้างทั้งหมด
                      </button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
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
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-light)',
                          background: n.read ? 'transparent' : 'var(--primary-bg)',
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
                          {!n.read && (
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 6 }}>
                              {n.time}
                            </span>
                          </div>
                          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: 9.5, color: 'var(--primary)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                            {n.ticketId}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile + Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--primary-bg)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '6px 12px',
        }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: info.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              info.initials
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {currentUser?.name || info.name}
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ 
                fontSize: '9px', 
                padding: '2px 6px',
                background: role === ROLES.ADMIN ? 'var(--critical-pale)' : role === ROLES.MANAGER ? 'var(--success-pale)' : 'var(--primary-pale)',
                color: role === ROLES.ADMIN ? 'var(--critical)' : role === ROLES.MANAGER ? '#065f46' : 'var(--primary)',
                border: `1px solid ${role === ROLES.ADMIN ? 'rgba(124,58,237,0.3)' : role === ROLES.MANAGER ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`,
                borderRadius: '4px',
                fontWeight: 700
              }}>
                {info.label}
              </span>
              <span style={{ 
                fontSize: '9px', 
                padding: '2px 6px',
                background: 'var(--primary-bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                {currentUser?.department?.name || (role === ROLES.EMPLOYEE ? 'ฝ่ายผลิต 1' : role === ROLES.MANAGER ? 'ฝ่ายซ่อมบำรุง' : 'ส่วนกลาง')}
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
  const { activeNav, role, setActiveNav, setRole } = useApp();
  const [showForm, setShowForm] = useState(false);
  const { tickets } = useApp();
  const info = ROLE_INFO[role];

  const renderView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;

      // ผู้ใช้สร้าง Ticket
      case 'my-own-tickets':
        return <MyTicketsView defaultTab="my-created" titleOverride="Ticket ของฉัน" />;
      case 'track':
        return <MyTicketsView defaultTab="my-assigned" titleOverride="งานในการดูแลของฉัน" />;
      case 'my-sent-tickets':
        return <MyTicketsView defaultTab="outbound" titleOverride="Ticket ที่แผนกเราส่งไป" />;
      case 'all-dept-tickets':
        return <MyTicketsView defaultTab="inbound" titleOverride="Ticket ทั้งหมดของแผนก" />;


      case 'create-ticket': {
        // Open the modal and redirect to my-tickets
        return <CreateTicketRedirect onOpen={() => setShowForm(true)} onRedirect={() => setActiveNav('my-own-tickets')} />;
      }

      // Manager
      case 'dept-tickets':
        return <MyTicketsView defaultTab="inbound" />;

      // Admin
      case 'all-tickets':
        return <MyTicketsView defaultTab="inbound" />;

      case 'escalated':
        return (
          <MyTicketsView
            filterOverride={tickets.filter(t => ['high', 'critical'].includes(t.urgency) && !['closed', 'resolved'].includes(t.status))}
            titleOverride="รายการ Ticket เร่งด่วน / Line Stop"
          />
        );

      case 'assign':
        return (
          <MyTicketsView
            filterOverride={tickets.filter(t => t.assignedTo === 'รอมอบหมาย')}
            titleOverride="รายการ Ticket มอบหมายงาน"
          />
        );

      // Shared approval
      case 'approval':
      case 'approved-history':
        return <ApprovalView />;

      // SLA
      case 'sla':
        return <SLAView />;

      // Profile View
      case 'profile':
        return <ProfileView />;

      // Admin views
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'audit':
        return <PlaceholderView title="Audit Log" icon="scroll" />;
      case 'team':
        return <PlaceholderView title="ทีมงาน" icon="users" />;
      case 'faq':
        return <PlaceholderView title="คู่มือความปลอดภัย / FAQ" icon="question" />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <Topbar onCreateTicket={() => setShowForm(true)} />
      <main className="page-content">
        {renderView()}
      </main>
      {showForm && <TicketFormModal onClose={() => setShowForm(false)} />}
    </>
  );
}

// ── Logout Button ──
function LogoutButton() {
  const { logoutUser } = useApp();
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    setLoading(false);
  };
  return (
    <button
      id="logout-btn"
      onClick={handleLogout}
      disabled={loading}
      title="ออกจากระบบ"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(239,68,68,0.07)',
        color: '#dc2626',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 11.5,
        fontWeight: 700,
        transition: 'all 0.18s',
        marginLeft: 4,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
    >
      <i className={`fa-solid fa-${loading ? 'spinner fa-spin' : 'right-from-bracket'}`} style={{ fontSize: 11 }} />
      {loading ? '' : 'ออก'}
    </button>
  );
}

// ── Root ──
function AppShell() {
  const { isLoggedIn, authLoading } = useApp();

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        flexDirection: 'column',
        gap: 16,
        color: '#fff',
      }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 36, opacity: 0.8 }} />
        <span style={{ fontSize: 14, opacity: 0.65, fontWeight: 600 }}>กำลังโหลด...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <MainContent />
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
