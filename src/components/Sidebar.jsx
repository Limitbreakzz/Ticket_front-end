import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, NAV_CONFIG } from '../data/mockData';


export default function Sidebar() {
  const { role, setRole, activeNav, setActiveNav, logoutUser, currentUser } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const info = ROLE_INFO[role];
  const sections = NAV_CONFIG[role] || [];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="fa-solid fa-ticket" style={{ color: '#fff', fontSize: 18 }} aria-hidden="true"></i>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Ticket Hub</span>
        </div>
      </div>



      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="nav-section-label">{sec.section}</div>
            {sec.items.map(item => (
              <div
                key={item.id}
                className={`nav-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => { setActiveNav(item.id); setShowRoleDropdown(false); }}
                id={`nav-${item.id}`}
              >
                <span className="nav-icon">
                  <i className={`fa-solid fa-${item.icon}`}  aria-hidden="true"></i>
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge${item.badgeColor ? ` ${item.badgeColor}` : ''}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ position: 'relative' }}>
        
        {/* Role Switcher in Footer */}
        <div className="profile-box" onClick={() => setShowRoleDropdown(v => !v)}>
          <div className="profile-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: info.color, color: '#fff', width: 36, height: 36, borderRadius: '50%', fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              info.initials
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
                <div className="profile-avatar" style={{ width: 36, height: 36, fontSize: 13.5, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: info.color, color: '#fff', borderRadius: '50%', fontWeight: 700, flexShrink: 0 }}>
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    info.initials
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name" style={{ fontSize: 13.5 }}>{currentUser?.name || info.name}</span>
                  <span className="profile-email">
                    {currentUser?.email || (role === ROLES.EMPLOYEE ? 'somchai.j@factory.com' : role === ROLES.MANAGER ? 'wipa.r@factory.com' : 'thana.s@factory.com')}
                  </span>
                </div>
              </div>

              <div className="shadcn-dropdown-divider" />

              {/* Demo Section */}
              <div className="shadcn-dropdown-section-title">สลับบทบาท (Demo)</div>
              {Object.entries(ROLE_INFO).map(([key, ri]) => (
                <div
                  key={key}
                  className="shadcn-dropdown-item"
                  onClick={() => { setRole(key); setActiveNav('dashboard'); setShowRoleDropdown(false); }}
                >
                  <div className="item-avatar" style={{ background: ri.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>
                    {ri.initials}
                  </div>
                  <div className="item-text-wrapper">
                    <span className="item-name">{ri.name}</span>
                    <span className="item-desc">{ri.label} — {ri.desc}</span>
                  </div>
                  {key === role && (
                    <i className="fa-solid fa-check" style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: 12 }} aria-hidden="true"></i>
                  )}
                </div>
              ))}

              <div className="shadcn-dropdown-divider" />

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
    </aside>
  );
}
