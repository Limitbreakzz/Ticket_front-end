import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_INFO, ROLES, STATUS_LABEL, CATEGORIES } from '../data/mockData';
import TicketDetailModal from '../components/TicketDetailModal';

const STATUS_STEPS = [
  { key: 'pending',      label: 'รอดำเนินการ',    icon: 'clock',              color: '#3b82f6' },
  { key: 'progress',     label: 'กำลังแก้ไข',      icon: 'screwdriver-wrench', color: '#f59e0b' },
  { key: 'wait-approve', label: 'รออนุมัติ',       icon: 'hourglass-half',     color: '#8b5cf6' },
  { key: 'approved',     label: 'อนุมัติแล้ว',     icon: 'circle-check',       color: '#10b981' },
  { key: 'resolved',     label: 'แก้ไขเสร็จ',      icon: 'circle-check',       color: '#10b981' },
  { key: 'closed',       label: 'ปิดเคส',           icon: 'lock',               color: '#64748b' },
];

const STATUS_COLOR = {
  pending:       { bg: 'rgba(59,130,246,0.10)',  color: '#2563eb', border: 'rgba(59,130,246,0.25)' },
  progress:      { bg: 'rgba(245,158,11,0.10)',  color: '#d97706', border: 'rgba(245,158,11,0.25)' },
  'wait-approve':{ bg: 'rgba(124,58,237,0.10)',  color: '#7c3aed', border: 'rgba(124,58,237,0.25)' },
  approved:      { bg: 'rgba(16,185,129,0.10)',  color: '#059669', border: 'rgba(16,185,129,0.25)' },
  rejected:      { bg: 'rgba(239,68,68,0.10)',   color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
  forwarded:     { bg: 'rgba(14,165,233,0.10)',  color: '#0284c7', border: 'rgba(14,165,233,0.25)' },
  'wait-parts':  { bg: 'rgba(100,116,139,0.10)', color: '#475569', border: 'rgba(100,116,139,0.25)' },
  resolved:      { bg: 'rgba(16,185,129,0.10)',  color: '#059669', border: 'rgba(16,185,129,0.25)' },
  closed:        { bg: 'rgba(71,85,105,0.10)',   color: '#475569', border: 'rgba(71,85,105,0.25)' },
  cancelled:     { bg: 'rgba(239,68,68,0.10)',   color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
};

const URGENCY_COLOR = {
  low:      { color: '#16a34a', bg: '#f0fdf4', label: 'ต่ำ',      icon: 'circle-check' },
  medium:   { color: '#d97706', bg: '#fef9c3', label: 'ปานกลาง', icon: 'circle-minus' },
  high:     { color: '#dc2626', bg: '#fef2f2', label: 'สูง',      icon: 'circle-exclamation' },
  critical: { color: '#7c3aed', bg: '#f5f3ff', label: 'วิกฤต',   icon: 'triangle-exclamation' },
};

function StatusJourney({ status }) {
  const terminalStatuses = ['rejected', 'cancelled', 'closed', 'resolved', 'approved'];
  const mainFlow = ['pending', 'progress', 'wait-approve', 'approved', 'resolved', 'closed'];
  const currentIdx = mainFlow.indexOf(status);
  const isTerminal = terminalStatuses.includes(status);
  const isSpecial = !mainFlow.includes(status); // rejected, cancelled, forwarded, wait-parts

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 10, marginBottom: 4 }}>
      {mainFlow.map((s, i) => {
        const isDone = currentIdx > i;
        const isCurrent = currentIdx === i;
        const step = STATUS_STEPS.find(x => x.key === s);
        const sc = STATUS_COLOR[s] || STATUS_COLOR.pending;

        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < mainFlow.length - 1 ? 1 : undefined }}>
            {/* Circle */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              transition: 'all 0.3s ease',
              background: isDone ? step?.color : isCurrent ? sc.bg : 'var(--bg-main)',
              color: isDone ? '#fff' : isCurrent ? sc.color : 'var(--text-muted)',
              border: isCurrent ? `2px solid ${sc.color}` : isDone ? 'none' : '1.5px solid var(--border-light)',
              boxShadow: isCurrent ? `0 0 0 4px ${sc.border}` : 'none',
            }}>
              <i className={`fa-solid fa-${isDone ? 'check' : step?.icon || 'circle'}`} style={{ fontSize: 10 }} />
            </div>
            {/* Connector line */}
            {i < mainFlow.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: isDone ? step?.color : 'var(--border-light)',
                transition: 'background 0.3s ease',
                minWidth: 8,
              }} />
            )}
          </div>
        );
      })}
      {/* Special status badge */}
      {isSpecial && (
        <div style={{
          marginLeft: 8,
          background: STATUS_COLOR[status]?.bg,
          color: STATUS_COLOR[status]?.color,
          border: `1px solid ${STATUS_COLOR[status]?.border}`,
          borderRadius: 20,
          padding: '2px 10px',
          fontSize: 11,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}>
          <i className={`fa-solid fa-${STATUS_LABEL[status]?.icon || 'circle'}`} style={{ fontSize: 9 }} />
          {STATUS_LABEL[status]?.label || status}
        </div>
      )}
    </div>
  );
}

