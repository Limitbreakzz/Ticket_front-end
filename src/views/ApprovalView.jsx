import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, ROLE_INFO, STATUS_LABEL } from '../data/mockData';
import TicketDetailModal from '../components/TicketDetailModal';

export default function ApprovalView() {
  const { tickets, role } = useApp();
  const [selected, setSelected] = useState(null);
  const roleInfo = ROLE_INFO[role];

  // Tickets needing approval: those in 'pending' or 'new' with category requiring approval and no managerApproval yet
  const pendingApproval = tickets.filter(t =>
    !t.managerApproval &&
    ['permission', 'hardware'].includes(t.category) &&
    (t.status === 'pending' || t.status === 'new')
  );

  const approved = tickets.filter(t => t.managerApproval === 'approved');
  const rejected = tickets.filter(t => t.managerApproval === 'rejected');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const historyData = [...approved, ...rejected];
  const totalPages = Math.ceil(historyData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHistory = historyData.slice(startIndex, startIndex + pageSize);

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
    <div className="view-container">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          การอนุมัติ Ticket
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Ticket ที่ต้องการการอนุมัติก่อนดำเนินการ
        </p>
      </div>

      {/* Summary Badges */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            <span style={{ filter: 'brightness(0) invert(1)', fontSize: 20 }}><i className="fa-solid fa-hourglass-half"  aria-hidden="true"></i></span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{pendingApproval.length}</div>
            <div className="stat-label">รออนุมัติ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <span style={{ filter: 'brightness(0) invert(1)', fontSize: 20 }}><i className="fa-solid fa-check-double"  aria-hidden="true"></i></span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{approved.length}</div>
            <div className="stat-label">อนุมัติแล้ว</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            <span style={{ filter: 'brightness(0) invert(1)', fontSize: 20 }}><i className="fa-solid fa-triangle-exclamation"  aria-hidden="true"></i></span>
          </div>
          <div className="stat-info">
            <div className="stat-value">{rejected.length}</div>
            <div className="stat-label">ปฏิเสธ</div>
          </div>
        </div>
      </div>

      {/* Pending list */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <span className="section-title">⏳ รออนุมัติ ({pendingApproval.length} รายการ)</span>
      </div>

      {pendingApproval.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fa-solid fa-face-smile"  aria-hidden="true"></i></div>
            <div className="empty-state-title">ไม่มี Ticket รออนุมัติ</div>
            <div className="empty-state-desc">ทุกรายการได้รับการพิจารณาแล้ว</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {pendingApproval.map(t => {
            const catInfo = CATEGORIES[t.category];
            const urgColors = { low: '#16a34a', medium: '#d97706', high: '#ef4444', critical: '#7c3aed' };
            const urgLabels = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', critical: 'วิกฤต' };
            return (
              <div key={t.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderLeft: `4px solid ${urgColors[t.urgency] || '#3b82f6'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--shadow-sm)',
                flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 28 }}>{catInfo?.icon}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="ticket-id">{t.id}</span>
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" id={`view-approval-${t.id}`} onClick={() => setSelected(t)}>
                    <i className="fa-solid fa-eye" style={{ marginRight: 4 }} aria-hidden="true"></i> ดูรายละเอียด
                  </button>
                  <button className="btn btn-success btn-sm" id={`approve-${t.id}`} onClick={() => setSelected(t)}>
                    <i className="fa-solid fa-check" style={{ marginRight: 4 }} aria-hidden="true"></i> อนุมัติ
                  </button>
                  <button className="btn btn-danger btn-sm" id={`reject-${t.id}`} onClick={() => setSelected(t)}>
                    <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} aria-hidden="true"></i> ปฏิเสธ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <span className="section-title"><i className="fa-solid fa-folder-open" style={{ marginRight: 8 }}></i> ประวัติการอนุมัติ</span>
      </div>
      <div className="table-card">
        {[...approved, ...rejected].length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fa-solid fa-folder-open"  aria-hidden="true"></i></div>
            <div className="empty-state-title">ยังไม่มีประวัติ</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>เรื่อง</th>
                  <th>หมวด</th>
                  <th>สถานะการอนุมัติ</th>
                  <th>สถานะ Ticket</th>
                  <th>ผู้แจ้ง</th>
                  <th>ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map(t => {
                  const catInfo = CATEGORIES[t.category];
                  const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'status-pending' };
                  return (
                    <tr key={t.id}>
                      <td><span className="ticket-id">{t.id}</span></td>
                      <td>
                        <div className="ticket-subject">{t.subject}</div>
                        <div className="ticket-meta">{t.updatedAt}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${t.category}`}>
                          {catInfo?.icon} {catInfo?.label}
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
                      <td>
                        <button className="btn btn-outline btn-xs" id={`history-view-${t.id}`} onClick={() => setSelected(t)}>
                          <i className="fa-solid fa-eye"  aria-hidden="true"></i> ดู
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
        {historyData.length > 0 && (
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
        )}
      </div>

      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
