import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, STATUS_LABEL } from '../data/mockData';
import PageSizeDropdown from '../components/PageSizeDropdown';
import { smoothScrollToTop } from '../utils/scroll';

function CustomDropdown({ icon, label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const isActive = !!value && value !== 'all';

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none', width: '100%' }}>
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
          border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
          background: isActive ? 'var(--primary-pale)' : 'var(--bg-card)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.18s ease',
          minWidth: 0,
        }}
      >
        <i className={`fa-solid fa-${selected && selected.icon ? selected.icon : icon}`} style={{ fontSize: 12, color: isActive ? (selected && selected.iconColor ? selected.iconColor : 'var(--primary)') : 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{label}:</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-primary)',
          flex: 1,
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {selected ? selected.label : placeholder}
        </span>
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          minWidth: '100%',
        }}>
          {options.map(o => {
            const isSel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isSel ? 'var(--primary-pale)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isSel ? 700 : 500,
                  color: isSel ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--bg-main)'; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >
                {isSel ? (
                  <i className="fa-solid fa-check" style={{ color: 'var(--primary)', width: 14, textAlign: 'center', marginRight: 4 }} />
                ) : (
                  o.icon && (
                    <i className={`fa-solid fa-${o.icon}`} style={{ color: o.iconColor || 'var(--text-muted)', width: 14, textAlign: 'center', marginRight: 4 }} />
                  )
                )}
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// MobileCustomSelect — identical to TicketTable.jsx & SLAView.jsx
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

export default function ApprovalView({ isEmbedded = false }) {
  const { tickets, currentUser, approveTicket, reloadTickets, addToast, openTicketDetail } = useApp();

  // Tickets needing approval: those in 'wait-approve' status, assigned to staff, and no managerApproval yet
  const pendingApproval = tickets.filter(t => {
    const isOwner = currentUser && (
      t.createdBy === currentUser.name || 
      t.userId === currentUser.id || 
      t.reporterId === currentUser.id
    );
    const isAssigned = t.assignedTo && t.assignedTo !== 'รอมอบหมาย';
    return isAssigned && t.status === 'wait-approve' && !t.managerApproval && !isOwner;
  });

  const approved = tickets.filter(t => t.managerApproval === 'approved');
  const rejected = tickets.filter(t => t.managerApproval === 'rejected');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState('1');

  const [actionTicket, setActionTicket] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Mobile Bottom Sheet modal filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pendingFilterCategory, setPendingFilterCategory] = useState('all');
  const [pendingHideCompleted, setPendingHideCompleted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleActionSubmit = async () => {
    if (!actionTicket) return;
    const isApproved = actionTicket.type === 'approve';
    if (!isApproved && (!note || !note.trim())) {
      addToast('กรุณาระบุเหตุผลในการปฏิเสธการขออนุมัติ', 'error');
      return;
    }
    setLoading(true);
    try {
      await approveTicket(actionTicket.ticket.id, isApproved, note);
      addToast(isApproved ? 'อนุมัติ Ticket เรียบร้อยแล้ว' : 'ปฏิเสธ Ticket เรียบร้อยแล้ว', 'success');
      setNote('');
      setActionTicket(null);
      if (reloadTickets) {
        await reloadTickets();
      }
    } catch (err) {
      console.error(err);
      addToast(`ดำเนินการล้มเหลว: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPending = pendingApproval.filter(t => {
    const matchesSearch = searchQuery === '' || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const historyData = [...approved, ...rejected];
  const filteredHistory = historyData.filter(t => {
    const matchesSearch = searchQuery === '' || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    
    // Hide cases that are completed/closed/cancelled when hideCompleted is true
    const isCompleted = ['resolved', 'closed', 'cancelled'].includes(t.status?.toLowerCase());
    const matchesHideCompleted = !hideCompleted || !isCompleted;
    
    return matchesSearch && matchesCategory && matchesHideCompleted;
  });

  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + pageSize);

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

  return (
    <div className={isEmbedded ? "" : "view-container"}>
      {!isEmbedded && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            การอนุมัติ Ticket
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Ticket ที่ต้องการการอนุมัติก่อนดำเนินการ
          </p>
        </div>
      )}

      {/* Summary Badges */}
      <div className="dashboard-summary-grid" style={{ marginBottom: 24 }}>

        {/* Card 1: ทั้งหมด */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.03) 100%)',
          padding: '20px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid #474d55ff', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>คำขอทั้งหมด</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#E0E7FF', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-list-check"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{pendingApproval.length + approved.length + rejected.length}</div>
        </div>

        {/* Card 2: รออนุมัติ */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.03) 100%)',
          padding: '20px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid #F59E0B', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>รออนุมัติ</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{pendingApproval.length}</div>
        </div>

        {/* Card 3: อนุมัติแล้ว */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.03) 100%)',
          padding: '20px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
          border: '1px solid #10b981', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>อนุมัติแล้ว</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-check-double"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{approved.length}</div>
        </div>

        {/* Card 4: ปฏิเสธ */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(239,68,68,0.03) 100%)',
          padding: '20px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)',
          border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: '120px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>ปฏิเสธ</span>
            <div className="kpi-icon-box" style={{ width: 38, height: 38, borderRadius: 10, background: '#FEE2E2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{rejected.length}</div>
        </div>

      </div>
      {/* Search & Filter Bar */}
      {!isMobile ? (
        <div className="table-toolbar" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-file-shield" style={{ color: 'var(--primary)' }} aria-hidden="true" />
              รายการรออนุมัติ
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
              ({pendingApproval.length} รายการ)
            </span>
          </div>

          {/* Desktop Search & Category Filter Dropdown */}
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
              <span className="topbar-search-icon" style={{ fontSize: 15, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              </span>
              <input
                type="text"
                placeholder="ค้นหา Ticket ID, หัวข้อ, หรือผู้แจ้ง..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  fontSize: '13.5px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CustomDropdown
                icon="layer-group"
                label="หมวดหมู่"
                value={filterCategory}
                onChange={(val) => { setFilterCategory(val || 'all'); setCurrentPage(1); }}
                placeholder="ทุกหมวดหมู่"
                options={[
                  { value: 'all', label: 'ทุกหมวดหมู่', icon: 'layer-group', iconColor: 'var(--text-muted)' },
                  { value: 'hardware', label: 'ฮาร์ดแวร์ / อุปกรณ์', icon: 'laptop', iconColor: '#e67e22' },
                  { value: 'software', label: 'ซอฟต์แวร์ / โปรแกรม', icon: 'code', iconColor: '#3498db' },
                  { value: 'network', label: 'อินเทอร์เน็ต / Wi-Fi', icon: 'wifi', iconColor: '#eab308' },
                  { value: 'access', label: 'สิทธิ์เข้าใช้งาน', icon: 'key', iconColor: '#9b59b6' },
                  { value: 'other', label: 'ทั่วไป / บริการอื่นๆ', icon: 'circle-info', iconColor: '#95a5a6' }
                ]}
              />
            </div>
          </div>

          {/* Controls Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexDirection: 'row',
            gap: 12, 
            width: '100%', 
            marginTop: 4,
            minHeight: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'left' }}>
                  ซ่อนเคสที่สำเร็จ / ปิดแล้ว / ยกเลิก
                </span>
              </button>
            </div>

            {(filterCategory !== 'all' || searchQuery || hideCompleted) ? (
              <button
                onClick={() => { setFilterCategory('all'); setSearchQuery(''); setHideCompleted(false); setCurrentPage(1); }}
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
                  whiteSpace: 'nowrap',
                  width: 'auto',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-xmark" /> ล้างตัวกรองทั้งหมด
              </button>
            ) : (
              <div style={{ height: 32 }} />
            )}
          </div>
        </div>
      ) : (
        /* Mobile search card header — matching SLA and ticket list */
        <div className="mobile-header-search-card" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          margin: '12px 0 16px 0',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="mobile-header-title" style={{
              fontSize: 16,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <i className="fa-solid fa-file-shield" style={{ color: 'var(--primary)', fontSize: 15 }} aria-hidden="true" />
              รายการรออนุมัติ
            </h1>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              ({pendingApproval.length} รายการ)
            </span>
          </div>
          
          <div style={{
            height: '1px',
            background: 'var(--border-light)',
            maxHeight: '1px',
            opacity: 1,
            overflow: 'hidden',
            marginTop: 4,
            marginBottom: 4
          }} />
          
          <div style={{
            display: 'flex',
            gap: 8,
            maxHeight: '50px',
            opacity: 1,
            overflow: 'hidden',
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
                setPendingFilterCategory(filterCategory);
                setPendingHideCompleted(hideCompleted);
                setShowMobileFilters(true);
              }}
              style={{
                background: (filterCategory !== 'all' || hideCompleted) ? 'var(--primary-pale)' : 'var(--bg-card)',
                color: (filterCategory !== 'all' || hideCompleted) ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1.5px solid ${(filterCategory !== 'all' || hideCompleted) ? 'var(--primary)' : 'var(--border-light)'}`,
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
              {(filterCategory !== 'all' || hideCompleted) && (
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

          {/* Active Chips under search bar */}
          {(filterCategory !== 'all' || hideCompleted) && (
            <div className="mobile-active-chips" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              paddingTop: 4
            }}>
              {filterCategory !== 'all' && (
                <span className="mobile-chip" style={{
                  background: 'var(--bg-main)',
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
                  หมวดหมู่: {CATEGORIES[filterCategory]?.label || filterCategory}
                  <button type="button" onClick={() => { setFilterCategory('all'); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
                </span>
              )}
              {hideCompleted && (
                <span className="mobile-chip" style={{
                  background: 'var(--bg-main)',
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
                  ซ่อนเคสเสร็จสิ้น
                  <button type="button" onClick={() => { setHideCompleted(false); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: 0 }}><i className="fa-solid fa-xmark" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending list */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <span className="section-title"><i className="fa-solid fa-hourglass-half" style={{ marginRight: 8 }}></i> รออนุมัติ ({filteredPending.length} รายการ)</span>
      </div>

      {filteredPending.length === 0 ? (
        <div className={isMobile ? "" : "table-card"}>
          <div className="empty-state" style={isMobile ? { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px 16px' } : {}}>
            <div className="empty-state-icon">
              <i className={pendingApproval.length === 0 ? "fa-solid fa-circle-check" : "fa-solid fa-magnifying-glass"} aria-hidden="true"></i>
            </div>
            <div className="empty-state-title">
              {pendingApproval.length === 0 ? "ไม่มี Ticket รออนุมัติ" : "ไม่พบผลลัพธ์"}
            </div>
            <div className="empty-state-desc">
              {pendingApproval.length === 0 ? "ทุกรายการได้รับการพิจารณาแล้ว" : "ไม่พบรายการรออนุมัติที่ตรงกับเงื่อนไขการค้นหา"}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {filteredPending.map(t => {
            const catInfo = CATEGORIES[t.category];
            const urgLabels = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', critical: 'วิกฤต' };
            return (
              <div 
                key={t.id} 
                onClick={() => openTicketDetail(t.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--shadow-sm)',
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.borderColor = 'var(--primary-light)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div style={{
                  fontSize: 22,
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className={`fa-solid fa-${catInfo?.icon || 'folder'}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="ticket-id">#{t.id.substring(0, 8)}</span>
                    <span className={`badge badge-${t.urgency === 'critical' ? 'critical' : t.urgency === 'high' ? 'high' : t.urgency === 'medium' ? 'medium' : 'low'}`}>
                      {urgLabels[t.urgency]}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {t.subject}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {t.createdBy} · {t.department} · {t.createdAt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-success btn-sm" id={`approve-${t.id}`} onClick={() => setActionTicket({ ticket: t, type: 'approve' })}>
                    <i className="fa-solid fa-check" style={{ marginRight: 4 }} aria-hidden="true"></i> อนุมัติ
                  </button>
                  <button className="btn btn-danger btn-sm" id={`reject-${t.id}`} onClick={() => setActionTicket({ ticket: t, type: 'reject' })}>
                    <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} aria-hidden="true"></i> ปฏิเสธ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      <div className="section-header" style={{ marginTop: 24, marginBottom: 12 }}>
        <span className="section-title"><i className="fa-solid fa-folder-open" style={{ marginRight: 8 }}></i> ประวัติการอนุมัติ ({filteredHistory.length} รายการ)</span>
      </div>
      <div className={isMobile ? "" : "table-card"}>
        {filteredHistory.length === 0 ? (
          <div className="empty-state" style={isMobile ? { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px 16px' } : {}}>
            <div className="empty-state-icon">
              <i className={[...approved, ...rejected].length === 0 ? "fa-solid fa-folder-open" : "fa-solid fa-magnifying-glass"} aria-hidden="true"></i>
            </div>
            <div className="empty-state-title">
              {[...approved, ...rejected].length === 0 ? "ยังไม่มีประวัติ" : "ไม่พบผลลัพธ์"}
            </div>
            <div className="empty-state-desc">
              {[...approved, ...rejected].length === 0 ? "" : "ไม่พบประวัติการอนุมัติที่ตรงกับเงื่อนไขการค้นหา"}
            </div>
          </div>
        ) : isMobile ? (
          <div className="mobile-only-cards" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 0 12px 0' }}>
            {paginatedHistory.map(t => {
              const catInfo = CATEGORIES[t.category];
              const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
              return (
                <div 
                  key={t.id} 
                  onClick={() => openTicketDetail(t.id)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    cursor: 'pointer'
                  }}
                >
                  {/* Header: ID & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="ticket-id" style={{ fontSize: '12px', fontWeight: 700 }}>#{t.id.substring(0, 8)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.updatedAt || t.createdAt}</span>
                  </div>

                  {/* Subject */}
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {t.subject}
                  </div>

                  {/* Category & Status Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span className={`badge badge-${t.category}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '11px' }}>
                      <i className={`fa-solid fa-${catInfo?.icon || 'folder'}`}></i>
                      {catInfo?.label}
                    </span>
                    <span className={`badge ${t.managerApproval === 'approved' ? 'badge-resolved' : 'badge-rejected'}`} style={{ fontSize: '11px' }}>
                      {t.managerApproval === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                    </span>
                    <span className={`status-tag ${statusInfo.cls}`} style={{ fontSize: '11px' }}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Reporter info */}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ผู้แจ้ง: <strong>{t.createdBy}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ticket</th>
                  <th>หมวด</th>
                  <th>สถานะการอนุมัติ</th>
                  <th>สถานะ Ticket</th>
                  <th>ผู้แจ้ง</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map(t => {
                  const catInfo = CATEGORIES[t.category];
                  const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => openTicketDetail(t.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><span className="ticket-id">#{t.id.substring(0, 8)}</span></td>
                      <td>
                        <div className="ticket-subject">{t.subject}</div>
                        <div className="ticket-meta">{t.updatedAt}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${t.category}`} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={catInfo?.label}>
                          <i className={`fa-solid fa-${catInfo?.icon || 'folder'}`} style={{ fontSize: 11, flexShrink: 0 }}></i>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catInfo?.label}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${t.managerApproval === 'approved' ? 'badge-resolved' : 'badge-rejected'}`}>
                          {t.managerApproval === 'approved' ? <><i className="fa-solid fa-check" style={{ marginRight: 4 }} aria-hidden="true"></i> อนุมัติ</> : <><i className="fa-solid fa-xmark" style={{ marginRight: 4 }} aria-hidden="true"></i> ปฏิเสธ</>}
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag ${statusInfo.cls}`}>{statusInfo.label}</span>
                      </td>
                      <td>{t.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {historyData.length > 0 && (
          isMobile ? (
            <div className="mobile-pagination-card" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              margin: '12px 0 24px 0',
              padding: '16px',
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
          ) : (
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
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" style={{ marginRight: 6 }}></i>
                    ก่อนหน้า
                  </button>
                  {(() => {
                    const pages = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else if (currentPage <= 4) {
                      pages.push(1, 2, 3, 4, 5, '...', totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                    }
                    return pages.map((page, index) => {
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
                    });
                  })()}
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
          )
        )}
      </div>



      {actionTicket && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            animation: 'scaleUpLightbox 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`fa-solid ${actionTicket.type === 'approve' ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ color: actionTicket.type === 'approve' ? 'var(--success)' : 'var(--danger)' }}></i>
                  {actionTicket.type === 'approve' ? 'อนุมัติ Ticket' : 'ปฏิเสธ Ticket'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  คุณต้องการ{actionTicket.type === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'} Ticket <strong style={{ color: 'var(--primary)' }}>#{actionTicket.ticket.id.substring(0, 8)}</strong> ใช่หรือไม่?
                </p>
              </div>
              <button 
                onClick={() => { setActionTicket(null); setNote(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 0 }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>
              Ticket: <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{actionTicket.ticket.subject}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                ความคิดเห็น / เหตุผลประกอบ {actionTicket.type === 'reject' ? <span style={{ color: 'var(--danger)' }}>(จำเป็นต้องระบุ) *</span> : '(ไม่บังคับ)'}
              </label>
              <textarea
                placeholder={actionTicket.type === 'approve' ? 'ป้อนความคิดเห็นเพิ่มเติม (เช่น ได้รับการอนุมัติแล้ว)...' : 'กรุณาระบุเหตุผลการปฏิเสธ...'}
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: `1.5px solid ${actionTicket.type === 'reject' && !note.trim() ? 'rgba(239, 68, 68, 0.5)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button 
                className="btn btn-outline" 
                onClick={() => { setActionTicket(null); setNote(''); }}
                disabled={loading}
                style={{ minWidth: 80 }}
              >
                ยกเลิก
              </button>
              <button 
                className={`btn ${actionTicket.type === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleActionSubmit}
                disabled={loading || (actionTicket.type === 'reject' && !note.trim())}
                style={{
                  minWidth: 100,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                  opacity: (actionTicket.type === 'reject' && !note.trim()) ? 0.6 : 1,
                  cursor: (actionTicket.type === 'reject' && !note.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <i className={`fa-solid ${actionTicket.type === 'approve' ? 'fa-check' : 'fa-xmark'}`}></i>
                    {actionTicket.type === 'approve' ? 'ยืนยันอนุมัติ' : 'ยืนยันปฏิเสธ'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet */}
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
            {/* Category Filter */}
            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>หมวดหมู่</label>
              <MobileCustomSelect
                value={pendingFilterCategory === 'all' ? '' : pendingFilterCategory}
                onChange={v => setPendingFilterCategory(v || 'all')}
                placeholder="ทุกหมวดหมู่"
                icon="layer-group"
                options={[
                  { value: 'hardware', label: 'ฮาร์ดแวร์ / อุปกรณ์', icon: 'laptop', iconColor: '#e67e22' },
                  { value: 'software', label: 'ซอฟต์แวร์ / โปรแกรม', icon: 'code', iconColor: '#3498db' },
                  { value: 'network', label: 'อินเทอร์เน็ต / Wi-Fi', icon: 'wifi', iconColor: '#eab308' },
                  { value: 'access', label: 'สิทธิ์เข้าใช้งาน', icon: 'key', iconColor: '#9b59b6' },
                  { value: 'other', label: 'ทั่วไป / บริการอื่นๆ', icon: 'circle-info', iconColor: '#95a5a6' }
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
                setPendingFilterCategory('all');
                setPendingHideCompleted(false);
                setFilterCategory('all');
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
                setFilterCategory(pendingFilterCategory);
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