export default function TrackView() {
  const { tickets, role, currentUser } = useApp();
  const info = ROLE_INFO[role];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deptTab, setDeptTab] = useState('all');

  const myTickets = role === ROLES.EMPLOYEE
    ? tickets.filter(t => t.createdBy === info.name)
    : tickets;

  const ourDept = currentUser?.department?.name || (role === ROLES.EMPLOYEE ? 'ฝ่ายผลิต 1' : role === ROLES.MANAGER ? 'ฝ่ายซ่อมบำรุง' : 'ส่วนกลาง');

  // Department Filters
  const outboundTickets = myTickets.filter(t => t.department === ourDept && t.targetDepartment !== ourDept);
  const inboundTickets  = myTickets.filter(t => t.targetDepartment === ourDept && t.department !== ourDept);

  const displayTicketsByDept = deptTab === 'outbound' 
    ? outboundTickets 
    : deptTab === 'inbound' 
    ? inboundTickets 
    : myTickets;

  const filtered = displayTicketsByDept.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    if (statusFilter === 'active') return matchSearch && !['closed', 'resolved', 'cancelled'].includes(t.status);
    if (statusFilter === 'done')   return matchSearch && ['closed', 'resolved'].includes(t.status);
    if (statusFilter === 'all')    return matchSearch;
    return matchSearch && t.status === statusFilter;
  }).sort((a, b) => b.id.localeCompare(a.id));

  const activeCount = displayTicketsByDept.filter(t => !['closed','resolved','cancelled'].includes(t.status)).length;
  const doneCount   = displayTicketsByDept.filter(t => ['resolved','closed'].includes(t.status)).length;
  const pendingCount = displayTicketsByDept.filter(t => t.status === 'pending').length;
  const criticalCount = displayTicketsByDept.filter(t => t.urgency === 'critical' || t.urgency === 'high').length;

  const FILTER_TABS = [
    { key: 'active',   label: 'กำลังดำเนินการ', count: activeCount },
    { key: 'done',     label: 'เสร็จสิ้นแล้ว',   count: doneCount },
    { key: 'all',      label: 'ทั้งหมด',          count: displayTicketsByDept.length },
  ];

  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06 }}>
          <svg width="100%" height="100%" viewBox="0 0 400 160">
            <pattern id="tgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fff" strokeWidth="0.8"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#tgrid)"/>
          </svg>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fa-solid fa-radar"></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>ติดตามสถานะ Ticket</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.75, marginTop: 2 }}>ดูความคืบหน้าและเส้นทางของแต่ละ Ticket</p>
            </div>
          </div>

          {/* Mini Stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'ทั้งหมด',          value: displayTicketsByDept.length, icon: 'inbox',                  bg: 'rgba(255,255,255,0.12)' },
              { label: 'กำลังดำเนินการ',   value: activeCount,       icon: 'rotate',                 bg: 'rgba(253,230,138,0.2)' },
              { label: 'รอดำเนินการ',       value: pendingCount,      icon: 'clock',                  bg: 'rgba(147,197,253,0.2)' },
              { label: 'เร่งด่วน/วิกฤต',   value: criticalCount,     icon: 'triangle-exclamation',   bg: 'rgba(252,165,165,0.2)' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg,
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-lg)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <i className={`fa-solid fa-${s.icon}`} style={{ fontSize: 14, opacity: 0.9 }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 600, marginTop: 1 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segmented Control Tab Switcher */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-card)',
        padding: 4,
        borderRadius: 12,
        border: '1.5px solid var(--border-light)',
        alignSelf: 'flex-start',
        gap: 4,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {[
          { key: 'all', label: 'ทั้งหมด', icon: 'rectangle-list', color: 'var(--primary)', count: myTickets.length },
          { key: 'outbound', label: 'ตั๋วที่แผนกเราส่งไปแผนกอื่น', icon: 'paper-plane', color: '#0ea5e9', count: outboundTickets.length },
          { key: 'inbound', label: 'ตั๋วที่แผนกอื่นส่งมาแผนกเรา', icon: 'inbox', color: '#10b981', count: inboundTickets.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setDeptTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              border: 'none',
              background: deptTab === tab.key ? 'var(--primary-pale)' : 'transparent',
              color: deptTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.18s ease',
            }}
          >
            <i className={`fa-solid fa-${tab.icon}`} style={{
              color: deptTab === tab.key ? tab.color : 'var(--text-muted)',
              fontSize: 12,
            }} />
            {tab.label}
            <span style={{
              background: deptTab === tab.key ? 'rgba(255,255,255,0.7)' : 'var(--primary-pale)',
              color: 'var(--primary)',
              fontSize: 10,
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: 20,
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search + Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', fontSize: 14 }} />
          <input
            placeholder="ค้นหา Ticket ID หรือหัวข้อ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
              <i className="fa-solid fa-xmark" style={{ fontSize: 13 }} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === tab.key ? 'none' : '1.5px solid var(--border-light)',
                background: statusFilter === tab.key ? 'var(--primary)' : 'var(--bg-card)',
                color: statusFilter === tab.key ? '#fff' : 'var(--text-secondary)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: statusFilter === tab.key ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              {tab.label}
              <span style={{
                background: statusFilter === tab.key ? 'rgba(255,255,255,0.22)' : 'var(--primary-pale)',
                color: statusFilter === tab.key ? '#fff' : 'var(--primary)',
                borderRadius: 99,
                padding: '1px 7px',
                fontSize: 10,
                fontWeight: 700,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Journey Cards */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 32px',
          textAlign: 'center',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <i className="fa-solid fa-radar" style={{ fontSize: 40, color: 'var(--text-muted)', opacity: 0.3, display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>ไม่พบรายการ Ticket</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.7 }}>ลองเปลี่ยนตัวกรองหรือคำค้นหา</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => {
            const catInfo = CATEGORIES[t.category];
            const urgency = URGENCY_COLOR[t.urgency] || URGENCY_COLOR.medium;
            const sc = STATUS_COLOR[t.status] || STATUS_COLOR.pending;
            const statusLabel = STATUS_LABEL[t.status] || { label: t.status, icon: 'circle' };
            const isDone = ['resolved', 'closed', 'cancelled'].includes(t.status);

            return (
              <div
                key={t.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${isDone ? 'var(--border-light)' : sc.border}`,
                  borderLeft: `4px solid ${sc.color}`,
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  opacity: isDone ? 0.75 : 1,
                }}
                onClick={() => setSelectedTicket(t)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Row 1: ID + Status badge + Urgency */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--primary)',
                    background: 'var(--primary-pale)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  }}>#{t.id.substring(0, 8)}</span>

                  {/* Status */}
                  <span style={{
                    background: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.border}`,
                    borderRadius: 20,
                    padding: '2px 9px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <i className={`fa-solid fa-${statusLabel.icon}`} style={{ fontSize: 9 }} />
                    {statusLabel.label}
                  </span>

                  {/* Urgency */}
                  <span style={{
                    background: urgency.bg,
                    color: urgency.color,
                    borderRadius: 20,
                    padding: '2px 8px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <i className={`fa-solid fa-${urgency.icon}`} style={{ fontSize: 9 }} />
                    {urgency.label}
                  </span>

                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                    <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                    {t.createdAt?.split(',')[0]}
                  </span>
                </div>

                {/* Row 2: Subject + Category */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {t.subject}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className={`fa-solid fa-${catInfo?.icon || 'folder'}`} style={{ fontSize: 10 }} />
                    {catInfo?.label || t.category}
                    {t.subCategory && <span style={{ opacity: 0.6 }}>› {t.subCategory}</span>}
                  </div>
                </div>

                {/* Row 3: Journey progress bar */}
                <StatusJourney status={t.status} />

                {/* Row 4: Assigned + Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-user-gear" style={{ fontSize: 10 }} />
                    {t.assignedTo && t.assignedTo !== 'รอมอบหมาย'
                      ? <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t.assignedTo}</span>
                      : <span style={{ fontStyle: 'italic' }}>รอมอบหมาย</span>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedTicket(t); }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-main)',
                      color: 'var(--primary)',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; }}
                  >
                    ดูรายละเอียด
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}

      <style>{`
        @keyframes radarPulse {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.2); }
          70% { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
      `}</style>
    </div>
  );
}
