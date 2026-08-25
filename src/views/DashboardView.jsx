import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_INFO, CATEGORIES, STATUS_LABEL } from '../data/mockData';
import './DashboardView.css';

function DashboardAvatar({ name, avatarUrl }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const initials = name ? name.trim().charAt(0).toUpperCase() : 'U';
  const avatarSrc = avatarUrl || '/profile.jpg';

  return (
    <div style={{
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: !imageError ? 'transparent' : 'var(--primary)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 9,
      fontWeight: 700,
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {!imageError ? (
        <img 
          src={avatarSrc} 
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

export default function DashboardView() {
  const { role, tickets, currentUser, setActiveNav, openTicketDetail } = useApp();
  const info = ROLE_INFO[role];
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stats calculation
  const totalTickets = tickets.length;
  const newTickets = tickets.filter(t => t.status === 'new' || t.status === 'pending' || t.status === 'wait-approve' || t.status === 'forwarded').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress' || t.status === 'progress' || t.status === 'wait-parts').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const ourDept =
    currentUser?.department?.name ||
    currentUser?.departmentName ||
    (typeof currentUser?.department === 'string' ? currentUser.department : null) ||
    null;

  const deptTickets = tickets.filter(t => {
    // Filter out resolved, closed, or cancelled tickets
    const isActive = !['resolved', 'closed', 'cancelled'].includes(t.status);
    if (!isActive) return false;

    // Admin sees all active tickets
    if (role === 'admin') return true;

    // Others see tickets targeted to their department but created by another department
    return ourDept && t.targetDepartment === ourDept && t.department !== ourDept;
  });

  const recentTickets = (role === 'admin' ? [...tickets] : [...deptTickets])
    .sort((a, b) => new Date(b.rawCreatedAt) - new Date(a.rawCreatedAt))
    .slice(0, 5);

  const pendingApprovalsCount = tickets.filter(t => t.status === 'wait-approve' && t.assignedTo && t.assignedTo !== 'รอมอบหมาย').length;

  return (
    <div className="view-container" style={{
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: isMobile ? '12px 12px 36px 12px' : '24px'
    }}>

      {/* Hero / Greeting */}
      <div className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        
        {/* Background SVG — gradient + subtle grid only */}
        <svg
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 800 200"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b1329" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <pattern id="techGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
            </pattern>
            {/* Soft ambient glow on right */}
            <radialGradient id="ambientRight" cx="85%" cy="50%" r="40%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            {/* Soft ambient glow center-left */}
            <radialGradient id="ambientLeft" cx="20%" cy="60%" r="35%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base */}
          <rect width="100%" height="100%" fill="url(#bgGrad)" />
          {/* Grid */}
          <rect width="100%" height="100%" fill="url(#techGrid)" />
          {/* Ambient glows */}
          <rect width="100%" height="100%" fill="url(#ambientRight)" />
          <rect width="100%" height="100%" fill="url(#ambientLeft)" />

          {/* Subtle decorative PCB accent lines on left side under text */}
          <path d="M 30 170 L 280 170 L 320 130" stroke="rgba(96,165,250,0.1)" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="320" cy="130" r="2.5" fill="#60a5fa" opacity="0.25" />
          <path d="M 30 50 L 100 50 L 120 70" stroke="rgba(167,139,250,0.08)" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="120" cy="70" r="2" fill="#a78bfa" opacity="0.2" />
        </svg>

        <div style={{ maxWidth: '650px', zIndex: 1, position: 'relative' }}>
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <i className="fa-solid fa-circle-nodes" style={{ color: '#38bdf8' }}></i>
            ระบบรับแจ้งปัญหาและติดตามการดำเนินงาน
          </span>
          <h1 style={{ fontSize: 32, margin: '0 0 8px 0', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            สวัสดี, {currentUser?.name || info.name}
          </h1>
          <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: 14, fontWeight: 500, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            ศูนย์กลางการประสานงาน แจ้ง Ticket และประสานงานบริการภายในองค์กร
          </p>
          {(role === 'manager' || role === 'admin') && (
            <button
              onClick={() => {
                window.tempTicketTab = 'wait-approve';
                setActiveNav(role === 'admin' ? 'all-tickets' : 'dept-tickets');
              }}
              className="btn"
              style={{
                background: pendingApprovalsCount > 0 
                  ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                color: pendingApprovalsCount > 0 ? '#1e293b' : '#ffffff',
                fontWeight: 700,
                border: pendingApprovalsCount > 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: pendingApprovalsCount > 0 
                  ? '0 4px 14px rgba(234, 179, 8, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
                outline: 'none',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = pendingApprovalsCount > 0 
                  ? '0 6px 18px rgba(234, 179, 8, 0.5)' 
                  : '0 6px 16px rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = pendingApprovalsCount > 0 
                  ? '0 4px 14px rgba(234, 179, 8, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
            >
              <i className="fa-solid fa-clipboard-check" style={{ fontSize: 15 }}></i>
              {pendingApprovalsCount > 0 
                ? `มี ${pendingApprovalsCount} รายการรอคุณอนุมัติ` 
                : 'จัดการการอนุมัติ / ประวัติ'}
            </button>
          )}

        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-summary-grid">

        {/* KPI 1: Ticket ทั้งหมด */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid #474d55ff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'var(--transition)',
          minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>Ticket ทั้งหมด</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#E2E8F0', color: '#676e78ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-ticket"></i>
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{totalTickets}</div>
          </div>
        </div>

        {/* KPI 2: เคสใหม่ */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(56,189,248,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid #3B82F6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'var(--transition)',
          minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>
              {isMobile ? 'เคสใหม่' : 'เคสใหม่ / รอดำเนินการ'}
            </span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-square-plus"></i>
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{newTickets}</div>
          </div>
        </div>

        {/* KPI 3: กำลังดำเนินการ */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid #F59E0B',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'var(--transition)',
          minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>กำลังดำเนินการ</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{inProgressTickets}</div>
          </div>
        </div>

        {/* KPI 4: แก้ไขเสร็จสิ้น */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #10b981',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: 120
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>แก้ไขเสร็จสิ้น</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{resolvedTickets}</div>
          </div>
        </div>

      </div>

      {/* Main Split Layout Section */}
      <div className="dashboard-main-grid" style={{ gap: 24, alignItems: 'stretch' }}>
        
        {/* Left Side: งานของแผนก (Primary Action Panel) */}
        <div className="dashboard-card">
          <div className="dashboard-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px 0' }}>
                <i className="fa-solid fa-building-user" style={{ color: 'var(--primary)' }}></i>
                <span style={{ fontSize: 18, fontWeight: 450 }}>งานของแผนก</span>
              </h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>รายการแจ้งซ่อมที่แผนกของคุณกำลังรับผิดชอบดำเนินการอยู่</div>
            </div>
            <span className="dashboard-count-badge dashboard-count-badge-info" style={{ fontSize: 12, background: 'var(--primary-pale)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 12, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {deptTickets.length} รายการ
            </span>
          </div>

          <div className="table-responsive-wrapper desktop-only">
            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
                  <th className="id-col" style={{ fontWeight: 600, width: '80px', whiteSpace: 'nowrap' }}>ID</th>
                  <th style={{ fontWeight: 600 }}>Ticket</th>
                  <th className="reporter-col" style={{ fontWeight: 600 }}>ผู้แจ้ง</th>
                  <th className="status-col" style={{ fontWeight: 600, width: '90px' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {deptTickets.length === 0 ? (
                  <tr>
                    <td className="department-empty-cell" colSpan="4" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                      <div className="dashboard-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <i className="fa-solid fa-inbox" style={{ fontSize: 32, opacity: 0.7 }}></i>
                        <span>ไม่มีงานในแผนก</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deptTickets.slice(0, 5).map((t, idx, arr) => {
                    const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                    const isLast = idx === arr.length - 1;
                    return (
                      <tr 
                        key={t.id} 
                        style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-light)', transition: 'var(--transition)', cursor: 'pointer' }} 
                        className="table-row-hover"
                        onClick={() => openTicketDetail(t.id)}
                      >
                        <td className="id-col" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>#{t.id.substring(0, 8)}</td>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 180 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.subject}>
                            {t.subject}
                          </div>
                        </td>
                        <td className="reporter-col" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <div className="recent-ticket-meta-left">
                            <DashboardAvatar name={t.createdBy} avatarUrl={t.creatorAvatar} />
                            {t.createdBy}
                          </div>
                        </td>
                        <td className="status-col">
                          <span className={`status-tag ${statusInfo.cls}`} style={{ fontSize: 11, padding: '2px 8px' }}>{statusInfo.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="dashboard-feed-wrapper mobile-only" style={{ display: 'flex', flexDirection: 'column' }}>
            {deptTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-inbox" style={{ fontSize: 32, opacity: 0.7 }}></i>
                <span>ไม่มีงานในแผนก</span>
              </div>
            ) : (
              deptTickets.slice(0, 5).map(t => {
                const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                const catInfo = CATEGORIES[t.category];
                return (
                  <div 
                    key={t.id} 
                    className="feed-row-hover feed-item-row"
                    onClick={() => openTicketDetail(t.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="feed-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <i className={`fa-solid fa-${catInfo?.icon || 'ticket'}`} style={{ fontSize: 14 }}></i>
                    </div>
                    
                    {/* Mid Content */}
                    <div className="feed-main" style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'nowrap', minWidth: 0 }}>
                        <span className="feed-ticket-id" style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, flexShrink: 0 }}>#{t.id.substring(0, 8)}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>• โดย: {t.createdBy}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }} title={t.subject}>
                        {t.subject}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="feed-status" style={{ flexShrink: 0, alignSelf: 'center', marginLeft: 'auto' }}>
                      <span className={`status-tag ${statusInfo.cls}`} style={{ fontSize: 10, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Ticket ล่าสุด (Compact Vertical List View) */}
        <div className="dashboard-card">
          <div className="dashboard-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px 0' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--warning)' }}></i> 
                <span style={{ fontSize: 18, fontWeight: 450 }}>Ticket ล่าสุด</span>
              </h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>อัปเดต 5 ลำดับแรกในระบบ</div>
            </div>
            <span className="dashboard-count-badge dashboard-count-badge-warning" style={{ fontSize: 12, background: 'var(--warning-pale)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 12, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {recentTickets.length} รายการ
            </span>
          </div>

          <div className="dashboard-feed-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            {recentTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: 32, opacity: 0.7 }}></i>
                <span>ไม่มีข้อมูล Ticket ล่าสุด</span>
              </div>
            ) : (
              recentTickets.slice(0, 5).map(t => {
                const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                const catInfo = CATEGORIES[t.category];
                return (
                  <div 
                    key={t.id} 
                    className="feed-row-hover feed-item-row recent-ticket-item"
                    onClick={() => openTicketDetail(t.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="feed-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <i className={`fa-solid fa-${catInfo?.icon || 'ticket'}`} style={{ fontSize: 14 }}></i>
                    </div>
                    
                    {/* Mid Content */}
                    <div className="feed-main recent-ticket-main" style={{ flex: 1, minWidth: 0 }}>
                      <div className="recent-ticket-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="feed-ticket-id" style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>#{t.id.substring(0, 8)}</span>
                          <span className="feed-category" style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {catInfo?.label || t.category}</span>
                        </div>
                        <span className="feed-date">{t.createdAt.split(',')[0]}</span>
                      </div>
                      <div className="recent-ticket-subject" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }} title={t.subject}>
                        {t.subject}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="feed-status" style={{ flexShrink: 0 }}>
                      <span className={`status-tag ${statusInfo.cls}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
