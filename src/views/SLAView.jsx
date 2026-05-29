import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';
import { calcSLA, SLA_STATUS_CONFIG, SLA_POLICY, aggregateSLAStats, formatDuration, formatDeadline, CLOSED_STATUSES } from '../utils/sla';
import TicketDetailModal from '../components/TicketDetailModal';
import { SLABar } from '../components/SLAComponents';

const URGENCY_TH = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', critical: 'วิกฤต' };
const URGENCY_COLOR = { low: '#16a34a', medium: '#d97706', high: '#ef4444', critical: '#7c3aed' };
const STATUS_TH = { new: 'ใหม่', open: 'เปิด', 'in-progress': 'กำลังดำเนินการ', pending: 'รออนุมัติ', resolved: 'แก้ไขแล้ว', closed: 'ปิด', rejected: 'ปฏิเสธ' };

// ── Circular gauge for SLA compliance rate ──
function SLAGauge({ value }) {
  const r = 44, cx = 54, cy = 54, sw = 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 90 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="108" height="108" viewBox="0 0 108 108">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-main)" strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text-primary)">{value}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">อัตราผ่าน</text>
    </svg>
  );
}

// ── Small stat pill ──
function SLAStat({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${color}30`,
      borderRadius: 'var(--radius-lg)', padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      flex: '1 1 140px',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--radius-md)',
        background: color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18, color: '#fff',
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function SLAView() {
  const { tickets, role } = useApp();
  const [filter, setFilter] = useState('active'); // 'all' | 'active' | 'breached' | 'at-risk'
  const [selected, setSelected] = useState(null);

  const stats = aggregateSLAStats(tickets);

  // Filter tickets for the table
  const displayTickets = tickets.filter(t => {
    const sla = calcSLA(t);
    if (!sla) return false;
    if (filter === 'active')   return !CLOSED_STATUSES.has(t.status);
    if (filter === 'breached') return sla.slaStatus === 'breached';
    if (filter === 'at-risk')  return sla.slaStatus === 'at-risk';
    if (filter === 'missed')   return sla.slaStatus === 'missed';
    if (filter === 'met')      return sla.slaStatus === 'met';
    return true;
  }).sort((a, b) => {
    // Sort by SLA pct descending (most critical first)
    const sa = calcSLA(a), sb = calcSLA(b);
    return (sb?.pct || 0) - (sa?.pct || 0);
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const totalPages = Math.ceil(displayTickets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = displayTickets.slice(startIndex, startIndex + pageSize);

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
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          <i className="fa-solid fa-chart-bar" style={{ marginRight: 8 }} aria-hidden="true"></i> ติดตาม SLA
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Service Level Agreement — ติดตามและวิเคราะห์เวลาการแก้ไข Ticket ตามนโยบาย
        </p>
      </div>

      {/* SLA Policy Reference */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
          <i className="fa-solid fa-clipboard-list" style={{ marginRight: 8 }} aria-hidden="true"></i> นโยบาย SLA ตามระดับความเร่งด่วน
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(SLA_POLICY).map(([key, p]) => (
            <div key={key} style={{
              flex: '1 1 120px',
              background: `${URGENCY_COLOR[key]}10`,
              border: `1.5px solid ${URGENCY_COLOR[key]}40`,
              borderLeft: `4px solid ${URGENCY_COLOR[key]}`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: URGENCY_COLOR[key] }}>
                {URGENCY_TH[key]}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {p.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Gauge */}
        {stats.metRate !== null && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex',
            alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-sm)',
          }}>
            <SLAGauge value={stats.metRate} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>อัตราผ่าน SLA</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ผ่าน {stats.met} / ทั้งหมด {stats.closedCount} รายการ</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>ไม่ผ่าน {stats.missed} รายการ</div>
            </div>
          </div>
        )}
        {/* Pills */}
        <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <SLAStat icon={<i className="fa-solid fa-check"  aria-hidden="true"></i>} label="ทันเวลา" value={stats.onTrack} color="#10b981" bg="#f0fdf4" />
          <SLAStat icon={<i className="fa-solid fa-triangle-exclamation"  aria-hidden="true"></i>} label="ใกล้หมดเวลา" value={stats.atRisk} color="#f59e0b" bg="#fff7ed" />
          <SLAStat icon={<i className="fa-solid fa-circle-xmark"  aria-hidden="true"></i>} label="เกิน SLA" value={stats.breached} color="#ef4444" bg="#fef2f2" />
          <SLAStat icon={<i className="fa-solid fa-trophy"  aria-hidden="true"></i>} label="ผ่าน SLA (ปิดแล้ว)" value={stats.met} color="#6366f1" bg="#eef2ff" />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { key: 'active',   label: <><i className="fa-solid fa-rotate" style={{ marginRight: 6 }} aria-hidden="true"></i> Ticket ที่ยังเปิดอยู่</> },
          { key: 'breached', label: <><i className="fa-solid fa-circle-xmark" style={{ marginRight: 6 }} aria-hidden="true"></i> เกิน SLA</> },
          { key: 'at-risk',  label: <><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} aria-hidden="true"></i> ใกล้หมดเวลา</> },
          { key: 'missed',   label: <><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} aria-hidden="true"></i> ไม่ผ่าน SLA</> },
          { key: 'met',      label: <><i className="fa-solid fa-trophy" style={{ marginRight: 6 }} aria-hidden="true"></i> ผ่าน SLA</> },
          { key: 'all',      label: <><i className="fa-solid fa-clipboard-list" style={{ marginRight: 6 }} aria-hidden="true"></i> ทั้งหมด</> },
        ].map(f => (
          <button
            key={f.key}
            id={`sla-filter-${f.key}`}
            onClick={() => { setFilter(f.key); setCurrentPage(1); }}
            style={{
              padding: '7px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'var(--transition)',
              border: filter === f.key ? 'none' : '1px solid var(--border)',
              background: filter === f.key ? 'var(--primary)' : 'var(--bg-card)',
              color: filter === f.key ? '#fff' : 'var(--text-secondary)',
              boxShadow: filter === f.key ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
            }}
          >
            {f.label}
            <span style={{
              marginLeft: 6, background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--primary-pale)',
              color: filter === f.key ? '#fff' : 'var(--primary)',
              borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700,
              padding: '1px 6px',
            }}>
              {f.key === 'active'   ? tickets.filter(t => !CLOSED_STATUSES.has(t.status)).length :
               f.key === 'breached' ? stats.breached :
               f.key === 'at-risk'  ? stats.atRisk :
               f.key === 'missed'   ? stats.missed :
               f.key === 'met'      ? stats.met :
               tickets.length}
            </span>
          </button>
        ))}
      </div>

      {/* SLA Table */}
      <div className="table-card">
        {displayTickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fa-solid fa-face-smile"  aria-hidden="true"></i></div>
            <div className="empty-state-title">ไม่มีรายการในกลุ่มนี้</div>
            <div className="empty-state-desc">ลองเปลี่ยนตัวกรองด้านบน</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>ระดับ</th>
                  <th>นโยบาย SLA</th>
                  <th style={{ minWidth: 200 }}>ความคืบหน้า SLA</th>
                  <th>สถานะ SLA</th>
                  <th>กำหนดเสร็จ</th>
                  <th>สถานะ</th>
                  {(role === ROLES.ADMIN || role === ROLES.MANAGER) && <th>ดำเนินการ</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(t => {
                  const sla = calcSLA(t);
                  if (!sla) return null;
                  const cfg = SLA_STATUS_CONFIG[sla.slaStatus];
                  const statusCls = { new:'badge-new', open:'badge-open', 'in-progress':'badge-in-progress', pending:'badge-pending', resolved:'badge-resolved', closed:'badge-closed', rejected:'badge-rejected' };
                  return (
                    <tr key={t.id} id={`sla-row-${t.id}`} style={{
                      background: sla.slaStatus === 'breached' ? '#fff5f5' : sla.slaStatus === 'at-risk' ? '#fffbeb' : undefined,
                    }}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className="ticket-id">{t.id}</span>
                          <span className="ticket-subject" style={{ maxWidth: 160, fontSize: 12 }}>{t.subject}</span>
                          <span className="ticket-meta">{t.createdBy}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: `${URGENCY_COLOR[t.urgency]}18`,
                          color: URGENCY_COLOR[t.urgency],
                          padding: '2px 8px', borderRadius: 'var(--radius-full)',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {URGENCY_TH[t.urgency]}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sla.policy.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sla.policy.desc}</div>
                      </td>
                      <td style={{ minWidth: 200 }}>
                        <SLABar ticket={t} showLabel={true} />
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 9px', borderRadius: 'var(--radius-full)',
                          background: cfg.bg, color: cfg.color,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {formatDeadline(sla.deadlineDate)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusCls[t.status] || 'badge-new'}`}>
                          {STATUS_TH[t.status] || t.status}
                        </span>
                      </td>
                      {(role === ROLES.ADMIN || role === ROLES.MANAGER) && (
                        <td>
                          <button
                            className="btn btn-outline btn-xs"
                            id={`sla-view-${t.id}`}
                            onClick={() => setSelected(t)}
                          >
                            <i className="fa-solid fa-eye"  aria-hidden="true"></i> ดู
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {displayTickets.length > 0 && (
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
