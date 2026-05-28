import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ROLES, ROLE_INFO } from './data/mockData';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TicketTable from './components/TicketTable';
import SearchModal from './components/SearchModal';
import TicketFormModal from './components/TicketFormModal';

import DashboardView  from './views/DashboardView';
import MyTicketsView  from './views/MyTicketsView';
import ApprovalView   from './views/ApprovalView';
import SLAView        from './views/SLAView';

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
  const { role, activeNav, notifications, markNotifAsRead, clearAllNotifications } = useApp();
  const info = ROLE_INFO[role];
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const titleMap = {
    dashboard:       { title: 'Dashboard', sub: 'ภาพรวมระบบแจ้งซ่อมโรงงาน' },
    'my-tickets':    { title: 'Ticket ของฉัน', sub: 'รายการที่คุณแจ้งซ่อม' },
    'all-tickets':   { title: 'Ticket ทั้งหมด', sub: 'จัดการงานซ่อมบำรุง' },
    'dept-tickets':  { title: 'Ticket ของแผนก', sub: 'รายการซ่อมในไลน์ผลิต/แผนก' },
    'create-ticket': { title: 'แจ้งเรื่องใหม่', sub: 'สร้าง Ticket ใหม่' },
    track:           { title: 'ติดตามสถานะ', sub: 'ตรวจสอบความคืบหน้างานซ่อม' },
    approval:        { title: 'การอนุมัติ', sub: 'งานซ่อมที่รออนุมัติ' },
    'approved-history': { title: 'ประวัติการอนุมัติ', sub: '' },
    sla:             { title: 'SLA Dashboard', sub: 'ติดตาม Service Level Agreement' },
    reports:         { title: 'รายงาน & วิเคราะห์', sub: '' },
    users:           { title: 'จัดการผู้ใช้งาน', sub: '' },
    settings:        { title: 'ตั้งค่าระบบ', sub: '' },
    audit:           { title: 'Audit Log', sub: '' },
    escalated:       { title: 'เร่งด่วน / เครื่องจักรหยุด (Line Stop)', sub: '' },
    assign:          { title: 'มอบหมายงาน', sub: '' },
    team:            { title: 'ทีมช่างซ่อมบำรุง', sub: '' },
    faq:             { title: 'คู่มือความปลอดภัย / FAQ', sub: '' },
  };

  const current = titleMap[activeNav] || { title: activeNav, sub: '' };

  return (
    <header className="topbar">
      <div>
        <span className="topbar-title">
          {current.title}
          {current.sub && (
            <span className="topbar-subtitle">— {current.sub}</span>
          )}
        </span>
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

        {/* Role chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--primary-bg)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-full)', padding: '5px 12px',
        }}>
          <div
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: info.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}
          >
            {info.initials}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {info.label}
          </span>
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
  const { activeNav, role, setActiveNav } = useApp();
  const [showForm, setShowForm] = useState(false);
  const { tickets } = useApp();

  const renderView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;

      // Employee
      case 'my-tickets':
      case 'track':
        return <MyTicketsView />;

      case 'create-ticket': {
        // Open the modal and redirect to my-tickets
        // We use an effect-like approach: render a component that fires onMount
        return <CreateTicketRedirect onOpen={() => setShowForm(true)} onRedirect={() => setActiveNav('my-tickets')} />;
      }

      // Manager
      case 'dept-tickets':
        return <MyTicketsView />;

      // Admin
      case 'all-tickets':
        return <MyTicketsView />;

      case 'escalated':
        return (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }}></i>Ticket เร่งด่วน / Line Stop</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>รายการที่มีระดับความเร่งด่วน "สูง" หรือ "วิกฤต" และยังไม่ปิด</p>
            </div>
            <MyTicketsView
              filterOverride={tickets.filter(t => ['high', 'critical'].includes(t.urgency) && !['closed', 'resolved'].includes(t.status))}
            />
          </div>
        );

      case 'assign':
        return (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}><i className="fa-solid fa-user-plus" style={{ marginRight: 8 }} aria-hidden="true"></i>มอบหมายงาน</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Ticket ที่ยังไม่ได้รับการมอบหมาย</p>
            </div>
            <MyTicketsView
              filterOverride={tickets.filter(t => t.assignedTo === 'รอมอบหมาย')}
            />
          </div>
        );

      // Shared approval
      case 'approval':
      case 'approved-history':
        return <ApprovalView />;

      // SLA
      case 'sla':
        return <SLAView />;

      // Stubs
      case 'reports':
        return <PlaceholderView title="รายงาน & วิเคราะห์" icon="chart-line" />;
      case 'users':
        return <PlaceholderView title="จัดการผู้ใช้งาน" icon="users" />;
      case 'settings':
        return <PlaceholderView title="ตั้งค่าระบบ" icon="gear" />;
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

// ── Root ──
function AppShell() {
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
