import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_INFO, CATEGORIES } from '../data/mockData';
import TicketDetailModal from './TicketDetailModal';
import { SLABadge, SLABar } from './SLAComponents';

const STATUS_LABEL = {
  new: { label: 'ใหม่', cls: 'badge-new' },
  open: { label: 'เปิด', cls: 'badge-open' },
  'in-progress': { label: 'กำลังดำเนินการ', cls: 'badge-in-progress' },
  pending: { label: 'รออนุมัติ', cls: 'badge-pending' },
  resolved: { label: 'แก้ไขแล้ว', cls: 'badge-resolved' },
  closed: { label: 'ปิดแล้ว', cls: 'badge-closed' },
  rejected: { label: 'ปฏิเสธ', cls: 'badge-rejected' },
};

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

  return (
    <div className="table-card">
      {/* Toolbar */}
      <div className="table-toolbar">
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>({filtered.length} รายการ)</span>

        {/* Search */}
        <div className="topbar-search" style={{ minWidth: 180 }}>
          <span className="topbar-search-icon"><i className="fa-solid fa-magnifying-glass"  aria-hidden="true"></i></span>
          <input
            placeholder="ค้นหา Ticket..."
            value={search}
            onChange={handleSearchChange}
            id="ticket-search"
          />
        </div>

        {/* Filters */}
        <select className="filter-select" value={statusFilter} onChange={handleFilterChange(setStatusFilter)} id="status-filter">
          <option value="">ทุกสถานะ</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className="filter-select" value={urgencyFilter} onChange={handleFilterChange(setUrgencyFilter)} id="urgency-filter">
          <option value="">ทุกระดับ</option>
          {Object.entries(URGENCY_INFO).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className="filter-select" value={catFilter} onChange={handleFilterChange(setCatFilter)} id="category-filter">
          <option value="">ทุกหมวด</option>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>

        {(statusFilter || urgencyFilter || catFilter || search) && (
          <button
            className="filter-btn"
            onClick={() => { setStatusFilter(''); setUrgencyFilter(''); setCatFilter(''); setSearch(''); }}
            id="clear-filters"
          >
            <i className="fa-solid fa-xmark" style={{ marginRight: 4 }}></i> ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="fa-solid fa-box-open"  aria-hidden="true"></i></div>
          <div className="empty-state-title">ไม่พบ Ticket</div>
          <div className="empty-state-desc">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>เรื่อง</th>
                <th>หมวดหมู่</th>
                <th>ความเร่งด่วน</th>
                <th>สถานะ</th>
                <th style={{ minWidth: 180 }}>SLA</th>
                <th>ผู้แจ้ง</th>
                <th>อัปเดต</th>
                <th>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(t => {
                const statusInfo = STATUS_LABEL[t.status] || { label: t.status, cls: 'badge-new' };
                const urgInfo = URGENCY_INFO[t.urgency] || { label: t.urgency, cls: 'badge-medium', dot: 'medium' };
                const catInfo = CATEGORIES[t.category];
                return (
                  <tr key={t.id} id={`row-${t.id}`}>
                    <td><span className="ticket-id">{t.id}</span></td>
                    <td>
                      <div className="ticket-subject">{t.subject}</div>
                      <div className="ticket-meta">{t.assignedTo}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${t.category}`}>
                        {catInfo?.icon} {catInfo?.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${urgInfo.cls}`}>
                        <span className={`priority-dot ${urgInfo.dot}`}></span>
                        {urgInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                    </td>
                    <td style={{ minWidth: 180 }}>
                      <SLABar ticket={t} showLabel={false} />
                      <div style={{ marginTop: 4 }}><SLABadge ticket={t} /></div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{t.createdBy}</div>
                      <div className="ticket-meta">{t.department}</div>
                    </td>
                    <td>
                      <div className="ticket-meta" style={{ fontSize: 12 }}>{t.updatedAt}</div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-outline btn-xs tooltip"
                          data-tip="ดูรายละเอียด"
                          style={{ padding: '6px 10px' }}
                          id={`view-${t.id}`}
                          onClick={() => setSelectedTicket(t)}
                        >
                          <i className="fa-solid fa-eye" aria-hidden="true"></i>
                        </button>
                        {(role === ROLES.MANAGER || role === ROLES.ADMIN) &&
                          (t.status === 'pending' || t.status === 'new') &&
                          !t.managerApproval && (
                            <button
                              className="btn btn-success btn-xs tooltip"
                              data-tip="อนุมัติ"
                              style={{ padding: '6px 10px' }}
                              id={`quick-approve-${t.id}`}
                              onClick={() => setSelectedTicket(t)}
                            >
                              <i className="fa-solid fa-check" aria-hidden="true"></i>
                            </button>
                          )}
                        {role === ROLES.ADMIN && t.status !== 'closed' && t.status !== 'resolved' && (
                          <button
                            className="btn btn-primary btn-xs tooltip"
                            data-tip="จัดการ"
                            style={{ padding: '6px 10px' }}
                            id={`manage-${t.id}`}
                            onClick={() => setSelectedTicket(t)}
                          >
                            <i className="fa-solid fa-gear" aria-hidden="true"></i>
                          </button>
                        )}
                      </div>
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
