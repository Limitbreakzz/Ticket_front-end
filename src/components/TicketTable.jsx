import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES, STATUS_LABEL } from '../data/mockData';
import { SLABadge } from './SLAComponents';
import PageSizeDropdown from './PageSizeDropdown';
import { smoothScrollToTop } from '../utils/scroll';

// Custom Dropdown
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
      {/* Trigger */}
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

      {/* Dropdown Panel */}
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
          {/* All option */}
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
          {/* Options */}
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
                {/* dot color indicator */}
                {opt.dot && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0, display: 'inline-block' }} />
                )}
                {/* fa icon */}
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

// Mobile Custom Choice Selector (Dropdown replacement)
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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          borderRadius: 10,
          border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border-light)'}`,
          background: open ? 'var(--primary-pale)' : 'var(--bg-card)',
          color: 'var(--text-primary)',
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <i 
              className={`fa-solid fa-${selected ? (selected.icon || icon) : icon}`} 
              style={{ 
                fontSize: 13, 
                color: selected ? (selected.iconColor || 'var(--primary)') : 'var(--text-muted)' 
              }} 
            />
          )}
          <span>{selected ? selected.label : placeholder}</span>
        </span>
        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Options Panel - Rendered inline in the flow (accordion-style) to avoid clipping inside scrolls */}
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
        {/* Placeholder/All Option */}
        <button
          type="button"
          onClick={() => { onChange(''); setOpen(false); }}
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: !value ? 'var(--primary-pale)' : 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--border-light)',
            cursor: 'pointer',
            fontSize: 13.5,
            fontWeight: !value ? 700 : 500,
            color: !value ? 'var(--primary)' : 'var(--text-primary)',
            textAlign: 'left',
            transition: 'background 0.12s',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, marginRight: 2, flexShrink: 0 }}>
            {!value && <i className="fa-solid fa-check" style={{ fontSize: 12, color: 'var(--primary)' }} />}
          </span>
          {icon && (
            <i className={`fa-solid fa-${icon}`} style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }} />
          )}
          <span>{placeholder}</span>
        </button>

        {/* Regular Options */}
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: value === opt.value ? 'var(--primary-pale)' : 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-light)',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: value === opt.value ? 700 : 500,
              color: value === opt.value ? 'var(--primary)' : 'var(--text-primary)',
              textAlign: 'left',
              transition: 'background 0.12s',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, marginRight: 2, flexShrink: 0 }}>
              {value === opt.value && <i className="fa-solid fa-check" style={{ fontSize: 12, color: 'var(--primary)' }} />}
            </span>
            {opt.icon && (
              <i className={`fa-solid fa-${opt.icon}`} style={{ fontSize: 12, color: opt.iconColor || 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span>{opt.label}</span>
          </button>
        ))}
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

export default function TicketTable({ tickets, title = 'รายการ Ticket', filterPreset = null, showPersonalToggle = false }) {
  console.log("TicketTable rendering, showPersonalToggle:", showPersonalToggle);
  const { openTicketDetail, activeNav } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterPreset || '');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [hideCompleted, setHideCompleted] = useState(true);
  const [personalFilter, setPersonalFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

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

  const getMatchSearch = (t, searchVal) => {
    if (!searchVal) return true;
    const q = searchVal.toLowerCase();
    // Split by whitespace or numeric digits (e.g. "เทสระบบ5" -> ["เทสระบบ", "5"])
    const tokens = q.split(/(\s+|\d+)/).map(token => token.trim()).filter(Boolean);
    const searchContent = `${t.id} ${t.subject} ${t.createdBy} ${t.department || ''} ${t.targetDepartment || ''}`.toLowerCase();
    return tokens.every(token => searchContent.includes(token));
  };

  const filtered = tickets.filter(t => {
    const matchSearch = getMatchSearch(t, search);
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchUrgency = !urgencyFilter || t.urgency === urgencyFilter;
    const matchCat = !catFilter || t.category === catFilter;
    const matchCompleted = !hideCompleted || !['resolved', 'closed', 'cancelled'].includes(t.status) || statusFilter === t.status;
    const matchPersonal = !personalFilter || t.receiverManager != null;
    return matchSearch && matchStatus && matchUrgency && matchCat && matchCompleted && matchPersonal;
  });

  const personalTicketsCount = tickets.filter(t => {
    const matchSearch = getMatchSearch(t, search);
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchUrgency = !urgencyFilter || t.urgency === urgencyFilter;
    const matchCat = !catFilter || t.category === catFilter;
    const matchCompleted = !hideCompleted || !['resolved', 'closed', 'cancelled'].includes(t.status) || statusFilter === t.status;
    return matchSearch && matchStatus && matchUrgency && matchCat && matchCompleted && t.receiverManager != null;
  }).length;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

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

  return (
    <div ref={dataSectionRef}>
      {/* DESKTOP ONLY LAYOUT */}
      <div className="desktop-only-layout">
        <div className="table-card" style={{ border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          {/* Redesigned Premium Toolbar */}
          <div className="table-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            
            {/* Title and Count */}
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--primary)' }}></i>
                {title}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                ({filtered.length} รายการ)
              </span>
            </div>

            {/* Search Input */}
            <div className="topbar-search" style={{
              width: '100%',
              minWidth: '100%',
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
                placeholder="ค้นหา Ticket ID, หัวข้อ, หรือผู้แจ้ง..."
                value={search}
                onChange={handleSearchChange}
                id="ticket-search"
                style={{ fontSize: 13.5, background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Filters Row — Custom Dropdowns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
              width: '100%'
            }}>
              <CustomDropdown
                id="status-filter"
                icon="bars-staggered"
                label="สถานะ"
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                placeholder="ทุกสถานะ"
                options={Object.entries(STATUS_LABEL).map(([k, v]) => {
                  const statusColorMap = {
                    pending: 'rgb(71, 85, 105)',
                    progress: 'rgb(37, 99, 235)',
                    'wait-approve': 'rgb(217, 119, 6)',
                    approved: 'rgb(16, 185, 129)',
                    rejected: 'rgb(239, 68, 68)',
                    forwarded: 'rgb(124, 58, 237)',
                    'wait-parts': 'rgb(180, 83, 9)',
                    resolved: 'rgb(16, 185, 129)',
                    cancelled: 'rgb(239, 68, 68)',
                  };
                  return {
                    value: k,
                    label: v.label,
                    icon: v.icon,
                    iconColor: statusColorMap[k] || 'var(--text-muted)'
                  };
                })}
              />
              {activeNav !== 'escalated' && (
                <CustomDropdown
                  id="urgency-filter"
                  icon="circle-exclamation"
                  label="ความเร่งด่วน"
                  value={urgencyFilter}
                  onChange={(v) => { setUrgencyFilter(v); setCurrentPage(1); }}
                  placeholder="ทุกระดับ"
                  options={[
                    { value: 'low',      label: 'ต่ำ',        dot: 'rgb(16,185,129)',  icon: 'circle-check',         iconColor: 'rgb(16,185,129)' },
                    { value: 'medium',   label: 'ปานกลาง', dot: 'rgb(245,158,11)', icon: 'circle-minus',         iconColor: 'rgb(245,158,11)' },
                    { value: 'high',     label: 'สูง',       dot: 'rgb(239,68,68)',   icon: 'circle-exclamation',   iconColor: 'rgb(239,68,68)' },
                    { value: 'critical', label: 'วิกฤต',      dot: 'rgb(124,58,237)', icon: 'triangle-exclamation', iconColor: 'rgb(124,58,237)' },
                  ]}
                />
              )}
              <CustomDropdown
                id="category-filter"
                icon="layer-group"
                label="หมวดหมู่"
                value={catFilter}
                onChange={(v) => { setCatFilter(v); setCurrentPage(1); }}
                placeholder="ทุกหมวดหมู่"
                options={Object.entries(CATEGORIES).map(([k, v]) => {
                  const catColorMap = {
                    hardware: '#e67e22',
                    software: '#3498db',
                    network: '#eab308',
                    access: '#9b59b6',
                    other: '#95a5a6',
                  };
                  return {
                    value: k,
                    label: v.label,
                    icon: v.icon || 'folder',
                    iconColor: catColorMap[k] || 'var(--text-muted)'
                  };
                })}
              />
            </div>

            {/* Controls Row: Hide Completed Checkbox & Clear Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <button
                  type="button"
                  onClick={() => { setHideCompleted(!hideCompleted); setCurrentPage(1); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    outline: 'none',
                    userSelect: 'none',
                    flexWrap: 'nowrap'
                  }}
                >
                  {/* Switch track */}
                  <span style={{
                    position: 'relative',
                    width: 44,
                    height: 24,
                    background: hideCompleted ? 'var(--primary)' : '#cbd5e1',
                    borderRadius: 24,
                    transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'inline-block',
                    flexShrink: 0
                  }}>
                    {/* Switch knob */}
                    <span style={{
                      position: 'absolute',
                      top: 3,
                      left: hideCompleted ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </span>
                  <span style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}>
                    ซ่อนเคสที่สำเร็จ / ปิดแล้ว / ยกเลิก
                  </span>
                </button>

                {showPersonalToggle && (
                  <button
                    type="button"
                    onClick={() => { setPersonalFilter(!personalFilter); setCurrentPage(1); }}
                    onMouseEnter={(e) => {
                      if (!personalFilter) {
                        e.currentTarget.style.borderColor = '#e11d48';
                        e.currentTarget.style.background = 'rgba(225, 29, 72, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!personalFilter) {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.background = 'var(--bg-card)';
                      }
                    }}
                    style={{
                      background: personalFilter 
                        ? 'rgba(225, 29, 72, 0.05)' 
                        : 'var(--bg-card)',
                      border: personalFilter 
                        ? '1.5px solid #e11d48' 
                        : '1.5px dashed var(--border-strong)',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: personalFilter ? '#e11d48' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease-in-out',
                      outline: 'none',
                      userSelect: 'none',
                      height: '38px',
                      position: 'relative',
                    }}
                  >
                    {/* Left Accent line on active */}
                    {personalFilter && (
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        bottom: '20%',
                        width: '3.5px',
                        background: '#e11d48',
                        borderRadius: '0 4px 4px 0'
                      }} />
                    )}
                    <i 
                      className={personalFilter ? "fa-solid fa-lock" : "fa-solid fa-lock-open"} 
                      style={{ 
                        fontSize: 11, 
                        color: personalFilter ? '#e11d48' : 'var(--text-muted)',
                        transition: 'all 0.2s'
                      }} 
                    />
                    <span>แสดงเฉพาะ Ticket ส่วนตัว</span>
                    <span style={{
                      background: personalFilter ? '#e11d48' : 'var(--bg-main)',
                      color: personalFilter ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '18px',
                      height: '16px',
                      border: personalFilter ? 'none' : '1px solid var(--border-light)',
                      transition: 'all 0.2s'
                    }}>
                      {personalTicketsCount}
                    </span>
                  </button>
                )}
              </div>

              {(statusFilter || urgencyFilter || catFilter || search || !hideCompleted || personalFilter) && (
                <button
                  onClick={() => { setStatusFilter(''); setUrgencyFilter(''); setCatFilter(''); setSearch(''); setHideCompleted(true); setPersonalFilter(false); setCurrentPage(1); }}
                  id="clear-filters"
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
                  }}
                >
                  <i className="fa-solid fa-xmark" /> ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="fa-solid fa-box-open" aria-hidden="true"></i></div>
              <div className="empty-state-title">ไม่พบ Ticket</div>
              <div className="empty-state-desc">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 70 }}>รหัส / วันที่</th>
                    <th style={{ minWidth: 90 }}>ผู้แจ้ง / แผนก</th>
                    <th style={{ minWidth: 140 }}>หัวข้อ / หมวดหมู่</th>
                    <th style={{ minWidth: 70 }}>ความเร่งด่วน</th>
                    <th style={{ minWidth: 70 }}>สถานะ</th>
                    <th style={{ minWidth: 70 }}>สถานะและเวลา SLA</th>
                    <th style={{ minWidth: 90 }}>ผู้รับผิดชอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(t => {
                    const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                    const statusColorMap = {
                      pending: { bg: 'rgba(71, 85, 105, 0.08)', color: 'rgb(71, 85, 105)', border: 'rgba(71, 85, 105, 0.2)' },
                      progress: { bg: 'rgba(37, 99, 235, 0.08)', color: 'rgb(37, 99, 235)', border: 'rgba(37, 99, 235, 0.2)' },
                      'wait-approve': { bg: 'rgba(245, 158, 11, 0.08)', color: 'rgb(217, 119, 6)', border: 'rgba(245, 158, 11, 0.2)' },
                      approved: { bg: 'rgba(16, 185, 129, 0.08)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.2)' },
                      rejected: { bg: 'rgba(239, 68, 68, 0.08)', color: 'rgb(239, 68, 68)', border: 'rgba(239, 68, 68, 0.2)' },
                      forwarded: { bg: 'rgba(124, 58, 237, 0.08)', color: 'rgb(124, 58, 237)', border: 'rgba(124, 58, 237, 0.2)' },
                      'wait-parts': { bg: 'rgba(245, 158, 11, 0.12)', color: 'rgb(180, 83, 9)', border: 'rgba(245, 158, 11, 0.25)' },
                      resolved: { bg: 'rgba(16, 185, 129, 0.08)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.2)' },
                      cancelled: { bg: 'rgba(239, 68, 68, 0.08)', color: 'rgb(239, 68, 68)', border: 'rgba(239, 68, 68, 0.2)' },
                    };
                    const sc = statusColorMap[t.status] || statusColorMap.pending;

                    return (
                      <tr key={t.id} id={`row-${t.id}`} onClick={() => openTicketDetail(t.id)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span className="ticket-id" style={{ width: 'fit-content' }}>#{t.id.substring(0, 8)}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.createdAt.split(',')[0]}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, whiteSpace: 'nowrap' }}>
                            <span 
                              style={{ 
                                fontWeight: 700, 
                                color: 'var(--text-primary)', 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 110,
                                display: 'inline-block'
                              }} 
                              title={t.createdBy}
                            >
                              {t.createdBy}
                            </span>
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
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 160 }}>
                             <div className="ticket-subject" style={{
                              maxWidth: '100%',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }} title={t.subject}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</span>
                              {t.receiverManager && (
                                <span style={{
                                  background: '#e11d48',
                                  color: '#ffffff',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  flexShrink: 0,
                                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                                }} title={`ตั๋วส่วนตัวส่งถึงผู้จัดการ: ${t.receiverManager.name}`}>
                                  <i className="fa-solid fa-lock" style={{ fontSize: 9 }}></i> ส่วนตัว
                                </span>
                              )}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }} title={getCategoryPath(t)}>
                              <i className="fa-solid fa-tags" style={{ fontSize: 9, color: 'var(--primary-lighter)' }} aria-hidden="true"></i>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getCategoryPath(t)}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 10.5,
                              color: 'var(--text-muted)',
                              marginTop: 2,
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 160
                            }} title={t.receiverManager ? `ส่งถึงผู้จัดการ: ${t.receiverManager.name} (ส่วนตัว)` : `ส่งถึงแผนก: ${t.targetDepartment || '-'}`}>
                              <i className="fa-solid fa-paper-plane" style={{ fontSize: 8.5, color: 'var(--primary)', opacity: 0.7 }} aria-hidden="true"></i>
                              {t.receiverManager ? (
                                <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  ถึง: {t.receiverManager.name.split(' ')[0]} 
                                  <i className="fa-solid fa-lock" style={{ fontSize: 9.5, color: '#e11d48' }} aria-hidden="true" />
                                </span>
                              ) : (
                                <span>ถึงแผนก: <strong style={{ color: 'var(--primary)' }}>{t.targetDepartment || '-'}</strong></span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {getUrgencyBadge(t.urgency)}
                        </td>
                        <td>
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
                        <td>
                          <SLABadge ticket={t} />
                        </td>
                        <td>
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
          )}

          {/* Desktop Pagination */}
          {filtered.length > 0 && (
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
      </div>

        
      <div className="mobile-only-layout">
        {/* Combined Mobile Header & Search Card */}
        <div className="mobile-header-search-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          margin: '12px 12px 8px 12px',
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
          {/* Header Row */}
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
              <i className="fa-solid fa-folder-open" style={{ color: 'var(--primary)', fontSize: 15 }} aria-hidden="true" />
              <span>{title}</span>
            </h1>
          </div>

          {/* Divider */}
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

          {/* Search and Filter Row */}
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
              flex: 1,
              position: 'relative',
              background: 'var(--bg-main)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              height: 40
            }}>
              <i className="fa-solid fa-magnifying-glass search-icon" style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 8 }} />
              <input 
                placeholder="ค้นหา Ticket..." 
                value={search} 
                onChange={handleSearchChange} 
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 13,
                  width: '100%',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <button 
              type="button"
              className="mobile-filter-trigger" 
              onClick={() => setShowMobileFilterModal(true)}
              style={{
                background: (statusFilter || urgencyFilter || catFilter) ? 'var(--primary-pale)' : 'var(--bg-card)',
                color: (statusFilter || urgencyFilter || catFilter) ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1.5px solid ${(statusFilter || urgencyFilter || catFilter) ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0 14px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                position: 'relative',
                height: 40
              }}
            >
              <i className="fa-solid fa-filter" />
              <span>ตัวกรอง</span>
              {(statusFilter || urgencyFilter || catFilter || personalFilter) && (
                <span className="filter-badge-dot" style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--danger)'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Active Chips */}
        {(statusFilter || urgencyFilter || catFilter || !hideCompleted || personalFilter) && (
          <div className="mobile-active-chips" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '8px 12px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-light)'
          }}>
            {statusFilter && (
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
                สถานะ: {STATUS_LABEL[statusFilter]?.label || statusFilter}
                <button type="button" onClick={() => { setStatusFilter(''); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
              </span>
            )}
            {urgencyFilter && (
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
                ด่วน: {urgencyFilter === 'low' ? 'ต่ำ' : urgencyFilter === 'medium' ? 'ปานกลาง' : urgencyFilter === 'high' ? 'สูง' : 'วิกฤต'}
                <button type="button" onClick={() => { setUrgencyFilter(''); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
              </span>
            )}
            {catFilter && (
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
                หมวดหมู่: {CATEGORIES[catFilter]?.label || catFilter}
                <button type="button" onClick={() => { setCatFilter(''); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
              </span>
            )}
            {!hideCompleted && (
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
                แสดงเคสที่เสร็จสิ้น
                <button type="button" onClick={() => { setHideCompleted(true); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
              </span>
            )}
            {personalFilter && (
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
                <i className="fa-solid fa-lock" style={{ fontSize: 9, color: '#e11d48' }} /> แสดงเฉพาะ Ticket ส่วนตัว
                <button type="button" onClick={() => { setPersonalFilter(false); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
              </span>
            )}
          </div>
        )}

        {/* Mobile Result Bar */}
        <div className="mobile-result-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          background: 'var(--bg-main)',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontWeight: 600
        }}>
          <span>พบ {filtered.length} รายการ</span>
          {(statusFilter || urgencyFilter || catFilter || search || !hideCompleted || personalFilter) && (
            <button 
              type="button"
              onClick={() => { setStatusFilter(''); setUrgencyFilter(''); setCatFilter(''); setSearch(''); setHideCompleted(true); setPersonalFilter(false); setCurrentPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Mobile Ticket List / Cards */}
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 12 }}><i className="fa-solid fa-box-open" /></div>
            <div className="empty-state-title" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>ไม่พบ Ticket</div>
            <div className="empty-state-desc" style={{ fontSize: 13, color: 'var(--text-muted)' }}>ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</div>
          </div>
        ) : (
          <div className="mobile-ticket-cards-list" style={{
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {paginatedData.map(t => {
              const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
              const statusColorMap = {
                pending: { bg: 'rgba(71, 85, 105, 0.08)', color: 'rgb(71, 85, 105)', border: 'rgba(71, 85, 105, 0.2)' },
                progress: { bg: 'rgba(37, 99, 235, 0.08)', color: 'rgb(37, 99, 235)', border: 'rgba(37, 99, 235, 0.2)' },
                'wait-approve': { bg: 'rgba(245, 158, 11, 0.08)', color: 'rgb(217, 119, 6)', border: 'rgba(245, 158, 11, 0.2)' },
                approved: { bg: 'rgba(16, 185, 129, 0.08)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.2)' },
                rejected: { bg: 'rgba(239, 68, 68, 0.08)', color: 'rgb(239, 68, 68)', border: 'rgba(239, 68, 68, 0.2)' },
                forwarded: { bg: 'rgba(124, 58, 237, 0.08)', color: 'rgb(124, 58, 237)', border: 'rgba(124, 58, 237, 0.2)' },
                'wait-parts': { bg: 'rgba(245, 158, 11, 0.12)', color: 'rgb(180, 83, 9)', border: 'rgba(245, 158, 11, 0.25)' },
                resolved: { bg: 'rgba(16, 185, 129, 0.08)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.2)' },
                cancelled: { bg: 'rgba(239, 68, 68, 0.08)', color: 'rgb(239, 68, 68)', border: 'rgba(239, 68, 68, 0.2)' },
              };
              const sc = statusColorMap[t.status] || statusColorMap.pending;

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
                        <i className={`fa-solid fa-${CATEGORIES[t.category]?.icon || 'ticket'}`} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>
                        #{t.id.substring(0, 8)}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {t.createdAt}
                    </span>
                  </div>

                  {/* Section 2: Subject & Category */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                        flex: 1
                      }}>
                        {t.subject}
                      </h3>
                      {t.receiverManager && (
                        <span style={{
                          background: '#e11d48',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                        }}>
                          <i className="fa-solid fa-lock" style={{ fontSize: 9 }} />
                          ส่วนตัว
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="fa-solid fa-tags" style={{ fontSize: 9 }} />
                      {getCategoryPath(t)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="fa-solid fa-paper-plane" style={{ fontSize: 8, color: 'var(--primary)', opacity: 0.7 }} />
                      {t.receiverManager ? (
                        <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          ถึง: {t.receiverManager.name.split(' ')[0]}
                          <i className="fa-solid fa-lock" style={{ fontSize: 9, color: '#e11d48' }} />
                        </span>
                      ) : (
                        <span>ถึงแผนก: <strong style={{ color: 'var(--primary)' }}>{t.targetDepartment || '-'}</strong></span>
                      )}
                    </span>
                  </div>

                  {/* Section 3: Badges */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />
                      {statusInfo.label}
                    </span>
                    {getUrgencyBadge(t.urgency)}
                  </div>

                  {/* Section 4: Details Box */}
                  <div className="mobile-card-details-box" style={{
                    background: 'var(--bg-main)',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ผู้แจ้ง:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.createdBy} ({t.department})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ผู้รับผิดชอบ:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.assignedTo || 'รอมอบหมาย'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>สถานะ SLA:</span>
                      <SLABadge ticket={t} />
                    </div>
                  </div>

                  {/* Section 5: Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      className="mobile-card-view-btn"
                      style={{
                        flex: 1,
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                      onClick={() => openTicketDetail(t.id)}
                    >
                      <span>ดูรายละเอียด</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile Pagination */}
        {filtered.length > 0 && (
          <div className="mobile-pagination-container" style={{
            padding: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            margin: '12px 12px 36px 12px',
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

        {/* Slide-Up Bottom Sheet Modal */}
        {createPortal(
          <>
            <div 
              className="bottom-sheet-backdrop" 
              onClick={() => setShowMobileFilterModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                zIndex: 10000,
                opacity: showMobileFilterModal ? 1 : 0,
                pointerEvents: showMobileFilterModal ? 'auto' : 'none',
                transition: 'opacity 0.25s ease'
              }}
            />
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
                zIndex: 10001,
                padding: '20px 16px 32px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.2)',
                transform: showMobileFilterModal ? 'translateY(0)' : 'translateY(100%)',
                opacity: showMobileFilterModal ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
                pointerEvents: showMobileFilterModal ? 'auto' : 'none'
              }}
            >
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
                  onClick={() => setShowMobileFilterModal(false)}
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
              <div className="bottom-sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Status Filter */}
                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>สถานะ</label>
                  <MobileCustomSelect
                    value={statusFilter}
                    onChange={v => { setStatusFilter(v); setCurrentPage(1); }}
                    placeholder="ทุกสถานะ"
                    icon="circle-dot"
                    options={Object.entries(STATUS_LABEL).map(([k, v]) => {
                      const statusColors = {
                        pending: 'rgb(71, 85, 105)',
                        progress: 'rgb(37, 99, 235)',
                        'wait-approve': 'rgb(245, 158, 11)',
                        approved: 'rgb(16, 185, 129)',
                        rejected: 'rgb(239, 68, 68)',
                        forwarded: 'rgb(124, 58, 237)',
                        'wait-parts': 'rgb(180, 83, 9)',
                        resolved: 'rgb(16, 185, 129)',
                        cancelled: 'rgb(239, 68, 68)'
                      };
                      return {
                        value: k,
                        label: v.label,
                        dot: statusColors[k] || 'var(--text-muted)',
                        icon: v.icon,
                        iconColor: statusColors[k] || 'var(--text-muted)'
                      };
                    })}
                  />
                </div>
                
                {/* Urgency Filter */}
                {activeNav !== 'escalated' && (
                  <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>ระดับความเร่งด่วน</label>
                    <MobileCustomSelect
                      value={urgencyFilter}
                      onChange={v => { setUrgencyFilter(v); setCurrentPage(1); }}
                      placeholder="ทุกระดับ"
                      icon="circle-exclamation"
                      options={[
                        { value: 'low', label: 'ต่ำ', dot: 'rgb(16,185,129)', icon: 'circle-check', iconColor: 'rgb(16,185,129)' },
                        { value: 'medium', label: 'ปานกลาง', dot: 'rgb(245,158,11)', icon: 'circle-minus', iconColor: 'rgb(245,158,11)' },
                        { value: 'high', label: 'สูง', dot: 'rgb(239,68,68)', icon: 'circle-exclamation', iconColor: 'rgb(239,68,68)' },
                        { value: 'critical', label: 'วิกฤต', dot: 'rgb(124,58,237)', icon: 'triangle-exclamation', iconColor: 'rgb(124,58,237)' }
                      ]}
                    />
                  </div>
                )}

                {/* Category Filter */}
                <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>หมวดหมู่หลัก</label>
                  <MobileCustomSelect
                    value={catFilter}
                    onChange={v => { setCatFilter(v); setCurrentPage(1); }}
                    placeholder="ทุกหมวดหมู่"
                    icon="layer-group"
                    options={Object.entries(CATEGORIES).map(([k, v]) => {
                      const catColors = {
                        hardware: '#e67e22',
                        software: '#3498db',
                        network: '#eab308',
                        access: '#9b59b6',
                        other: '#95a5a6',
                      };
                      return {
                        value: k,
                        label: v.label,
                        dot: catColors[k] || 'var(--text-muted)',
                        icon: v.icon || 'folder',
                        iconColor: catColors[k] || 'var(--text-muted)'
                      };
                    })}
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
                      checked={hideCompleted}
                      onChange={e => { setHideCompleted(e.target.checked); setCurrentPage(1); }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: hideCompleted ? 'var(--primary)' : '#cbd5e1',
                      transition: 'background 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: 24,
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: 18, width: 18,
                        left: hideCompleted ? 23 : 3,
                        top: 3,
                        background: 'white',
                        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                      }} />
                    </span>
                  </label>
                </div>
                {/* Personal Ticket Filter Button (Mobile - matches Desktop styling) */}
                {showPersonalToggle && (
                  <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>ประเภทตั๋วพิเศษ</label>
                    <button
                      type="button"
                      onClick={() => { setPersonalFilter(!personalFilter); setCurrentPage(1); }}
                      style={{
                        background: personalFilter 
                          ? 'rgba(225, 29, 72, 0.05)' 
                          : 'var(--bg-card)',
                        border: personalFilter 
                          ? '1.5px solid #e11d48' 
                          : '1.5px dashed var(--border-strong)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        color: personalFilter ? '#e11d48' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease-in-out',
                        outline: 'none',
                        userSelect: 'none',
                        height: '44px',
                        position: 'relative',
                        width: '100%',
                        textAlign: 'left',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {/* Left Accent line on active */}
                      {personalFilter && (
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          bottom: '20%',
                          width: '3.5px',
                          background: '#e11d48',
                          borderRadius: '0 4px 4px 0'
                        }} />
                      )}
                      <i 
                        className={personalFilter ? "fa-solid fa-lock" : "fa-solid fa-lock-open"} 
                        style={{ 
                          fontSize: 12, 
                          color: personalFilter ? '#e11d48' : 'var(--text-muted)',
                          transition: 'all 0.2s'
                        }} 
                      />
                      <span style={{ flex: 1 }}>แสดงเฉพาะ Ticket ส่วนตัว</span>
                      <span style={{
                        background: personalFilter ? '#e11d48' : 'var(--bg-main)',
                        color: personalFilter ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '20px',
                        height: '18px',
                        border: personalFilter ? 'none' : '1px solid var(--border-light)',
                        transition: 'all 0.2s'
                      }}>
                        {personalTicketsCount}
                      </span>
                    </button>
                  </div>
                )}
              </div>
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
                  onClick={() => { setStatusFilter(''); setUrgencyFilter(''); setCatFilter(''); setHideCompleted(true); setPersonalFilter(false); setCurrentPage(1); setShowMobileFilterModal(false); }}
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
                  onClick={() => setShowMobileFilterModal(false)}
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
          </>,
          document.body
        )}
      </div>
    </div>
  );
}

