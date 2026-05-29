import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, CATEGORIES, STATUS_LABEL } from '../data/mockData';

export default function DashboardView() {
  const { role, tickets } = useApp();
  const info = ROLE_INFO[role];

  // Stats calculation
  const totalTickets = tickets.length;
  const newTickets = tickets.filter(t => t.status === 'new').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress' || t.status === 'progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const criticalTickets = tickets.filter(t => t.urgency === 'critical').length;
  const waitApproveTickets = tickets.filter(t => t.status === 'wait-approve').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;

  const recentTickets = [...tickets].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  return (
    <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero / Greeting ── */}
      <div className="hero-section">
        <div>
          <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 800, letterSpacing: '-0.02em' }}>
            สวัสดี, {info.name} 👋
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 15 }}>
            {role === ROLES.EMPLOYEE ? 'มีปัญหาหรือต้องการความช่วยเหลือ แจ้งทีม IT ได้เลย' : 'นี่คือภาพรวมระบบแจ้งซ่อมและงานที่รอคุณจัดการ'}
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dashboard-summary-grid">

        {/* KPI 1: Ticket ทั้งหมด */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div className="kpi-icon-box" style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            <i className="fa-solid fa-ticket-alt"></i>
          </div>
          <div>
            <div className="kpi-label" style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ticket ทั้งหมด</div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalTickets}</div>
          </div>
        </div>

        {/* KPI 2: เคสใหม่ */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div className="kpi-icon-box" style={{ width: 64, height: 64, borderRadius: 16, background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            <i className="fa-solid fa-square-plus"></i>
          </div>
          <div>
            <div className="kpi-label" style={{ color: '#1d4ed8', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>เคสใหม่</div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: '#1d4ed8', lineHeight: 1 }}>{newTickets}</div>
          </div>
        </div>

        {/* KPI 3: กำลังดำเนินการ */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div className="kpi-icon-box" style={{ width: 64, height: 64, borderRadius: 16, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <div>
            <div className="kpi-label" style={{ color: '#d97706', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>กำลังดำเนินการ</div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{inProgressTickets}</div>
          </div>
        </div>

        {/* KPI 4: แก้ไขเสร็จสิ้น */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div className="kpi-icon-box" style={{ width: 64, height: 64, borderRadius: 16, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div className="kpi-label" style={{ color: '#16a34a', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>แก้ไขเสร็จสิ้น</div>
            <div className="kpi-value" style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{resolvedTickets}</div>
          </div>
        </div>

      </div>


      {/* ── Details Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

        {/* Status Overview */}
        <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)' }}></i> สถานะของงานซ่อม
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>รอดำเนินการ</span>
                <span style={{ color: 'var(--text-primary)' }}>{pendingTickets} งาน <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}>({totalTickets ? Math.round((pendingTickets / totalTickets) * 100) : 0}%)</span></span>
              </div>
              <div style={{ width: '100%', background: 'var(--bg-main)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${totalTickets ? (pendingTickets / totalTickets) * 100 : 0}%`, background: '#cbd5e1', height: '100%', borderRadius: 5, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>กำลังแก้ไข</span>
                <span style={{ color: 'var(--text-primary)' }}>{inProgressTickets} งาน <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}>({totalTickets ? Math.round((inProgressTickets / totalTickets) * 100) : 0}%)</span></span>
              </div>
              <div style={{ width: '100%', background: 'var(--bg-main)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${totalTickets ? (inProgressTickets / totalTickets) * 100 : 0}%`, background: 'var(--primary)', height: '100%', borderRadius: 5, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>แก้ไขเสร็จสิ้น</span>
                <span style={{ color: 'var(--text-primary)' }}>{resolvedTickets} งาน <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}>({totalTickets ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%)</span></span>
              </div>
              <div style={{ width: '100%', background: 'var(--bg-main)', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${totalTickets ? (resolvedTickets / totalTickets) * 100 : 0}%`, background: 'var(--success)', height: '100%', borderRadius: 5, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }}></i> Ticket ล่าสุด
          </h2>
          {recentTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              ไม่มีข้อมูล Ticket
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTickets.map(t => {
                const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                const catInfo = CATEGORIES[t.category];
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid transparent', transition: 'var(--transition)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-card)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                      <i className={`fa-solid fa-${catInfo?.icon || 'ticket'}`}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.id} · {t.createdBy}</div>
                    </div>
                    <div>
                      <span className={`status-tag ${statusInfo.cls}`} style={{ fontSize: 11, padding: '2px 8px' }}>{statusInfo.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>
    </div>
  );
}
