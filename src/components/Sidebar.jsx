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
        { id: 'create-ticket', icon: 'plus',           label: 'แจ้งเรื่อง' },
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
        <div className="sidebar-footer-btn" onClick={() => { setActiveNav('settings'); setShowRoleDropdown(false); }}>
          <i className="fa-solid fa-gear" style={{ fontSize: 14 }} aria-hidden="true"></i>
          <span>การตั้งค่า</span>
        </div>
        
        <div className="sidebar-footer-btn" style={{ color: 'var(--danger)' }}>
          <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 14 }} aria-hidden="true"></i>
          <span>ออกจากระบบ</span>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', margin: '12px -12px', padding: '12px 12px 0' }}>
          {/* Role Switcher in Footer */}
          <div className="sidebar-role" onClick={() => setShowRoleDropdown(v => !v)} style={{ margin: 0, padding: '8px' }}>
            <div className={`role-avatar ${role}`} style={{ width: 32, height: 32, fontSize: 13 }}>
              {info.initials}
            </div>
            <div className="role-info">
              <div className="role-name">{info.name}</div>
              <div className="role-label">{info.label}</div>
            </div>
            <i className={`fa-solid fa-${showRoleDropdown ? 'chevron-down' : 'chevron-up'} role-chevron`}  aria-hidden="true"></i>
          </div>

          {showRoleDropdown && (
            <div className="role-dropdown" style={{ top: 'auto', bottom: '100%', marginBottom: '10px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '8px 14px 6px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                บัญชี Demo
              </div>
              {Object.entries(ROLE_INFO).map(([key, ri]) => (
                <div
                  key={key}
                  className="role-option"
                  onClick={() => { setRole(key); setActiveNav('dashboard'); setShowRoleDropdown(false); }}
                >
                  <div className={`role-option-avatar ${key}`} style={{ background: ri.color }}>
                    <i className={`fa-solid fa-${ROLE_ICON[key]}`} style={{ color: '#fff', fontSize: 13 }} aria-hidden="true"></i>
                  </div>
                  <div>
                    <div className="role-option-name">{ri.name}</div>
                    <div className="role-option-desc">{ri.label} — {ri.desc}</div>
                  </div>
                  {key === role && (
                    <i className="fa-solid fa-check" style={{ marginLeft: 'auto', color: '#10b981', fontSize: 14 }} aria-hidden="true"></i>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
