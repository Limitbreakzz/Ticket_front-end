import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, CATEGORIES, STATUS_LABEL } from '../data/mockData';

export default function DashboardView() {
  const { role, tickets } = useApp();
  const info = ROLE_INFO[role];

  // Stats calculation
  const totalTickets = tickets.length;
  const criticalTickets = tickets.filter(t => t.urgency === 'critical').length;
  const waitApproveTickets = tickets.filter(t => t.status === 'wait-approve').length;

  const inProgressTickets = tickets.filter(t => t.status === 'progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;

  const recentTickets = [...tickets].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero / Greeting ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>

        {/* KPI 1: Total */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-pale)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            <i className="fa-solid fa-ticket-alt"></i>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ticket ทั้งหมด</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalTickets}</div>
          </div>
        </div>

        {/* KPI 2: Critical */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            <i className="fa-solid fa-fire"></i>
          </div>
          <div>
            <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>งานวิกฤต (Critical)</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{criticalTickets}</div>
          </div>
        </div>

        {/* KPI 3: In Progress */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <div>
            <div style={{ color: '#9333ea', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>กำลังแก้ไข</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#9333ea', lineHeight: 1 }}>{inProgressTickets}</div>
          </div>
        </div>

        {/* KPI 4: Wait Approve */}
        <div className="kpi-card" style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 20, transition: 'var(--transition)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            <i className="fa-solid fa-clipboard-check"></i>
          </div>
          <div>
            <div style={{ color: '#d97706', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>รอการอนุมัติ</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{waitApproveTickets}</div>
          </div>
        </div>

      </div>

      {/* ── Details Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>

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
