import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, STATUS_LABEL, CATEGORIES } from '../data/mockData';
import PageSizeDropdown from '../components/PageSizeDropdown';
import { smoothScrollToTop } from '../utils/scroll';
import { calcSLA, SLA_STATUS_CONFIG, SLA_POLICY, aggregateSLAStats, formatDeadline, CLOSED_STATUSES } from '../utils/sla';
import { SLABar } from '../components/SLAComponents';

// Inject keyframes style helper for dropdown menu animations
if (typeof document !== 'undefined') {
  const styleId = 'sla-view-custom-keyframes';
  if (!document.getElementById(styleId)) {
    const sheet = document.createElement('style');
    sheet.id = styleId;
    sheet.innerHTML = `
      @keyframes dropdownIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(sheet);
  }
}

const URGENCY_TH = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', critical: 'วิกฤต' };
const URGENCY_COLOR = { low: '#16a34a', medium: '#d97706', high: '#ef4444', critical: '#7c3aed' };
const STATUS_TH = { new: 'ใหม่', open: 'เปิด', 'in-progress': 'กำลังดำเนินการ', pending: 'รออนุมัติ', resolved: 'แก้ไขแล้ว', closed: 'ปิด', rejected: 'ปฏิเสธ' };

// ── Circular gauge for SLA compliance rate ──
function SLAGauge({ value }) {
  const r = 44, cx = 54, cy = 54, sw = 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 90 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-main)" strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text-primary)">{value}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">อัตราผ่าน</text>
    </svg>
  );
}

// ── Small stat pill ──
function SLAStat({ icon, label, value, color, bg, border }) {
  return (
    <div className="stat-card" style={{
      background: bg,
      borderColor: border,
      flex: '1 1 140px',
    }}>
      <div className="stat-icon" style={{
        background: color,
        color: '#fff',
      }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

// Helper component for rendering agent avatars in the table
function TableAvatar({ name, avatarUrl }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const initials = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div style={{
      width: 26,
      height: 26,
      borderRadius: '50%',
      background: (!name || name === 'รอมอบหมาย') ? 'var(--bg-main)' : 'var(--primary)',
      color: (!name || name === 'รอมอบหมาย') ? 'var(--text-muted)' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: (!name || name === 'รอมอบหมาย') ? 11 : 10,
      fontWeight: 800,
      border: '1px solid var(--border-light)',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {name && name !== 'รอมอบหมาย' && avatarUrl && !imageError ? (
        <img 
          src={avatarUrl} 
          alt="avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={() => setImageError(true)}
        />
      ) : (
        (!name || name === 'รอมอบหมาย') ? (
          <i className="fa-solid fa-hourglass-half" aria-hidden="true"></i>
        ) : (
          initials
        )
      )}
    </div>
  );
}

// CustomDropdown — identical to TicketTable.jsx
function CustomDropdown({ id, icon, label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const isActive = !!value;

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }} id={id}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
          background: isActive ? 'var(--primary-pale)' : 'var(--bg-card)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.18s ease',
          minWidth: 0,
        }}
      >
        <i className={`fa-solid fa-${icon}`} style={{ fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{label}:</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          flex: 1,
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {selected?.dot && (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.dot, flexShrink: 0, display: 'inline-block' }} />
          )}
          {selected?.icon && (
            <i className={`fa-solid fa-${selected.icon}`} style={{ fontSize: 11, flexShrink: 0, color: selected.iconColor || 'inherit' }} />
          )}
          {selected ? selected.label : placeholder}
        </span>
        {isActive && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
            style={{ fontSize: 11, color: 'var(--primary)', padding: '2px 4px', borderRadius: 4, cursor: 'pointer', flexShrink: 0 }}
          >
            <i className="fa-solid fa-xmark" />
          </span>
        )}
        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'transform 0.18s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.13), 0 2px 8px rgba(37,99,235,0.08)',
          zIndex: 1000,
          overflow: 'hidden',
          minWidth: '100%',
          animation: 'dropdownIn 0.15s ease',
        }}>
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            style={{
              width: '100%',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: !value ? 'var(--primary-pale)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: !value ? 700 : 500,
              color: !value ? 'var(--primary)' : 'var(--text-secondary)',
              textAlign: 'left',
              transition: 'background 0.12s',
              borderBottom: '1px solid var(--border-light)',
            }}
            onMouseEnter={e => { if (value) e.currentTarget.style.background = 'var(--bg-main)'; }}
            onMouseLeave={e => { if (value) e.currentTarget.style.background = 'transparent'; }}
          >
            {!value && <i className="fa-solid fa-check" style={{ fontSize: 11, color: 'var(--primary)' }} />}
            {placeholder}
          </button>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: value === opt.value ? 'var(--primary-pale)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: value === opt.value ? 700 : 400,
                  color: value === opt.value ? 'var(--primary)' : 'var(--text-primary)',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-main)'; }}
                onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.dot && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0, display: 'inline-block' }} />
                )}
                {opt.icon && !opt.dot && (
                  <i className={`fa-solid fa-${opt.icon}`} style={{
                    fontSize: 12, flexShrink: 0,
                    color: opt.iconColor || 'var(--text-muted)'
                  }} />
                )}
                <span style={{ flex: 1 }}>{opt.label}</span>
                {value === opt.value && <i className="fa-solid fa-check" style={{ fontSize: 11, color: 'var(--primary)', marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// MobileCustomSelect — identical to TicketTable.jsx
function MobileCustomSelect({ value, onChange, options, placeholder, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px', borderRadius: 10,
          border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border-light)'}`,
          background: open ? 'var(--primary-pale)' : 'var(--bg-card)',
          color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer', outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <i
              className={`fa-solid fa-${selected ? (selected.icon || icon) : icon}`}
              style={{ fontSize: 13, color: selected ? (selected.iconColor || 'var(--primary)') : 'var(--text-muted)' }}
            />
          )}
          <span>{selected ? selected.label : placeholder}</span>
        </span>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: 11, color: 'var(--text-muted)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <div style={{
        marginTop: open ? 6 : 0,
        background: 'var(--bg-card)',
        border: open ? '1.5px solid var(--border-light)' : '1.5px solid transparent',
        borderRadius: 10,
        boxShadow: open ? 'var(--shadow-md)' : 'none',
        overflowX: 'hidden',
        overflowY: open ? 'auto' : 'hidden',
        zIndex: 100,
        maxHeight: open ? '260px' : '0px',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.22s ease-in-out, opacity 0.18s ease-in-out, margin 0.22s ease-in-out, border-color 0.18s ease-in-out',
        pointerEvents: open ? 'auto' : 'none'
      }}>
        <button type="button" onClick={() => { onChange(''); setOpen(false); }}
          style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, background: !value ? 'var(--primary-pale)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', fontSize: 13.5, fontWeight: !value ? 700 : 500, color: !value ? 'var(--primary)' : 'var(--text-primary)', textAlign: 'left' }}
        >
          <span style={{ width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 2, flexShrink: 0 }}>{!value && <i className="fa-solid fa-check" style={{ fontSize: 12, color: 'var(--primary)' }} />}</span>
          {icon && <i className={`fa-solid fa-${icon}`} style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }} />}
          <span>{placeholder}</span>
        </button>
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
            style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, background: value === opt.value ? 'var(--primary-pale)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', fontSize: 13.5, fontWeight: value === opt.value ? 700 : 500, color: value === opt.value ? 'var(--primary)' : 'var(--text-primary)', textAlign: 'left' }}
          >
            <span style={{ width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 2, flexShrink: 0 }}>{value === opt.value && <i className="fa-solid fa-check" style={{ fontSize: 12, color: 'var(--primary)' }} />}</span>
            {opt.icon && <i className={`fa-solid fa-${opt.icon}`} style={{ fontSize: 12, color: opt.iconColor || 'var(--text-muted)', flexShrink: 0 }} />}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SLAView() {
  const { tickets, role, currentUser, openTicketDetail } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Desktop filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  // Pending filter state for mobile bottom sheet (apply on confirm)
  const [pendingFilter, setPendingFilter] = useState('all');
  const [pendingStatusFilter, setPendingStatusFilter] = useState('');
  const [pendingUrgencyFilter, setPendingUrgencyFilter] = useState('');
  const [pendingCatFilter, setPendingCatFilter] = useState('');
  const [pendingHideCompleted, setPendingHideCompleted] = useState(false);


  const myDeptName = currentUser?.department?.name || currentUser?.departmentName || (typeof currentUser?.department === 'string' ? currentUser.department : null);

  const deptFilteredTickets = tickets.filter(t => {
    if (role === ROLES.ADMIN || role === 'admin') return true;
    if (role === ROLES.MANAGER || role === 'manager') {
      return myDeptName && (t.targetDepartment === myDeptName || t.department === myDeptName);
    }
    return true;
  });

  const stats = aggregateSLAStats(deptFilteredTickets);

  const getCategoryPath = (ticket) => {
    const catMap = {
      hardware: 'ฮาร์ดแวร์ / อุปกรณ์',
      software: 'ซอฟต์แวร์ / โปรแกรม',
      network: 'อินเทอร์เน็ต / Wi-Fi',
      access: 'สิทธิ์เข้าใช้งาน',
      other: 'ทั่วไป / บริการอื่นๆ'
    };
    const subMap = {
      computer_laptop: "คอมพิวเตอร์ / โน้ตบุ๊ก",
      monitor: "หน้าจอ / จอภาพ",
      printer_scanner: "ปริ้นเตอร์",
      accessory: "คีย์บอร์ด / เมาส์",
      hardware_other: "อุปกรณ์อื่นๆ",
      os_system: "OS (Windows / macOS)",
      office_apps: "Microsoft 365 / Outlook",
      internal_systems: "ERP / ระบบงานภายใน",
      install_update: "ติดตั้ง / อัปเดตโปรแกรม",
      software_other: "ซอฟต์แวร์อื่นๆ",
      wifi_issue: "ต่อ Wi-Fi ไม่ได้",
      lan_issue: "เน็ตสายแลนเสีย",
      vpn_remote: "VPN / เข้าถึงระยะไกล",
      slow_network: "เน็ตช้า / หลุดบ่อย",
      network_other: "ระบบเครือข่ายอื่นๆ",
      password_reset: "รีเซ็ตรหัสผ่าน / ปลดล็อกบัญชี",
      shared_folder: "ขอสิทธิ์โฟลเดอร์แชร์",
      license_request: "ขอสิทธิ์ใช้งานโปรแกรม / อีเมล",
      keycard_building: "บัตรพนักงาน / สิทธิ์เข้าออกอาคาร",
      access_other: "สิทธิ์เข้าใช้งานอื่นๆ",
      desk_chair: "ขอโต๊ะทำงาน / เก้าอี้",
      stationery: "อุปกรณ์สำนักงาน / เครื่องเขียน",
      intern_coord: "ประสานงานนักศึกษาฝึกงาน",
      consultation: "ขอคำปรึกษา / แนะนำทั่วไป",
      other_general: "บริการและคำขอทั่วไปอื่นๆ",
    };
    const catLabel = catMap[ticket.category] || ticket.category;
    const subLabel = subMap[ticket.subCategory] || ticket.subCategory;
    return subLabel ? `${catLabel} > ${subLabel}` : catLabel;
  };

  const getUrgencyBadge = (urgency) => {
    const map = {
      low:      { label: 'ต่ำ',        bg: 'rgba(16,185,129,0.15)',  color: '#059669', border: 'rgba(16,185,129,0.4)',  icon: 'circle-check' },
      medium:   { label: 'ปานกลาง', bg: 'rgba(245,158,11,0.15)',  color: '#b45309', border: 'rgba(245,158,11,0.4)',  icon: 'circle-minus' },
      high:     { label: 'สูง',        bg: 'rgba(239,68,68,0.15)',   color: '#dc2626', border: 'rgba(239,68,68,0.4)',   icon: 'circle-exclamation' },
      critical: { label: 'วิกฤต',      bg: 'rgba(124,58,237,0.15)', color: '#7c3aed', border: 'rgba(124,58,237,0.4)', icon: 'triangle-exclamation' },
    };
    const cfg = map[urgency] || map.medium;
    return (
      <span style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1.5px solid ${cfg.border}`,
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        whiteSpace: 'nowrap',
      }}>
        <i className={`fa-solid fa-${cfg.icon}`} style={{ fontSize: 10 }} />
        {cfg.label}
      </span>
    );
  };

  const HIDE_STATUSES = new Set(['resolved', 'closed', 'cancelled']);

  // Filter tickets for the table
  const displayTickets = deptFilteredTickets.filter(t => {
    const sla = calcSLA(t);
    if (!sla) return false;
    if (hideCompleted && HIDE_STATUSES.has(t.status)) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (urgencyFilter && t.urgency !== urgencyFilter) return false;
    if (catFilter && t.category !== catFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matches = (
        t.id?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.createdBy?.toLowerCase().includes(q) ||
        t.department?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q)
      );
      if (!matches) return false;
    }
    if (filter === 'active')   return !CLOSED_STATUSES.has(t.status);
    if (filter === 'breached') return sla.slaStatus === 'breached';
    if (filter === 'at-risk')  return sla.slaStatus === 'at-risk';
    if (filter === 'missed')   return sla.slaStatus === 'missed';
    if (filter === 'met')      return sla.slaStatus === 'met';
    return true;
  }).sort((a, b) => {
    const sa = calcSLA(a), sb = calcSLA(b);
    return (sb?.pct || 0) - (sa?.pct || 0);
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState('1');
  const dataSectionRef = useRef(null);
  const isMounted = useRef(false);



  useEffect(() => {
    if (pageInput !== String(currentPage)) {
      Promise.resolve().then(() => {
        setPageInput(String(currentPage));
      });
    }
  }, [currentPage, pageInput]);

  useEffect(() => {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      smoothScrollToTop(pageContent, 200); // 200ms duration is fast but smooth
    }
  }, [currentPage]);

  const totalPages = Math.ceil(displayTickets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = displayTickets.slice(startIndex, startIndex + pageSize);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div ref={dataSectionRef} style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── DESKTOP ONLY LAYOUT ─── */}
      <div className="desktop-only-layout" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Desktop Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {role === 'manager' ? 'ติดตามกำหนดเวลา SLA ประจำแผนก' : 'ติดตามกำหนดเวลา (SLA)'}
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, marginLeft: 46, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>Service Level Agreement — ติดตามและวิเคราะห์เวลาการแก้ไข Ticket ตามเป้าหมายเวลาดำเนินการ</span>
              {role === 'manager' && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--primary-pale)', color: 'var(--primary)', fontWeight: 700, border: '1px solid rgba(37,99,235,0.2)' }}>
                  <i className="fa-solid fa-building" style={{ marginRight: 4 }} />
                  เฉพาะแผนก {currentUser?.department?.name || currentUser?.departmentName || 'ของท่าน'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Desktop SLA Policy Reference */}
        <div className="table-card" style={{ padding: '20px 24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16, marginTop: 0 }}>
            <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)' }}></i>
            เป้าหมายเวลาดำเนินการตามระดับความเร่งด่วน (SLA Policy)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {Object.entries(SLA_POLICY).map(([key, p]) => (
              <div key={key} style={{
                background: 'var(--bg-card)',
                border: `1.5px solid ${URGENCY_COLOR[key]}30`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: URGENCY_COLOR[key], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: URGENCY_COLOR[key] }}></span>
                    {URGENCY_TH[key]}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, margin: '4px 0' }}>
                    {p.label}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Stats row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', width: '100%', marginBottom: 8 }}>
          {/* Gauge */}
          {stats.metRate !== null && (
            <div className="table-card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 24px', flex: '1 1 350px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <SLAGauge value={stats.metRate} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <h4 style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>อัตราทำงานเสร็จทันเวลา</h4>
                <div style={{ fontSize: 12.5, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                  เสร็จทันเวลา: {stats.met} เคส
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }}></span>
                  เกินกำหนด: {stats.missed} เคส
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-light)', paddingTop: 6, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>รวมปิดงานแล้ว: {stats.closedCount} เคส</div>
                  <div style={{ fontSize: 11.2, fontWeight: 500 }}>Ticket ทั้งหมดในระบบ: {stats.activeCount + stats.closedCount} เคส</div>
                </div>
              </div>
            </div>
          )}
          {/* KPI Pills — kpi-card style */}
          <div style={{ flex: '2 1 650px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'ยังไม่ได้รับงาน', val: stats.notStarted, icon: 'clock', color: '#6366f1', bg: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.02) 100%)', border: '#6366f180', iconBg: '#EEF2FF' },
              { label: 'ยังอยู่ในเกณฑ์', val: stats.onTrack, icon: 'check', color: '#2563eb', bg: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.02) 100%)', border: '#3b82f630', iconBg: '#E0F2FE' },
              { label: 'ใกล้หมดเวลา', val: stats.atRisk, icon: 'triangle-exclamation', color: '#D97706', bg: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.02) 100%)', border: '#F59E0B30', iconBg: '#FEF3C7' },
              { label: 'เกินกำหนด (ค้าง)', val: stats.breached, icon: 'circle-xmark', color: '#ef4444', bg: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(239,68,68,0.02) 100%)', border: '#ef444430', iconBg: '#FEE2E2' },
              { label: 'เสร็จทันกำหนด', val: stats.met, icon: 'trophy', color: '#059669', bg: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.02) 100%)', border: '#10b98130', iconBg: '#D1FAE5' },
              { label: 'เสร็จเกินกำหนด', val: stats.missed, icon: 'circle-exclamation', color: '#64748b', bg: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(100,116,139,0.02) 100%)', border: '#64748b80', iconBg: '#E2E8F0' },
            ].map((kpi, idx) => (
              <div key={idx} className="table-card" style={{
                background: kpi.bg,
                padding: '16px 20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)',
                border: `1.5px solid ${kpi.border}`, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', height: '100%', boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>{kpi.label}</span>
                  <div className="kpi-icon-box" style={{ width: 32, height: 32, borderRadius: 8, background: kpi.iconBg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    <i className={`fa-solid fa-${kpi.icon}`} aria-hidden="true"></i>
                  </div>
                </div>
                <div className="kpi-value" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{kpi.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MOBILE ONLY LAYOUT (Original Header, Policies & Stats) ─── */}
      <div className="mobile-only-layout">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 4 }}>
              ติดตามกำหนดเวลา (SLA)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 , margin: 4 }}>
              Service Level Agreement — ติดตามและวิเคราะห์เวลาการแก้ไข Ticket ตามเป้าหมายเวลาดำเนินการ
            </p>
          </div>
        </div>

        {/* SLA Policy Reference */}
        <div className="report-chart-card" style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--text-primary)' }} aria-hidden="true"></i>
            เป้าหมายเวลาดำเนินการตามระดับความเร่งด่วน (SLA Policy)
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(SLA_POLICY).map(([key, p]) => (
              <div key={key} style={{
                flex: '1 1 120px',
                background: 'var(--bg-card)',
                border: `1.5px solid ${URGENCY_COLOR[key]}60`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: URGENCY_COLOR[key], textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  {URGENCY_TH[key]}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
          {/* Gauge */}
          {stats.metRate !== null && (
            <div className="report-chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flex: '1 1 260px', padding: '20px 24px', width: '100%', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)' }}>
              <SLAGauge value={stats.metRate} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>อัตราทำงานเสร็จทันเวลา</h4>
                <div style={{ fontSize: 12.5, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                  เสร็จทันเวลา: {stats.met} เคส
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }}></span>
                  เกินกำหนด: {stats.missed} เคส
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500, borderTop: '1px solid var(--border-light)', paddingTop: 4, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div>รวมปิดงานแล้ว: {stats.closedCount} เคส</div>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>Ticket ทั้งหมด: {stats.activeCount + stats.closedCount} เคส</div>
                </div>
              </div>
            </div>
          )}
          {/* KPI Pills — kpi-card style */}
          <div className="dashboard-summary-grid" style={{ flex: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {/* ยังไม่ได้รับงาน */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.03) 100%)',
              padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid #6366f180', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '110px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>ยังไม่ได้รับงาน</span>
                <div className="kpi-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: '#EEF2FF', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className="fa-solid fa-clock" aria-hidden="true"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.notStarted}</div>
            </div>

            {/* ยังอยู่ในเกณฑ์ */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.03) 100%)',
              padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid #3b82f6', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '110px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>ยังอยู่ในเกณฑ์</span>
                <div className="kpi-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: '#E0F2FE', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className="fa-solid fa-check" aria-hidden="true"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.onTrack}</div>
            </div>

            {/* ใกล้หมดเวลา */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.03) 100%)',
              padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid #F59E0B', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '110px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>ใกล้หมดเวลา</span>
                <div className="kpi-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.atRisk}</div>
            </div>

            {/* เกินกำหนด (ค้าง) */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(239,68,68,0.03) 100%)',
              padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '110px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>เกินกำหนด (ค้าง)</span>
                <div className="kpi-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: '#FEE2E2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.breached}</div>
            </div>

            {/* เสร็จทันกำหนด */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.03) 100%)',
              padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1px solid #10b981', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '110px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>เสร็จทันกำหนด</span>
                <div className="kpi-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className="fa-solid fa-trophy" aria-hidden="true"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.met}</div>
            </div>

            {/* เสร็จเกินกำหนด */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(100,116,139,0.03) 100%)',
              padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid #64748b80', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', minHeight: '110px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>เสร็จเกินกำหนด</span>
                <div className="kpi-icon-box" style={{ width: 34, height: 34, borderRadius: 10, background: '#E2E8F0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{stats.missed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP ONLY: SLA Table ─── */}
      <div className="desktop-only-layout">
        <div className="table-card" style={{ overflow: 'hidden' }}>
          {/* Desktop Toolbar */}
          <div className="table-toolbar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }} aria-hidden="true" />
                รายการ Ticket ในข้อตกลง SLA
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                ({displayTickets.length} รายการ)
              </span>
            </div>

            {/* Desktop Search & SLA Filter Dropdown */}
            <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'center' }}>
              <div className="topbar-search" style={{
                flex: 1,
                background: 'var(--bg-main)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <span className="topbar-search-icon" style={{ fontSize: 15, color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                </span>
                <input
                  id="sla-search-input"
                  placeholder="ค้นหา Ticket ID, หัวข้อ, หรือผู้แจ้ง..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ fontSize: 13.5, background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CustomDropdown
                  icon="filter"
                  label="ตัวกรอง SLA"
                  value={filter === 'all' ? '' : filter}
                  onChange={(v) => { setFilter(v || 'all'); setCurrentPage(1); }}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'active',   label: `กำลังดำเนินการ (${tickets.filter(t => !CLOSED_STATUSES.has(t.status)).length})`, icon: 'spinner', iconColor: 'var(--primary)' },
                    { value: 'met',      label: `เสร็จทันกำหนด (${stats.met})`, icon: 'circle-check', iconColor: '#10b981' },
                    { value: 'breached', label: `เกินกำหนด (กำลังทำ) (${stats.breached})`, icon: 'triangle-exclamation', iconColor: 'var(--danger)' },
                    { value: 'at-risk',  label: `ใกล้หมดเวลา (${stats.atRisk})`, icon: 'clock', iconColor: '#d97706' },
                    { value: 'missed',   label: `เกินกำหนด (ปิดแล้ว) (${stats.missed})`, icon: 'circle-xmark', iconColor: 'var(--text-muted)' },
                  ]}
                />
              </div>
            </div>

            {/* Controls Row: Hide Completed Checkbox & Clear Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>การกรองข้อมูล:</span>
                <button
                  type="button"
                  onClick={() => { setHideCompleted(!hideCompleted); setCurrentPage(1); }}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, outline: 'none', userSelect: 'none' }}
                >
                  <span style={{
                    position: 'relative', width: 44, height: 24,
                    background: hideCompleted ? 'var(--primary)' : '#cbd5e1',
                    borderRadius: 24, transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'inline-block'
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: hideCompleted ? 23 : 3,
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    ซ่อนเคสที่สำเร็จ / ปิดแล้ว / ยกเลิก
                  </span>
                </button>
              </div>

              {(filter !== 'all' || searchQuery || hideCompleted) && (
                <button
                  onClick={() => { setFilter('all'); setSearchQuery(''); setHideCompleted(false); setCurrentPage(1); }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-pale)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-light)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'var(--transition)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <i className="fa-solid fa-xmark" /> ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          {displayTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fa-solid fa-inbox" aria-hidden="true" /></div>
              <div className="empty-state-title">ไม่มีรายการในกลุ่มนี้</div>
              <div className="empty-state-desc">ลองเปลี่ยนตัวกรองด้านบน</div>
            </div>
          ) : (
            <div className="desktop-only-layout">
              <div className="table-wrapper">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 70, padding: '12px 8px' }}>รหัส / วันที่</th>
                      <th style={{ minWidth: 90, padding: '12px 8px' }}>ผู้แจ้ง / แผนก</th>
                      <th style={{ minWidth: 140, padding: '12px 8px' }}>หัวข้อ / หมวดหมู่</th>
                      <th style={{ minWidth: 70, padding: '12px 8px' }}>ความเร่งด่วน</th>
                      <th style={{ minWidth: 70, padding: '12px 8px' }}>สถานะ</th>
                      <th style={{ minWidth: 160, padding: '12px 8px' }}>ความคืบหน้า SLA</th>
                      <th style={{ minWidth: 90, padding: '12px 8px' }}>ผู้รับผิดชอบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map(t => {
                      const sla = calcSLA(t);
                      if (!sla) return null;
                      const statusColorMap = {
                        pending: { bg: 'rgba(59, 130, 246, 0.12)', color: 'rgb(59, 130, 246)', border: 'rgba(59, 130, 246, 0.25)' },
                        progress: { bg: 'rgba(245, 158, 11, 0.12)', color: 'rgb(245, 158, 11)', border: 'rgba(245, 158, 11, 0.25)' },
                        'wait-approve': { bg: 'rgba(124, 58, 237, 0.12)', color: 'rgb(124, 58, 237)', border: 'rgba(124, 58, 237, 0.25)' },
                        approved: { bg: 'rgba(16, 185, 129, 0.12)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.25)' },
                        rejected: { bg: 'rgba(239, 68, 68, 0.12)', color: 'rgb(239, 68, 68)', border: 'rgba(239, 68, 68, 0.25)' },
                        forwarded: { bg: 'rgba(14, 165, 233, 0.12)', color: 'rgb(14, 165, 233)', border: 'rgba(14, 165, 233, 0.25)' },
                        'wait-parts': { bg: 'rgba(100, 116, 139, 0.12)', color: 'rgb(100, 116, 139)', border: 'rgba(100, 116, 139, 0.25)' },
                        resolved: { bg: 'rgba(16, 185, 129, 0.12)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.25)' },
                        closed: { bg: 'rgba(71, 85, 105, 0.12)', color: 'rgb(71, 85, 105)', border: 'rgba(71, 85, 105, 0.25)' },
                        cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: 'rgb(239, 68, 68)', border: 'rgba(239, 68, 68, 0.25)' },
                      };
                      const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                      const sc = statusColorMap[t.status] || statusColorMap.pending;

                      return (
                        <tr key={t.id} id={`sla-row-${t.id}`} onClick={() => openTicketDetail(t.id)} style={{ cursor: 'pointer' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span className="ticket-id" style={{ width: 'fit-content' }}>#{t.id.substring(0, 8)}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.createdAt?.split(',')[0]}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, whiteSpace: 'nowrap' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{t.createdBy}</span>
                              <span style={{
                                background: 'var(--primary-bg)',
                                color: 'var(--primary)',
                                border: '1px solid var(--border-light)',
                                padding: '1px 6px',
                                fontSize: 10,
                                fontWeight: 700,
                                borderRadius: 4,
                                whiteSpace: 'nowrap'
                              }}>{t.department}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 200 }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.subject}>
                                {t.subject}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, maxWidth: '100%' }}>
                                <i className="fa-solid fa-tags" style={{ fontSize: 9, flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                                  {CATEGORIES[t.category]?.label || t.category} / {t.subCategory}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              background: t.urgency === 'critical' ? 'rgba(124, 58, 237, 0.12)' : t.urgency === 'high' ? 'rgba(239, 68, 68, 0.12)' : t.urgency === 'medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                              color: URGENCY_COLOR[t.urgency],
                              border: `1.5px solid ${URGENCY_COLOR[t.urgency]}25`,
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11.5,
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: URGENCY_COLOR[t.urgency] }} />
                              {URGENCY_TH[t.urgency]}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              background: sc.bg,
                              color: sc.color,
                              border: `1.5px solid ${sc.border}`,
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 800,
                              width: 'fit-content',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              whiteSpace: 'nowrap'
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td style={{ minWidth: 160, padding: '12px 8px' }}>
                            <SLABar ticket={t} showLabel={true} showBottomLabel={false} stackLabel={true} />
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                              <TableAvatar name={t.assignedTo} avatarUrl={t.agentAvatar} />
                              <span style={{ 
                                fontSize: 12.5, 
                                fontWeight: 600, 
                                color: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 'var(--text-muted)' : 'var(--text-primary)', 
                                fontStyle: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 'italic' : 'normal',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 110,
                                display: 'inline-block'
                              }} title={t.assignedTo || 'รอมอบหมาย'}>
                                {t.assignedTo || 'รอมอบหมาย'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Desktop Pagination */}
              {displayTickets.length > 0 && (
                <div className="table-pagination" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <div className="table-pagination-size">
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>แสดงผล:</span>
                    <PageSizeDropdown 
                      value={pageSize} 
                      onChange={(val) => { setPageSize(val); setCurrentPage(1); }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>รายการ</span>
                  </div>

                  <div className="table-pagination-nav">
                    <div className="table-pagination-input-wrap">
                      <span>ไปที่หน้า:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages || 1}
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onKeyDown={handlePageInputKeyDown}
                        onBlur={handlePageInputSubmit}
                        style={{
                          width: '46px',
                          height: '32px',
                          padding: '0 6px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          outline: 'none',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontSize: 13,
                          fontWeight: '500',
                        }}
                        className="page-num-input"
                      />
                      <span style={{ color: 'var(--text-muted)' }}>/ {totalPages || 1}</span>
                    </div>

                    <div className="pagination-container">
                      <button 
                        type="button"
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <i className="fa-solid fa-chevron-left" style={{ marginRight: 6 }}></i>
                        ก่อนหน้า
                      </button>
                      {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                          return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
                        }
                        return (
                          <button
                            key={page}
                            type="button"
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button 
                        type="button"
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        ถัดไป
                        <i className="fa-solid fa-chevron-right" style={{ marginLeft: 6 }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>{/* /table-card */}
      </div>{/* /desktop-only-layout */}

      {/* ─── MOBILE ONLY LAYOUT ─── */}
      <div className="mobile-only-layout">
        {/* Mobile sticky header — same structure as TicketTable */}
        <div className="mobile-header-search-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          margin: '12px 0 8px 0',
          padding: '16px',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 12,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h1 className="mobile-header-title" style={{
              fontSize: 16,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 8
            }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)', fontSize: 15 }} aria-hidden="true" />
              ติดตาม SLA
            </h1>
          </div>
          
          <div style={{
            height: '1px',
            background: 'var(--border-light)',
            maxHeight: '1px',
            opacity: 1,
            overflow: 'hidden',
            transition: 'all 0.2s ease-in-out',
            marginTop: 4,
            marginBottom: 4
          }} />
          <div style={{
            display: 'flex',
            gap: 8,
            maxHeight: '50px',
            opacity: 1,
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'auto'
          }}>
            <div className="mobile-search-bar" style={{
              flex: 1, background: 'var(--bg-main)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center',
              padding: '0 12px', height: 40
            }}>
              <i className="fa-solid fa-magnifying-glass search-icon" style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 8 }} />
              <input
                placeholder="ค้นหา Ticket..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="button"
              className="mobile-filter-trigger"
              onClick={() => {
                setPendingFilter(filter);
                setPendingHideCompleted(hideCompleted);
                setShowMobileFilters(true);
              }}
              style={{
                background: (filter !== 'all' || hideCompleted) ? 'var(--primary-pale)' : 'var(--bg-card)',
                color: (filter !== 'all' || hideCompleted) ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1.5px solid ${(filter !== 'all' || hideCompleted) ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)', padding: '0 14px',
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', position: 'relative', height: 40
              }}
            >
              <i className="fa-solid fa-filter" />
              <span>ตัวกรอง</span>
              {(filter !== 'all' || hideCompleted) && (
                <span className="filter-badge-dot" style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Active Chips */}
        {(filter !== 'all' || hideCompleted) && (
          <div className="mobile-active-chips" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '8px 12px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-light)'
          }}>
            {filter !== 'all' && (
              <span className="mobile-chip" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                SLA: {
                  {
                    active: 'กำลังดำเนินการ',
                    met: 'เสร็จทันกำหนด',
                    'at-risk': 'ใกล้หมดเวลา',
                    breached: 'เกินกำหนด (กำลังทำ)',
                    missed: 'เกินกำหนด (ปิดแล้ว)'
                  }[filter] || filter
                }
                <button
                  type="button"
                  onClick={() => { setFilter('all'); setCurrentPage(1); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            )}
            {hideCompleted && (
              <span className="mobile-chip" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                ซ่อนเคสที่สำเร็จ / ปิดแล้ว
                <button
                  type="button"
                  onClick={() => { setHideCompleted(false); setCurrentPage(1); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Mobile Result Bar */}
        <div className="mobile-result-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          background: 'var(--bg-main)',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontWeight: 600
        }}>
          <span>พบ {displayTickets.length} รายการ</span>
          {(filter !== 'all' || searchQuery || hideCompleted) && (
            <button 
              type="button"
              onClick={() => { setFilter('all'); setSearchQuery(''); setHideCompleted(false); setCurrentPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Mobile Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
          {displayTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fa-solid fa-inbox" aria-hidden="true" /></div>
              <div className="empty-state-title">ไม่มีรายการในกลุ่มนี้</div>
              <div className="empty-state-desc">ลองเปลี่ยนตัวกรองด้านบน</div>
            </div>
          ) : paginatedData.map(t => {
                  const sla = calcSLA(t);
                  if (!sla) return null;
                  const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                  
                  return (
                    <div 
                      key={t.id} 
                      className="mobile-ticket-card"
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: 16,
                        border: '1px solid var(--border-light)',
                        padding: 16,
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      {/* Section 1: Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'var(--primary-pale)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14
                          }}>
                            <i className="fa-solid fa-clock" />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>
                            #{t.id.substring(0, 8)}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {t.createdAt?.split(',')[0]}
                        </span>
                      </div>

                      {/* Section 2: Subject */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {t.subject}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-tags" style={{ fontSize: 9 }} />
                          <span>{getCategoryPath(t)}</span>
                        </div>
                      </div>

                      {/* Section 3: Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span className={`status-tag ${statusInfo.cls}`} style={{ fontSize: 10, padding: '4px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                          {statusInfo.label}
                        </span>
                        {getUrgencyBadge(t.urgency)}
                      </div>

                      {/* Section 4: Details & Assignee */}
                      <div style={{
                        background: 'var(--bg-main)',
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>ผู้แจ้ง:</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.createdBy} ({t.department})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>ผู้รับผิดชอบ:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TableAvatar name={t.assignedTo} avatarUrl={t.agentAvatar} />
                            <span style={{ fontWeight: 600 }}>{t.assignedTo || 'รอมอบหมาย'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>SLA Status:</span>
                          <SLABar ticket={t} showLabel={true} showBottomLabel={false} />
                        </div>
                      </div>

                      {/* Details Button */}
                      <button
                        type="button"
                        onClick={() => openTicketDetail(t.id)}
                        className="btn btn-outline btn-sm"
                        style={{
                          width: '100%',
                          height: 38,
                          borderRadius: 10,
                          fontSize: 12.5,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        ดูรายละเอียด <i className="fa-solid fa-arrow-right" />
                      </button>

                    </div>
                  );
                })}
        </div>

        {/* Mobile Pagination */}
        {displayTickets.length > 0 && (
          <div className="mobile-pagination-container" style={{
            padding: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            margin: '12px 0 24px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>แสดงผล:</span>
                <PageSizeDropdown 
                  value={pageSize} 
                  onChange={(val) => { setPageSize(val); setCurrentPage(1); }}
                />
                <span style={{ color: 'var(--text-muted)' }}>รายการ</span>
              </div>
              
              <div className="mobile-page-jump" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>ไปที่หน้า:</span>
                <input 
                  type="number"
                  min={1}
                  max={totalPages || 1}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyDown}
                  onBlur={handlePageInputSubmit}
                  style={{
                    width: 44,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>/ {totalPages || 1}</span>
              </div>
            </div>

            <div className="mobile-pagination-pages" style={{ display: 'flex', gap: 6 }}>
              <button 
                type="button" 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-angles-left" style={{ fontSize: 10 }} />
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-angle-left" style={{ fontSize: 11 }} />
              </button>
              
              <div style={{
                height: 36,
                padding: '0 12px',
                borderRadius: 8,
                background: 'var(--primary-pale)',
                border: '1px solid var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                หน้า {currentPage} / {totalPages || 1}
              </div>

              <button 
                type="button" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: (currentPage === totalPages || totalPages === 0) ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-angle-right" style={{ fontSize: 11 }} />
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: (currentPage === totalPages || totalPages === 0) ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-angles-right" style={{ fontSize: 10 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Filter Bottom Sheet ─── */}
      <>
        {/* Backdrop */}
        <div
          className="bottom-sheet-backdrop"
          onClick={() => setShowMobileFilters(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 2500,
            opacity: showMobileFilters ? 1 : 0,
            pointerEvents: showMobileFilters ? 'auto' : 'none',
            transition: 'opacity 0.25s ease'
          }}
        />
        {/* Sheet */}
        <div
          className="bottom-sheet-content"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTop: '1px solid var(--border-light)',
            zIndex: 2501,
            padding: '20px 16px 32px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.15)',
            transform: showMobileFilters ? 'translateY(0)' : 'translateY(100%)',
            opacity: showMobileFilters ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
            pointerEvents: showMobileFilters ? 'auto' : 'none'
          }}
        >
            {/* Header */}
            <div className="bottom-sheet-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: 12
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>ตัวกรองข้อมูล</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowMobileFilters(false)}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-light)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="bottom-sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* SLA Filter */}
            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>SLA</label>
               <MobileCustomSelect
                 value={pendingFilter}
                 onChange={v => setPendingFilter(v)}
                 placeholder="ทั้งหมด"
                 icon="list"
                 options={[
                  { value: 'active',   label: `กำลังดำเนินการ`, icon: 'spinner', iconColor: 'rgb(59,130,246)' },
                  { value: 'met',      label: `เสร็จทันกำหนด`, icon: 'circle-check', iconColor: 'rgb(16,185,129)' },
                  { value: 'at-risk',  label: `ใกล้หมดเวลา `, icon: 'clock', iconColor: 'rgb(245,158,11)' },
                  { value: 'breached', label: `เกินกำหนด (กำลังทำ)`, icon: 'triangle-exclamation', iconColor: 'rgb(239,68,68)' },
                  { value: 'missed',   label: `เกินกำหนด (ปิดแล้ว)`, icon: 'circle-xmark',iconColor: 'rgb(124,58,237)' },
                ]}
              />
            </div>
              {/* Hide Completed Switch */}
              <div className="filter-group" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-main)',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-light)',
                marginTop: 4
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>ซ่อนเคสที่สำเร็จ / ปิดแล้ว / ยกเลิก</span>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={pendingHideCompleted}
                    onChange={e => setPendingHideCompleted(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: pendingHideCompleted ? 'var(--primary)' : '#cbd5e1',
                    transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 24,
                  }}>
                    <span style={{
                      position: 'absolute',
                      height: 18, width: 18,
                      left: pendingHideCompleted ? 23 : 3,
                      top: 3,
                      background: 'white',
                      transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '50%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bottom-sheet-footer" style={{
              display: 'flex',
              gap: 12,
              marginTop: 8,
              borderTop: '1px solid var(--border-light)',
              paddingTop: 16
            }}>
              <button
                type="button"
                className="btn-clear"
                onClick={() => {
                  setPendingFilter('all');
                  setPendingStatusFilter('');
                  setPendingUrgencyFilter('');
                  setPendingCatFilter('');
                  setPendingHideCompleted(false);
                  setFilter('all');
                  setStatusFilter('');
                  setUrgencyFilter('');
                  setCatFilter('');
                  setHideCompleted(false);
                  setCurrentPage(1);
                  setShowMobileFilters(false);
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                ล้างตัวกรอง
              </button>
              <button
                type="button"
                className="btn-apply"
                onClick={() => {
                  setFilter(pendingFilter);
                  setStatusFilter(pendingStatusFilter);
                  setUrgencyFilter(pendingUrgencyFilter);
                  setCatFilter(pendingCatFilter);
                  setHideCompleted(pendingHideCompleted);
                  setCurrentPage(1);
                  setShowMobileFilters(false);
                }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                }}
              >
                ใช้ตัวกรอง
              </button>
          </div>
        </div>
      </>


    </div>
  );
}
