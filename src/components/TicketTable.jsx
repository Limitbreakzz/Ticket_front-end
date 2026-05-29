import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, CATEGORIES, STATUS_LABEL } from '../data/mockData';
import TicketDetailModal from './TicketDetailModal';
import { SLABadge, SLABar } from './SLAComponents';
import { calcSLA } from '../utils/sla';

/* ─── Custom Dropdown ────────────────────────────────── */
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
/* ──────────────────────────────────────────────────── */

const URGENCY_INFO = {
  low: { label: 'ต่ำ', cls: 'badge-low', dot: 'low' },
  medium: { label: 'ปานกลาง', cls: 'badge-medium', dot: 'medium' },
  high: { label: 'สูง', cls: 'badge-high', dot: 'high' },
  critical: { label: 'วิกฤต', cls: 'badge-critical', dot: 'critical' },
};

export default function TicketTable({ tickets, title = 'รายการ Ticket', filterPreset = null }) {
  const { role } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterPreset || '');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
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

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.createdBy.toLowerCase().includes(q);
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchUrgency = !urgencyFilter || t.urgency === urgencyFilter;
    const matchCat = !catFilter || t.category === catFilter;
    return matchSearch && matchStatus && matchUrgency && matchCat;
  });

  // Reset page when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

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
      mechanical: 'เครื่องจักร',
      electrical: 'ระบบไฟฟ้า',
      facility: 'ระบบอาคาร',
      it_support: 'ไอที/เครือข่าย'
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

  const formatSlaTime = (date) => {
    if (!date) return '';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${d} ${m}. ${hh}:${mm}`;
  };

  const getAgentInitials = (name) => {
    if (!name || name === 'รอมอบหมาย') return null;
    return name.trim().charAt(0).toUpperCase();
  };

  return (
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
                pending: 'rgb(59, 130, 246)',
                progress: 'rgb(245, 158, 11)',
                'wait-approve': 'rgb(124, 58, 237)',
                approved: 'rgb(16, 185, 129)',
                rejected: 'rgb(239, 68, 68)',
                forwarded: 'rgb(14, 165, 233)',
                'wait-parts': 'rgb(100, 116, 139)',
                resolved: 'rgb(16, 185, 129)',
                closed: 'rgb(71, 85, 105)',
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
          <CustomDropdown
            id="category-filter"
            icon="layer-group"
            label="หมวดหมู่"
            value={catFilter}
            onChange={(v) => { setCatFilter(v); setCurrentPage(1); }}
            placeholder="ทุกหมวดหมู่"
            options={Object.entries(CATEGORIES).map(([k, v]) => {
              const catColorMap = {
                mechanical: '#e67e22',
                electrical: '#eab308',
                facility: '#06b6d4',
                it_support: '#3498db',
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

        {/* Clear Filters */}
        {(statusFilter || urgencyFilter || catFilter || search) && (
          <button
            onClick={() => { setStatusFilter(''); setUrgencyFilter(''); setCatFilter(''); setSearch(''); }}
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
              alignSelf: 'flex-start',
              transition: 'var(--transition)',
            }}
          >
            <i className="fa-solid fa-xmark" /> ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="fa-solid fa-box-open" aria-hidden="true"></i></div>
          <div className="empty-state-title">ไม่พบ Ticket</div>
          <div className="empty-state-desc">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ padding: '14px 20px' }}>รหัส / วันที่</th>
                <th>ผู้แจ้ง / แผนก</th>
                <th>หัวข้อ / หมวดหมู่</th>
                <th>สถานะ</th>
                <th>SLA</th>
                <th>ผู้รับผิดชอบ</th>
                <th>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(t => {
                const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
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
                const sc = statusColorMap[t.status] || statusColorMap.pending;
                const urgencyAccent = {
                  low:      '#10b981',
                  medium:   '#f59e0b',
                  high:     '#ef4444',
                  critical: '#7c3aed',
                };
                const sla = calcSLA(t);
                const rowAccent = urgencyAccent[t.urgency] || '#94a3b8';

                return (
                  <tr key={t.id} id={`row-${t.id}`} style={{ borderLeft: `3px solid ${rowAccent}` }}>
                    {/* รหัส / วันที่ */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="ticket-id" style={{ width: 'fit-content' }}>#{t.id.substring(0, 8)}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.createdAt.split(',')[0]}</span>
                      </div>
                    </td>

                    {/* ผู้แจ้ง จากแผนก */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.createdBy}</span>
                        <span style={{
                          background: 'var(--primary-bg)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-light)',
                          padding: '1px 6px',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4
                        }}>{t.department}</span>
                      </div>
                    </td>

                    {/* หัวข้อ */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div className="ticket-subject" style={{ maxWidth: 320, whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {t.subject}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                          <i className="fa-solid fa-tags" style={{ fontSize: 9, color: 'var(--primary-lighter)' }} aria-hidden="true"></i>
                          <span>{getCategoryPath(t)}</span>
                        </div>
                      </div>
                    </td>

                    {/* สถานะ */}
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
                        <i className={`fa-solid fa-${statusInfo.icon || 'circle'}`} style={{ fontSize: 9 }} aria-hidden="true"></i>
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* SLA */}
                    <td>
                      {sla ? (
                        <SLABadge ticket={t} />
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* ผู้รับผิดชอบ */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 'var(--bg-main)' : 'var(--success)',
                          color: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 'var(--text-muted)' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 11 : 10,
                          fontWeight: 800,
                          border: '1px solid var(--border-light)',
                          flexShrink: 0
                        }}>
                          {(!t.assignedTo || t.assignedTo === 'รอมอบหมาย')
                            ? <i className="fa-solid fa-hourglass-half" aria-hidden="true"></i>
                            : getAgentInitials(t.assignedTo)
                          }
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: (!t.assignedTo || t.assignedTo === 'รอมอบหมาย') ? 'italic' : 'normal' }}>
                          {t.assignedTo || 'รอมอบหมาย'}
                        </span>
                      </div>
                    </td>

                    {/* ดำเนินการ */}
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: 'none'
                        }}
                        onClick={() => setSelectedTicket(t)}
                        id={`view-${t.id}`}
                      >
                        <span>ดูรายละเอียด</span>
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }}></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>แสดงผล:</span>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>รายการ</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
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
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button 
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

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
