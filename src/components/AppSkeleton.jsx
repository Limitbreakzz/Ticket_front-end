export default function AppSkeleton() {
  return (
    <div className="app-layout" style={{ pointerEvents: 'none', userSelect: 'none' }}>
      {/* Sidebar Skeleton (hidden on mobile automatically by app-layout CSS rules) */}
      <aside className="sidebar">
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon skeleton-shimmer" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
          <div className="sidebar-logo-text" style={{ gap: '4px' }}>
            <div className="skeleton-shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2].map(sectionIndex => (
            <div key={sectionIndex} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Section Header */}
              <div className="skeleton-shimmer" style={{ width: '60px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', marginBottom: '4px' }} />
              {/* Nav Items */}
              {[1, 2, 3].map(itemIndex => (
                <div key={itemIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <div className="skeleton-shimmer" style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
                  <div className="skeleton-shimmer" style={{ width: '110px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }} />
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="skeleton-shimmer" style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }} />
            <div className="skeleton-shimmer" style={{ width: '100px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <div className="skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }} />
              <div className="skeleton-shimmer" style={{ width: '120px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="main-content">
        {/* Topbar Skeleton */}
        <header className="topbar" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
          {/* Breadcrumbs Placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="skeleton-shimmer" style={{ width: '60px', height: '12px', borderRadius: '3px' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/</span>
            <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
          </div>

          {/* Topbar Actions */}
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Create Ticket Button placeholder */}
            <div className="skeleton-shimmer" style={{ width: '90px', height: '32px', borderRadius: 'var(--radius-md)' }} />
            {/* Bell Notification Icon placeholder */}
            <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            {/* User Profile block placeholder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '6px 12px' }}>
              <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="skeleton-shimmer" style={{ width: '70px', height: '11px', borderRadius: '3px' }} />
                <div className="skeleton-shimmer" style={{ width: '90px', height: '9px', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View Skeleton */}
        <main className="page-content">
          <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Hero / Greeting Section Skeleton */}
            <div className="hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '136px', background: 'linear-gradient(135deg, #0b1329 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', padding: '24px' }}>
              <div style={{ zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '220px', height: '18px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }} />
                <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '160px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }} />
                <div className="skeleton-shimmer" style={{ maxWidth: '100%', width: '320px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </div>

            {/* KPI Cards Grid Skeleton */}
            <div className="dashboard-summary-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="kpi-card" style={{ padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div className="skeleton-shimmer" style={{ maxWidth: '50%', width: '80px', height: '12px', borderRadius: '3px' }} />
                    <div className="skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '10px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '50px', height: '30px', borderRadius: '4px' }} />
                </div>
              ))}
            </div>

            {/* Main Split Layout Section Skeleton */}
            <div className="dashboard-main-grid" style={{ gap: 24 }}>
              {/* Left Side: Department Tickets Table */}
              <div className="dashboard-card">
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
              <div className="dashboard-card">
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
        </main>
      </div>

      {/* Bottom Navigation Skeleton (hidden on desktop via css) */}
      <nav className="bottom-nav">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bottom-nav-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '32px', height: '8px', borderRadius: '2px' }} />
          </div>
        ))}
      </nav>
    </div>
  );
}
