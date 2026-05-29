import React from 'react';
import { useApp } from '../context/AppContext';
import { NAV_CONFIG } from '../data/mockData';

const FALLBACK_REGISTRY = {
  profile: { section: 'ข้อมูลผู้ใช้', label: 'โปรไฟล์', icon: 'user' },
  'create-ticket': { section: 'การดำเนินการ', label: 'แจ้งเรื่องใหม่', icon: 'ticket' },
  escalated: { section: 'การจัดการ', label: 'เร่งด่วน / Line Stop', icon: 'triangle-exclamation' },
  assign: { section: 'การจัดการ', label: 'มอบหมายงาน', icon: 'user-plus' },
  'approved-history': { section: 'การอนุมัติ', label: 'ประวัติการอนุมัติ', icon: 'clock-rotate-left' },
  reports: { section: 'วิเคราะห์', label: 'รายงาน & วิเคราะห์', icon: 'chart-line' },
  users: { section: 'วิเคราะห์', label: 'จัดการผู้ใช้งาน', icon: 'user-shield' },
  settings: { section: 'วิเคราะห์', label: 'ตั้งค่าระบบ', icon: 'gear' },
  audit: { section: 'วิเคราะห์', label: 'Audit Log', icon: 'file-lines' },
  faq: { section: 'อื่น ๆ', label: 'คำถามที่พบบ่อย', icon: 'circle-question' },
};

export default function Breadcrumbs() {
  const { role, activeNav, setActiveNav } = useApp();

  // Always start with home/dashboard
  const trail = [{ label: 'หน้าหลัก', icon: 'house', activeNav: 'dashboard' }];

  if (activeNav !== 'dashboard') {
    // 1. Try to find in current role's NAV_CONFIG
    const sections = NAV_CONFIG[role] || [];
    let foundSection = null;
    let foundItem = null;

    for (const sec of sections) {
      const item = sec.items.find(i => i.id === activeNav);
      if (item) {
        foundSection = sec;
        foundItem = item;
        break;
      }
    }

    if (foundSection && foundItem) {
      trail.push({ label: foundSection.section });
      trail.push({ label: foundItem.label, icon: foundItem.icon, activeNav: foundItem.id });
    } else {
      // 2. Fall back to registry
      const fallback = FALLBACK_REGISTRY[activeNav];
      if (fallback) {
        trail.push({ label: fallback.section });
        trail.push({ label: fallback.label, icon: fallback.icon, activeNav });
      } else {
        // Last fallback: just the activeNav ID
        trail.push({ label: activeNav, activeNav });
      }
    }
  }

  const handleLinkClick = (id) => {
    if (id) {
      setActiveNav(id);
    }
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {trail.map((item, index) => {
        const isLast = index === trail.length - 1;
        const isClickable = item.activeNav && !isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="breadcrumb-separator">
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </span>
            )}
            <div className="breadcrumb-item">
              {isClickable ? (
                <button
                  onClick={() => handleLinkClick(item.activeNav)}
                  className="breadcrumb-link"
                  style={{ border: 'none', background: 'transparent', padding: '4px 8px', font: 'inherit' }}
                >
                  {item.icon && <i className={`fa-solid fa-${item.icon}`} aria-hidden="true"></i>}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className={isLast ? 'breadcrumb-current' : 'breadcrumb-section'}>
                  {item.icon && <i className={`fa-solid fa-${item.icon}`} aria-hidden="true"></i>}
                  <span>{item.label}</span>
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
