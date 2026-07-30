import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, NAV_CONFIG } from '../data/mockData';
import HelpModal from './HelpModal';


export default function Sidebar() {
  const { role, activeNav, setActiveNav, logoutUser, currentUser, tickets, showMobileSidebar, setShowMobileSidebar } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const info = ROLE_INFO[role];
  const sections = NAV_CONFIG[role] || [];

  const getBadgeValue = (item) => {
    switch (item.id) {
      case 'all-tickets':
        return tickets.length;
      case 'approval':
        return tickets.filter(t => t.status === 'wait-approve' && t.assignedTo && t.assignedTo !== 'รอมอบหมาย').length;
      case 'escalated':
        return tickets.filter(t => ['high', 'critical'].includes(t.urgency) && !['closed', 'resolved', 'cancelled'].includes(t.status)).length;
      default:
        return item.badge || null;
    }
  };

  return (
    <>
      {showMobileSidebar && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      <aside className={`sidebar ${showMobileSidebar ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => { setActiveNav('dashboard'); setShowMobileSidebar(false); }} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-icon">
            <i className="fa-solid fa-ticket" style={{ color: '#fff', fontSize: 18 }} aria-hidden="true"></i>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Ticket Hub</span>
          </div>
        </div>



      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map(sec => {
          const filteredItems = sec.items.filter(item => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
              const bottomNavItems = {
                [ROLES.EMPLOYEE]: ['dashboard', 'my-own-tickets', 'create-ticket', 'track', 'profile'],
                [ROLES.MANAGER]: ['dashboard', 'dept-tickets', 'create-ticket', 'reports', 'profile'],
                [ROLES.ADMIN]: ['dashboard', 'all-tickets', 'create-ticket', 'settings', 'profile']
              }[role] || [];
              if (bottomNavItems.includes(item.id)) return false;
            }
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={sec.section}>
              <div className="nav-section-label">{sec.section}</div>
              {filteredItems.map(item => {
                const badgeVal = getBadgeValue(item);
                
                // If it's reports or sla, it should not render in mobile drawer view
                if (['reports', 'sla'].includes(item.id)) {
                  return (
                    <div
                      key={item.id}
                      className={`nav-item desktop-only${activeNav === item.id ? ' active' : ''}`}
                      onClick={() => { setActiveNav(item.id); setShowRoleDropdown(false); setShowMobileSidebar(false); }}
                      id={`nav-${item.id}`}
                    >
                      <span className="nav-icon">
                        <i className={`fa-solid fa-${item.icon}`} aria-hidden="true"></i>
                      </span>
                      <span>{item.label}</span>
                      {badgeVal > 0 && (
                        <span className={`nav-badge ${item.id === 'approval' ? 'warning' : item.id === 'escalated' ? 'danger' : item.badgeColor || 'blue'}`}>
                          {badgeVal > 99 ? '99+' : badgeVal}
                        </span>
                      )}
                    </div>
                  );
                }

                // For settings, it displays 'จัดการระบบ' on mobile, and 'ตั้งค่า Webhook' on desktop
                if (item.id === 'settings') {
                  return (
                    <div key={item.id}>
                      <div
                        className={`nav-item mobile-only${activeNav === item.id || ['reports', 'sla'].includes(activeNav) ? ' active' : ''}`}
                        onClick={() => { setActiveNav(item.id); setShowRoleDropdown(false); setShowMobileSidebar(false); }}
                        id={`nav-${item.id}-mobile`}
                      >
                        <span className="nav-icon">
                          <i className={`fa-solid fa-gear`} aria-hidden="true"></i>
                        </span>
                        <span>ควบคุมระบบ</span>
                      </div>
                      <div
                        className={`nav-item desktop-only${activeNav === item.id ? ' active' : ''}`}
                        onClick={() => { setActiveNav(item.id); setShowRoleDropdown(false); setShowMobileSidebar(false); }}
                        id={`nav-${item.id}`}
                      >
                        <span className="nav-icon">
                          <i className={`fa-solid fa-${item.icon}`} aria-hidden="true"></i>
                        </span>
                        <span>{item.label}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`nav-item${activeNav === item.id ? ' active' : ''}`}
                    onClick={() => { setActiveNav(item.id); setShowRoleDropdown(false); setShowMobileSidebar(false); }}
                    id={`nav-${item.id}`}
                  >
                    <span className="nav-icon">
                      <i className={`fa-solid fa-${item.icon}`}  aria-hidden="true"></i>
                    </span>
                    <span>{item.label}</span>
                    {badgeVal > 0 && (
                      <span className={`nav-badge ${item.id === 'approval' ? 'warning' : item.id === 'escalated' ? 'danger' : item.badgeColor || 'blue'}`}>
                        {badgeVal > 99 ? '99+' : badgeVal}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        
        {/* Help Button */}
        <div 
          className="sidebar-footer-btn" 
          onClick={() => setShowHelp(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          id="help-button"
        >
          <i className="fa-regular fa-circle-question" style={{ fontSize: 16 }}></i>
          <span>คู่มือการใช้งาน (Help)</span>
        </div>

        {/* Role Switcher in Footer */}
        <div className="profile-box" onClick={() => setShowRoleDropdown(v => !v)}>
          <div className="profile-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentUser?.avatarUrl ? 'transparent' : info.color, color: '#fff', width: 36, height: 36, borderRadius: '50%', fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : info.initials
            )}
          </div>
          <div className="profile-info">
            <span className="profile-name">{currentUser?.name || info.name}</span>
            <span className="profile-email">
              {currentUser?.email || (role === ROLES.EMPLOYEE ? 'somchai.j@factory.com' : role === ROLES.MANAGER ? 'wipa.r@factory.com' : 'thana.s@factory.com')}
            </span>
          </div>
          <i className="fa-solid fa-arrows-up-down profile-chevron" aria-hidden="true"></i>
        </div>

        {showRoleDropdown && (
          <>
            <div 
              onClick={() => setShowRoleDropdown(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 999,
                background: 'transparent'
              }}
            />
            <div className="shadcn-dropdown">
              {/* Header */}
              <div className="shadcn-dropdown-header">
                <div className="profile-avatar" style={{ width: 36, height: 36, fontSize: 13.5, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentUser?.avatarUrl ? 'transparent' : info.color, color: '#fff', borderRadius: '50%', fontWeight: 700, flexShrink: 0 }}>
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : info.initials
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name" style={{ fontSize: 13.5 }}>{currentUser?.name || info.name}</span>
                  <span className="profile-email">
                    {currentUser?.email || (role === ROLES.EMPLOYEE ? 'somchai.j@factory.com' : role === ROLES.MANAGER ? 'wipa.r@factory.com' : 'thana.s@factory.com')}
                  </span>
                </div>
              </div>


              {/* Actions Section */}
              <div className="shadcn-dropdown-item" onClick={() => { setActiveNav('profile'); setShowRoleDropdown(false); }}>
                <span className="item-icon" style={{ color: 'var(--primary)' }}><i className="fa-solid fa-user-gear"></i></span>
                <span>ตั้งค่าโปรไฟล์</span>
              </div>

              <div className="shadcn-dropdown-divider" />

              {/* Logout */}
              <div className="shadcn-dropdown-item danger" onClick={async () => { setShowRoleDropdown(false); await logoutUser(); }}>
                <span className="item-icon" style={{ color: 'var(--danger)' }}><i className="fa-solid fa-right-from-bracket"></i></span>
                <span>ออกจากระบบ</span>
              </div>
            </div>
          </>
        )}
      </div>
      {showHelp && createPortal(
        <HelpModal onClose={() => setShowHelp(false)} />,
        document.body
      )}
      </aside>
    </>
  );
}
