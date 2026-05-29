import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO } from '../data/mockData';

const NAV_CONFIG = {
  [ROLES.EMPLOYEE]: [
    {
      section: 'ภาพรวม',
      items: [
        { id: 'dashboard',  icon: 'house',             label: 'หน้าหลัก' },
        { id: 'my-tickets', icon: 'rectangle-list',    label: 'Ticket ของฉัน', badge: '3', badgeColor: 'blue' },
      ],
    },
    {
      section: 'การดำเนินการ',
      items: [
        { id: 'create-ticket', icon: 'ticket',           label: 'แจ้งเรื่องใหม่' },
        { id: 'track',         icon: 'magnifying-glass', label: 'ติดตามสถานะ' },
      ],
    },
    {
      section: 'อื่น ๆ',
      items: [
        { id: 'sla', icon: 'gauge-high',              label: 'SLA ของฉัน' },
        { id: 'faq', icon: 'circle-question',         label: 'คำถามที่พบบ่อย' },
      ],
    },
  ],
  [ROLES.MANAGER]: [
    {
      section: 'ภาพรวม',
      items: [
        { id: 'dashboard',    icon: 'house',           label: 'หน้าหลัก' },
        { id: 'dept-tickets', icon: 'layer-group',     label: 'Ticket ของแผนก', badge: '5', badgeColor: 'blue' },
      ],
    },
    {
      section: 'การอนุมัติ',
      items: [
        { id: 'approval',          icon: 'clipboard-check',   label: 'รออนุมัติ', badge: '2' },
        { id: 'approved-history',  icon: 'clock-rotate-left', label: 'ประวัติการอนุมัติ' },
      ],
    },
    {
      section: 'รายงาน',
      items: [
        { id: 'sla',     icon: 'gauge-high',  label: 'SLA Dashboard' },
        { id: 'reports', icon: 'chart-line',  label: 'รายงานสรุป' },
        { id: 'team',    icon: 'users',       label: 'ทีมงาน' },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    {
      section: 'ภาพรวม',
      items: [
        { id: 'dashboard',  icon: 'house',   label: 'Dashboard' },
        { id: 'all-tickets', icon: 'rectangle-list', label: 'Ticket ทั้งหมด', badge: '12', badgeColor: 'blue' },
      ],
    },
    {
      section: 'การจัดการ',
      items: [
        { id: 'approval',  icon: 'clipboard-check',      label: 'รออนุมัติ',       badge: '3' },
        { id: 'assign',    icon: 'user-plus',             label: 'มอบหมายงาน',      badge: '4', badgeColor: 'orange' },
        { id: 'escalated', icon: 'triangle-exclamation',  label: 'เร่งด่วน/วิกฤต', badge: '2' },
      ],
    },
    {
      section: 'วิเคราะห์',
      items: [
        { id: 'sla',      icon: 'gauge-high',  label: 'SLA Dashboard' },
        { id: 'reports',  icon: 'chart-line',  label: 'รายงาน & วิเคราะห์' },
        { id: 'users',    icon: 'user-shield', label: 'จัดการผู้ใช้งาน' },
        { id: 'settings', icon: 'gear',        label: 'ตั้งค่าระบบ' },
        { id: 'audit',    icon: 'file-lines',  label: 'Audit Log' },
      ],
    },
  ],
};

const ROLE_ICON = { employee: 'user', manager: 'user-tie', admin: 'user-shield' };

export default function Sidebar() {
  const { role, setRole, activeNav, setActiveNav } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const info = ROLE_INFO[role];
  const sections = NAV_CONFIG[role] || [];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="fa-solid fa-circle-nodes" style={{ color: '#fff', fontSize: 18 }} aria-hidden="true"></i>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Ticket Hub</span>
          <span className="sidebar-logo-sub">Frontend Portal</span>
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
          <div className={`profile-avatar ${role}`}>
            {info.initials}
          </div>
          <div className="profile-info">
            <span className="profile-name">{info.name}</span>
            <span className="profile-email">
              {role === ROLES.EMPLOYEE ? 'somchai.j@factory.com' : role === ROLES.MANAGER ? 'wipa.r@factory.com' : 'thana.s@factory.com'}
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
                <div className={`profile-avatar ${role}`} style={{ width: 36, height: 36, fontSize: 15 }}>
                  {info.initials}
                </div>
                <div className="profile-info">
                  <span className="profile-name" style={{ fontSize: 13.5 }}>{info.name}</span>
                  <span className="profile-email">
                    {role === ROLES.EMPLOYEE ? 'somchai.j@factory.com' : role === ROLES.MANAGER ? 'wipa.r@factory.com' : 'thana.s@factory.com'}
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
                  <div className={`item-avatar ${key}`}>
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
              <div className="shadcn-dropdown-item" onClick={() => { setActiveNav('settings'); setShowRoleDropdown(false); }}>
                <span className="item-icon"><i className="fa-solid fa-gear"></i></span>
                <span>การตั้งค่า</span>
              </div>
              <div className="shadcn-dropdown-item" onClick={() => { setActiveNav('faq'); setShowRoleDropdown(false); }}>
                <span className="item-icon"><i className="fa-solid fa-circle-question"></i></span>
                <span>คู่มือ & คำถามทั่วไป</span>
              </div>

              <div className="shadcn-dropdown-divider" />

              {/* Logout */}
              <div className="shadcn-dropdown-item danger" onClick={() => setShowRoleDropdown(false)}>
                <span className="item-icon"><i className="fa-solid fa-right-from-bracket"></i></span>
                <span>ออกจากระบบ</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
