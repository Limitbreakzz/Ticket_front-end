import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO } from '../data/mockData';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';

// ── Donut chart (pure SVG) ──
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 54, cx = 64, cy = 64, stroke = 24;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="donut-wrap">
      <svg width="128" height="128" className="donut-svg" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-main)" strokeWidth={stroke} />
        {data.map((d, i) => {
          const pct = d.value / total;
          const offset = circumference - pct * circumference;
          const rotate = (cumulative / total) * 360 - 90;
          cumulative += d.value;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              style={{ transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 0.8s ease' }}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">รวม</text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: d.color }}></span>
            <span className="legend-label">{d.label}</span>
            <span className="legend-count">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar chart ──
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-row">
          <span className="bar-label">{d.label}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
          <span className="bar-count">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardView() {
  const { tickets, role, setActiveNav } = useApp();
  const [showForm, setShowForm] = useState(false);
  const info = ROLE_INFO[role];

  // Stats
  const total = tickets.length;
  const myTickets = role === ROLES.EMPLOYEE
    ? tickets.filter(t => t.createdBy === info.name)
    : tickets;

  const byStatus = (s) => tickets.filter(t => t.status === s).length;
  const newCount = byStatus('new');
  const inProgress = byStatus('in-progress');
  const pending = byStatus('pending');
  const resolved = byStatus('resolved');
  const critical = tickets.filter(t => t.urgency === 'critical').length;
  const waiting = tickets.filter(t => !t.managerApproval && ['permission', 'hardware'].includes(t.category)).length;

  const donutData = [
    { label: 'ใหม่', value: newCount, color: '#3b82f6' },
    { label: 'กำลังดำเนินการ', value: inProgress, color: '#f59e0b' },
    { label: 'รออนุมัติ', value: pending, color: '#7c3aed' },
    { label: 'แก้ไขแล้ว', value: resolved, color: '#10b981' },
    { label: 'ปิด', value: byStatus('closed'), color: '#94a3b8' },
  ];

  const catData = [
    { label: <><i className="fa-solid fa-desktop" style={{ marginRight: 6 }}></i> ฮาร์ดแวร์</>, value: tickets.filter(t => t.category === 'hardware').length, color: '#f59e0b' },
    { label: <><i className="fa-solid fa-laptop-code" style={{ marginRight: 6 }} aria-hidden="true"></i> ซอฟต์แวร์</>, value: tickets.filter(t => t.category === 'software').length, color: '#3b82f6' },
    { label: <><i className="fa-solid fa-globe" style={{ marginRight: 6 }}></i> เครือข่าย</>, value: tickets.filter(t => t.category === 'network').length, color: '#0ea5e9' },
    { label: <><i className="fa-solid fa-key" style={{ marginRight: 6 }}></i> สิทธิ์ใช้งาน</>, value: tickets.filter(t => t.category === 'permission').length, color: '#7c3aed' },
    { label: <><i className="fa-solid fa-clipboard-list" style={{ marginRight: 6 }} aria-hidden="true"></i> อื่น ๆ</>, value: tickets.filter(t => t.category === 'other').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const recentTickets = [...tickets].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  // Role-specific stats
  const statsConfig = {
    [ROLES.EMPLOYEE]: [
      { icon: <i className="fa-solid fa-rectangle-list"></i>, label: 'Ticket ของฉัน', value: myTickets.length, color: '#eff6ff', iconBg: 'linear-gradient(135deg,#3b82f6,#2563eb)', trend: null },
      { icon: <i className="fa-solid fa-wrench"  aria-hidden="true"></i>, label: 'กำลังดำเนินการ', value: myTickets.filter(t=>t.status==='in-progress').length, color: '#fff7ed', iconBg: 'linear-gradient(135deg,#f59e0b,#d97706)', trend: null },
      { icon: <i className="fa-solid fa-check"  aria-hidden="true"></i>, label: 'แก้ไขสำเร็จ', value: myTickets.filter(t=>t.status==='resolved').length, color: '#f0fdf4', iconBg: 'linear-gradient(135deg,#10b981,#059669)', trend: null },
      { icon: <i className="fa-solid fa-hourglass-half"></i>, label: 'รออนุมัติ', value: myTickets.filter(t=>t.status==='pending').length, color: '#ede9fe', iconBg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', trend: null },
    ],
    [ROLES.MANAGER]: [
      { icon: <i className="fa-solid fa-rectangle-list"  aria-hidden="true"></i>, label: 'Ticket ทั้งหมด', value: total, color: '#eff6ff', iconBg: 'linear-gradient(135deg,#3b82f6,#2563eb)', trend: '↑ 12% จากเดือนก่อน' },
      { icon: <i className="fa-solid fa-clock"  aria-hidden="true"></i>, label: 'รออนุมัติ', value: waiting, color: '#fff7ed', iconBg: 'linear-gradient(135deg,#f59e0b,#d97706)', trend: null },
      { icon: <i className="fa-solid fa-wrench"  aria-hidden="true"></i>, label: 'กำลังดำเนินการ', value: inProgress, color: '#f0fdf4', iconBg: 'linear-gradient(135deg,#10b981,#059669)', trend: null },
      { icon: <i className="fa-solid fa-chart-bar"  aria-hidden="true"></i>, label: 'แก้ไขสำเร็จเดือนนี้', value: resolved, color: '#ede9fe', iconBg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', trend: '↑ 8% จากเดือนก่อน' },
    ],
    [ROLES.ADMIN]: [
      { icon: <i className="fa-solid fa-rectangle-list"></i>, label: 'Ticket ทั้งหมด', value: total, color: '#eff6ff', iconBg: 'linear-gradient(135deg,#3b82f6,#2563eb)', trend: '↑ 12% จากเดือนก่อน' },
      { icon: <i className="fa-solid fa-triangle-exclamation"></i>, label: 'วิกฤต/เร่งด่วน', value: critical, color: '#fef3c7', iconBg: 'linear-gradient(135deg,#ef4444,#dc2626)', trend: null },
      { icon: <i className="fa-solid fa-hourglass-half"></i>, label: 'รอมอบหมาย', value: tickets.filter(t=>t.assignedTo==='รอมอบหมาย').length, color: '#fff7ed', iconBg: 'linear-gradient(135deg,#f59e0b,#d97706)', trend: null },
      { icon: <i className="fa-solid fa-check"  aria-hidden="true"></i>, label: 'แก้ไขสำเร็จ (เดือนนี้)', value: resolved, color: '#f0fdf4', iconBg: 'linear-gradient(135deg,#10b981,#059669)', trend: '↑ 8%' },
    ],
  };
  const stats = statsConfig[role];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #0ea5e9 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginBottom: 4 }}>
            <i className="fa-solid fa-hand-wave" style={{ marginRight: 6 }}></i> ยินดีต้อนรับ ·{' '}
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>
              {info.label}
            </span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
            {info.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>
            {role === ROLES.EMPLOYEE && 'คุณมี Ticket ที่กำลังดำเนินการอยู่ ' + myTickets.filter(t => t.status === 'in-progress').length + ' รายการ'}
            {role === ROLES.MANAGER && 'มี Ticket รออนุมัติ ' + waiting + ' รายการ ที่ต้องการการพิจารณา'}
            {role === ROLES.ADMIN && 'วันนี้มี Ticket ใหม่ ' + newCount + ' รายการ และวิกฤต ' + critical + ' รายการ'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {role === ROLES.EMPLOYEE && (
            <button
              className="btn btn-primary"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowForm(true)}
              id="dashboard-create-btn"
            >
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i> แจ้งเรื่องใหม่
            </button>
          )}
          {(role === ROLES.MANAGER) && (
            <button
              className="btn btn-primary"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}
              onClick={() => setActiveNav('approval')}
              id="dashboard-approval-btn"
            >
              <i className="fa-solid fa-check" style={{ marginRight: 6 }} aria-hidden="true"></i> ดูรายการอนุมัติ
            </button>
          )}
          {(role === ROLES.ADMIN) && (
            <>
              <button
                className="btn btn-primary"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}
                onClick={() => setActiveNav('all-tickets')}
                id="dashboard-all-btn"
              >
                <i className="fa-solid fa-clipboard-list" style={{ marginRight: 6 }} aria-hidden="true"></i> Ticket ทั้งหมด
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'rgba(239,68,68,0.5)', border: '1px solid rgba(255,255,255,0.35)' }}
                onClick={() => setActiveNav('escalated')}
                id="dashboard-critical-btn"
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }}></i> วิกฤต
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.iconBg }}>
              <span style={{ filter: 'brightness(0) invert(1)', fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.trend && <div className="stat-trend up">{s.trend}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="dashboard-grid">
        {/* Donut */}
        <div className="chart-card">
          <div className="section-header">
            <span className="section-title">สรุปสถานะ Ticket</span>
          </div>
          <DonutChart data={donutData} />
        </div>

        {/* Bar by category */}
        <div className="chart-card">
          <div className="section-header">
            <span className="section-title">Ticket ตามหมวดหมู่</span>
          </div>
          <BarChart data={catData} />
        </div>

        {/* Recent Tickets */}
        <div className="table-card span-2">
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Ticket ล่าสุด</span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveNav(role === ROLES.EMPLOYEE ? 'my-tickets' : role === ROLES.MANAGER ? 'dept-tickets' : 'all-tickets')}
              id="view-all-link"
            >
              ดูทั้งหมด →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>เรื่อง</th>
                  <th>หมวด</th>
                  <th>ความเร่งด่วน</th>
                  <th>สถานะ</th>
                  <th>อัปเดต</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map(t => {
                  const sInfo = { new:'badge-new', open:'badge-open', 'in-progress':'badge-in-progress', pending:'badge-pending', resolved:'badge-resolved', closed:'badge-closed', rejected:'badge-rejected' };
                  const uInfo = { low:{cls:'badge-low',dot:'low'}, medium:{cls:'badge-medium',dot:'medium'}, high:{cls:'badge-high',dot:'high'}, critical:{cls:'badge-critical',dot:'critical'} };
                  const sLabel = { new:'ใหม่', open:'เปิด', 'in-progress':'กำลังดำเนินการ', pending:'รออนุมัติ', resolved:'แก้ไขแล้ว', closed:'ปิดแล้ว', rejected:'ปฏิเสธ' };
                  const uLabel = { low:'ต่ำ', medium:'ปานกลาง', high:'สูง', critical:'วิกฤต' };
                  const catInfo = { hardware:{icon:<i className="fa-solid fa-desktop"  aria-hidden="true"></i>,label:'ฮาร์ดแวร์'}, software:{icon:<i className="fa-solid fa-laptop-code"  aria-hidden="true"></i>,label:'ซอฟต์แวร์'}, network:{icon:<i className="fa-solid fa-network-wired"  aria-hidden="true"></i>,label:'เครือข่าย'}, permission:{icon:<i className="fa-solid fa-key"  aria-hidden="true"></i>,label:'สิทธิ์'}, other:{icon:<i className="fa-solid fa-clipboard-list"  aria-hidden="true"></i>,label:'อื่น ๆ'} };
                  return (
                    <tr key={t.id}>
                      <td><span className="ticket-id">{t.id}</span></td>
                      <td><div className="ticket-subject" style={{ maxWidth: 200 }}>{t.subject}</div></td>
                      <td>
                        <span className={`badge badge-${t.category}`}>
                          {catInfo[t.category]?.icon} {catInfo[t.category]?.label}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${uInfo[t.urgency]?.cls || 'badge-medium'}`}>
                          <span className={`priority-dot ${uInfo[t.urgency]?.dot || 'medium'}`}></span>
                          {uLabel[t.urgency]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${sInfo[t.status] || 'badge-new'}`}>
                          {sLabel[t.status] || t.status}
                        </span>
                      </td>
                      <td><span className="ticket-meta">{t.updatedAt}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && <TicketFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
