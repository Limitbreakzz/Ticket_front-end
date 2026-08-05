// ─── 1. Dashboard Skeleton ───
export function DashboardSkeleton() {
  return (
    <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero / Greeting Section Skeleton */}
      <div className="hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '136px', background: 'linear-gradient(135deg, #0b1329 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', padding: '24px', borderRadius: '16px' }}>
        <div style={{ zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '220px', height: '18px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }} />
          <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '160px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }} />
          <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '320px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="dashboard-summary-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card" style={{ padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
              <div className="skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '10px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '50px', height: '30px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* Main Split Layout Section Skeleton */}
      <div className="dashboard-main-grid" style={{ gap: 24 }}>
        {/* Left Side: Department Tickets Table */}
        <div className="dashboard-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div className="skeleton-shimmer" style={{ width: '120px', height: '16px', borderRadius: '4px', marginBottom: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '220px', height: '10px', borderRadius: '3px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '70px', height: '20px', borderRadius: '10px' }} />
          </div>

          {/* Table for Desktop */}
          <div className="table-responsive-wrapper desktop-only">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)' }}>
                  <th style={{ padding: '12px 24px' }}>
                    <div className="skeleton-shimmer" style={{ width: '40px', height: '12px', borderRadius: '3px' }} />
                  </th>
                  <th style={{ padding: '12px' }}>
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
                  </th>
                  <th style={{ padding: '12px' }}>
                    <div className="skeleton-shimmer" style={{ width: '60px', height: '12px', borderRadius: '3px' }} />
                  </th>
                  <th style={{ padding: '12px 24px' }}>
                    <div className="skeleton-shimmer" style={{ width: '50px', height: '12px', borderRadius: '3px' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-shimmer" style={{ width: '50px', height: '12px', borderRadius: '3px' }} />
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div className="skeleton-shimmer" style={{ width: '160px', height: '12px', borderRadius: '3px' }} />
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="skeleton-shimmer" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                        <div className="skeleton-shimmer" style={{ width: '70px', height: '12px', borderRadius: '3px' }} />
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-shimmer" style={{ width: '60px', height: '18px', borderRadius: '10px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feed rows for Mobile */}
          <div className="dashboard-feed-wrapper mobile-only" style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="skeleton-shimmer" style={{ width: '34px', height: '34px', borderRadius: '10px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="skeleton-shimmer" style={{ width: '50px', height: '10px', borderRadius: '3px' }} />
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '10px', borderRadius: '3px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '150px', height: '12px', borderRadius: '3px' }} />
                </div>
                <div className="skeleton-shimmer" style={{ width: '50px', height: '16px', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Recent Tickets Feed */}
        <div className="dashboard-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="skeleton-shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px', marginBottom: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '140px', height: '10px', borderRadius: '3px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '70px', height: '20px', borderRadius: '10px' }} />
          </div>

          <div className="dashboard-feed-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="feed-item-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="skeleton-shimmer" style={{ width: '34px', height: '34px', borderRadius: '10px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="skeleton-shimmer" style={{ width: '50px', height: '10px', borderRadius: '3px' }} />
                      <div className="skeleton-shimmer" style={{ width: '60px', height: '10px', borderRadius: '3px' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '3px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '160px', height: '12px', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Tickets List Skeleton ───
export function TicketsSkeleton() {
  return (
    <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards Grid Skeleton */}
      <div className="dashboard-summary-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card" style={{ padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
              <div className="skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '10px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '50px', height: '30px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* Desktop Only Tickets Layout */}
      <div className="desktop-only">
        <div className="table-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div className="table-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="skeleton-shimmer" style={{ width: '150px', height: '16px', borderRadius: '4px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
            
            {/* Filters Row Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div className="skeleton-shimmer" style={{ height: '38px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '38px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '38px', borderRadius: '6px' }} />
            </div>

            {/* Controls Row: Hide Completed & Clear Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="skeleton-shimmer" style={{ width: '90px', height: '12px', borderRadius: '3px' }} />
                <div className="skeleton-shimmer" style={{ width: '38px', height: '20px', borderRadius: '20px' }} />
                <div className="skeleton-shimmer" style={{ width: '180px', height: '13px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '120px', height: '28px', borderRadius: '14px' }} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                {['รหัส / วันที่', 'ผู้แจ้ง / แผนก', 'หัวข้อ / หมวดหมู่', 'ความเร่งด่วน', 'สถานะ', 'สถานะและเวลา SLA', 'ผู้รับผิดชอบ'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 20px', textAlign: 'left' }}>
                    <div className="skeleton-shimmer" style={{ width: '60px', height: '12px', borderRadius: '3px' }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} /></td>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '120px', height: '12px', borderRadius: '3px' }} /></td>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '220px', height: '12px', borderRadius: '3px' }} /></td>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '60px', height: '18px', borderRadius: '10px' }} /></td>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '70px', height: '18px', borderRadius: '10px' }} /></td>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '85px', height: '12px', borderRadius: '3px' }} /></td>
                  <td style={{ padding: '16px 20px' }}><div className="skeleton-shimmer" style={{ width: '100px', height: '12px', borderRadius: '3px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Only Tickets Layout */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Combined Mobile Header & Search Card Skeleton */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', margin: '12px 12px 8px 12px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton-shimmer" style={{ width: '180px', height: '16px', borderRadius: '4px' }} />
          <div style={{ height: '1px', background: 'var(--border-light)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton-shimmer" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
            <div className="skeleton-shimmer" style={{ width: '80px', height: '40px', borderRadius: '8px' }} />
          </div>
        </div>

        {/* Mobile Ticket Cards Skeleton */}
        <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton-shimmer" style={{ width: '80px', height: '14px', borderRadius: '3px' }} />
                <div className="skeleton-shimmer" style={{ width: '70px', height: '10px', borderRadius: '3px' }} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '70%', height: '16px', borderRadius: '4px' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="skeleton-shimmer" style={{ width: '70px', height: '18px', borderRadius: '10px' }} />
                <div className="skeleton-shimmer" style={{ width: '50px', height: '18px', borderRadius: '10px' }} />
              </div>
              <div style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton-shimmer" style={{ width: '100%', height: '10px', borderRadius: '2px' }} />
                <div className="skeleton-shimmer" style={{ width: '90%', height: '10px', borderRadius: '2px' }} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '44px', borderRadius: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Approval View Skeleton ───
export function ApprovalSkeleton() {
  return (
    <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="skeleton-shimmer" style={{ width: '160px', height: '22px', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '260px', height: '12px', borderRadius: '3px' }} />
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card" style={{ padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton-shimmer" style={{ width: '40px', height: '24px', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ width: '60px', height: '10px', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* List / Table Section */}
      <div className="skeleton-shimmer" style={{ width: '120px', height: '16px', borderRadius: '4px', marginTop: '12px' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '10px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton-shimmer" style={{ width: '150px', height: '14px', borderRadius: '3px' }} />
              <div className="skeleton-shimmer" style={{ width: '70%', height: '16px', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ width: '220px', height: '10px', borderRadius: '3px' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '32px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '70px', height: '32px', borderRadius: '6px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. SLA View Skeleton ───
export function SLASkeleton() {
  return (
    <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '220px', height: '22px', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '380px', height: '12px', borderRadius: '3px' }} />
      </div>

      {/* SLA Policy Reference Skeleton */}
      <div className="report-chart-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px' }}>
        <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '280px', height: '16px', borderRadius: '4px', marginBottom: '20px' }} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: '1 1 120px', background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '2px' }} />
              <div className="skeleton-shimmer" style={{ width: '80px', height: '20px', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ width: '100px', height: '10px', borderRadius: '2px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Left Side: Circular Gauge */}
        <div className="report-chart-card" style={{ display: 'flex', alignItems: 'center', gap: 20, flex: '0 0 auto', padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', width: '100%', maxWidth: 280, height: 140 }}>
          <div className="skeleton-shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <div className="skeleton-shimmer" style={{ width: '120px', height: '12px', borderRadius: '3px' }} />
            <div className="skeleton-shimmer" style={{ width: '80px', height: '10px', borderRadius: '3px' }} />
            <div className="skeleton-shimmer" style={{ width: '90px', height: '10px', borderRadius: '3px' }} />
          </div>
        </div>

        {/* Right Side: 4 KPI Cards Grid */}
        <div className="dashboard-summary-grid" style={{ flex: 1 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="kpi-card" style={{ padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div className="skeleton-shimmer" style={{ width: '60px', height: '12px', borderRadius: '3px' }} />
                <div className="skeleton-shimmer" style={{ width: '30px', height: '30px', borderRadius: '8px' }} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '40px', height: '24px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* SLA Table Skeleton */}
      <div className="table-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="skeleton-shimmer" style={{ width: '150px', height: '16px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '200px', height: '32px', borderRadius: '6px' }} />
        </div>
        <TableSkeleton cols={7} rows={4} />
      </div>
    </div>
  );
}

// ─── 5. Profile View Skeleton ───
export function ProfileSkeleton() {
  return (
    <div className="view-container" style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="skeleton-shimmer" style={{ width: '140px', height: '22px', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '220px', height: '12px', borderRadius: '3px' }} />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div className="skeleton-shimmer" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div className="skeleton-shimmer" style={{ width: '150px', height: '16px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '120px', height: '12px', borderRadius: '3px' }} />
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton-shimmer" style={{ width: '70px', height: '12px', borderRadius: '3px' }} />
              <div className="skeleton-shimmer" style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 6. Reports View Skeleton ───
export function ReportsSkeleton() {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  return (
    <div className="view-container" style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 24,
      paddingLeft: isMobile ? '8px' : 0,
      paddingRight: isMobile ? '8px' : 0
    }}>
      {/* Title Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '220px', height: '22px', borderRadius: '4px', marginBottom: '8px' }} />
          <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '280px', height: '12px', borderRadius: '3px' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <div className="skeleton-shimmer" style={{ width: isMobile ? '100%' : '110px', height: '38px', borderRadius: '12px' }} />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="dashboard-summary-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: isMobile ? '12px' : '20px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card" style={{ 
            padding: isMobile ? '14px 16px' : '20px 24px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-light)', 
            borderRadius: '16px', 
            minHeight: isMobile ? '100px' : '120px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
              <div className="skeleton-shimmer" style={{ width: isMobile ? '32px' : '38px', height: isMobile ? '32px' : '38px', borderRadius: '10px' }} />
            </div>
            <div className="skeleton-shimmer" style={{ width: '50px', height: '30px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* Grid Charts visualization Skeleton */}
      <div className="reports-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '20px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="report-chart-card" style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-light)', 
            borderRadius: '16px', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16,
            height: '360px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Chart Title Skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 4 }}>
              <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              <div className="skeleton-shimmer" style={{ width: '140px', height: '16px', borderRadius: '4px' }} />
            </div>

            {/* Simulating Chart Content Area */}
            {i === 4 ? (
              // For Card 4: Target Departments List Skeleton (Horizontal Bars)
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0' }}>
                {[1, 2, 3, 4].map(j => (
                  <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
                      <div className="skeleton-shimmer" style={{ width: '40px', height: '12px', borderRadius: '3px' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: `${100 - j * 20}%`, height: '8px', borderRadius: '10px' }} />
                  </div>
                ))}
              </div>
            ) : (
              // For Cards 1, 2, 3: Recharts Bar Charts Skeletons (Vertical Bars)
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
                {/* Simulated Grid Area with vertical bars */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '2px solid var(--border-light)', paddingBottom: 8, position: 'relative' }}>
                  {/* Subtle horizontal grid lines */}
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: '1px', background: 'rgba(0,0,0,0.03)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(0,0,0,0.03)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', height: '1px', background: 'rgba(0,0,0,0.03)', pointerEvents: 'none' }} />
                  
                  {/* Vertical bar skeletons */}
                  <div className="skeleton-shimmer" style={{ width: '36px', height: '40%', borderRadius: '6px 6px 0 0' }} />
                  <div className="skeleton-shimmer" style={{ width: '36px', height: '80%', borderRadius: '6px 6px 0 0' }} />
                  <div className="skeleton-shimmer" style={{ width: '36px', height: '25%', borderRadius: '6px 6px 0 0' }} />
                  <div className="skeleton-shimmer" style={{ width: '36px', height: '60%', borderRadius: '6px 6px 0 0' }} />
                </div>
                {/* X-Axis labels area */}
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '2px' }} />
                  <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '2px' }} />
                  <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '2px' }} />
                  <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '2px' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 7. Table Skeleton ───
export function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: '14px 20px', textAlign: 'left' }}>
                <div className="skeleton-shimmer" style={{ width: '70px', height: '12px', borderRadius: '3px' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} style={{ padding: '16px 20px' }}>
                  {j === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <div className="skeleton-shimmer" style={{ width: '100px', height: '12px', borderRadius: '3px' }} />
                    </div>
                  ) : (
                    <div className="skeleton-shimmer" style={{ width: j === 1 ? '140px' : '80px', height: '12px', borderRadius: '3px' }} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

