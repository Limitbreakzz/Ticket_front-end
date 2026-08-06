import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, NAV_CONFIG } from '../data/mockData';
import HelpModal from './HelpModal';


export default function Sidebar() {
  const { role, activeNav, setActiveNav, logoutUser, currentUser, tickets, showMobileSidebar, setShowMobileSidebar, showHelp, setShowHelp } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
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

      {showHelp && createPortal(
        <HelpModal onClose={() => setShowHelp(false)} />,
        document.body
      )}
      </aside>
    </>
  );
}
