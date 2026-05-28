import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, ROLES, ROLE_INFO, STATUS_LABEL } from '../data/mockData';
import { SLADetail } from './SLAComponents';

const URGENCY_INFO = {
  low: { label: 'ต่ำ', cls: 'badge-low', dot: 'low' },
  medium: { label: 'ปานกลาง', cls: 'badge-medium', dot: 'medium' },
  high: { label: 'สูง', cls: 'badge-high', dot: 'high' },
  critical: { label: 'วิกฤต', cls: 'badge-critical', dot: 'critical' },
};

const TEAM_OPTIONS = [
  'ทีม IT Support',
  'ทีม IT Admin',
  'ทีม IT Network',
  'ทีม IT Software',
  'ทีม IT Procurement',
  'ช่าง IT ชั้น 1',
  'ช่าง IT ชั้น 2',
  'ช่าง IT ชั้น 3',
];

export default function TicketDetailModal({ ticket, onClose }) {
  const { role, updateTicketStatus, approveTicket, assignTicket } = useApp();
  const [note, setNote] = useState('');
  const [assignee, setAssignee] = useState(ticket.assignedTo);
  const [approvalNote, setApprovalNote] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const catInfo = CATEGORIES[ticket.category];
  const statusInfo = STATUS_LABEL[ticket.status] || { label: ticket.status, cls: 'status-pending' };
  const urgInfo = URGENCY_INFO[ticket.urgency] || { label: ticket.urgency, cls: 'badge-medium', dot: 'medium' };
  const roleInfo = ROLE_INFO[role];

  const canApprove = role === ROLES.MANAGER || role === ROLES.ADMIN;
  const canChangeStatus = role === ROLES.ADMIN;
  const canAssign = role === ROLES.ADMIN;
  const needsManagerApproval = ['permission', 'hardware'].includes(ticket.category) && !ticket.managerApproval;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-title">
              <div className="modal-header-icon">{catInfo?.icon || <i className="fa-solid fa-clipboard-list"></i>}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ticket-id" style={{ fontSize: 14 }}>{ticket.id}</span>
                  <span className={`status-tag ${statusInfo.cls}`}>{statusInfo.label}</span>
                  <span className={`badge ${urgInfo.cls}`}>
                    <span className={`priority-dot ${urgInfo.dot}`}></span>
                    {urgInfo.label}
                  </span>
                </div>
                <h2 className="modal-title" id="detail-modal-title" style={{ fontSize: 16, marginTop: 4 }}>
                  {ticket.subject}
                </h2>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="ปิด"><i className="fa-solid fa-xmark"></i></button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border-light)',
          padding: '0 28px', gap: 0, flexShrink: 0
        }}>
          {[
            { id: 'info', label: 'ข้อมูล' },
            { id: 'timeline', label: 'ประวัติ' },
            ...(canApprove || canChangeStatus || canAssign ? [{ id: 'actions', label: 'ดำเนินการ' }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'var(--transition)',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div>
              <div className="detail-section">
                <div className="detail-section-title">ข้อมูล Ticket</div>
                <div className="detail-row">
                  <span className="detail-key">หมวดหมู่</span>
                  <span className="detail-val">
                    <span className={`badge badge-${ticket.category}`}>
                      {catInfo?.icon} {catInfo?.label}
                    </span>
                    {ticket.subCategory && (
                      <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        › {ticket.subCategory}
                      </span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">ผู้แจ้ง</span>
                  <span className="detail-val">{ticket.createdBy}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">แผนก</span>
                  <span className="detail-val">{ticket.department}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">ผู้รับผิดชอบ</span>
                  <span className="detail-val">{ticket.assignedTo}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">สร้างเมื่อ</span>
                  <span className="detail-val">{ticket.createdAt}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">อัปเดตล่าสุด</span>
                  <span className="detail-val">{ticket.updatedAt}</span>
                </div>
                {ticket.managerApproval && (
                  <div className="detail-row">
                    <span className="detail-key">อนุมัติหัวหน้า</span>
                    <span className="detail-val">
                      <span className={`badge ${ticket.managerApproval === 'approved' ? 'badge-resolved' : 'badge-rejected'}`}>
                        {ticket.managerApproval === 'approved' ? <><i className="fa-solid fa-check" style={{ marginRight: 4 }} aria-hidden="true"></i> อนุมัติแล้ว</> : <><i className="fa-solid fa-xmark" style={{ marginRight: 4 }} aria-hidden="true"></i> ปฏิเสธแล้ว</>}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="divider" />

              <div className="detail-section">
                <div className="detail-section-title">รายละเอียดปัญหา</div>
                <div className="detail-description">{ticket.description}</div>
              </div>

              {/* SLA Panel */}
              <div className="divider" />
              <div className="detail-section">
                <div className="detail-section-title"><i className="fa-solid fa-clock" style={{ marginRight: 6 }} aria-hidden="true"></i> SLA / เวลาการแก้ไข</div>
                <SLADetail ticket={ticket} />
              </div>

              {ticket.adminNote && (
                <>
                  <div className="divider" />
                  <div className="detail-section">
                    <div className="detail-section-title">หมายเหตุจากเจ้าหน้าที่</div>
                    <div className="detail-description" style={{ borderColor: 'var(--success)', background: 'var(--success-pale)' }}>
                      {ticket.adminNote}
                    </div>
                  </div>
                </>
              )}

              {ticket.image && (
                <>
                  <div className="divider" />
                  <div className="detail-section">
                    <div className="detail-section-title">ภาพแนบ</div>
                    <img src={ticket.image} alt="ภาพแนบ" className="detail-image" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0', border: 'none' }}>
              {ticket.timeline.map((t, i) => {
                const isSystem = t.actor === 'System' || !t.actor;
                
                if (isSystem) {
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                      <div style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: 11, padding: '4px 12px', borderRadius: 20 }}>
                        <i className={`fa-solid fa-${t.icon || 'robot'}`} style={{ marginRight: 6 }}></i>
                        {t.event} · {t.time}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-pale)', color: 'var(--primary)', flexShrink: 0 }}>
                      <i className={`fa-solid fa-${t.icon || 'user'}`} style={{ fontSize: 14 }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{t.actor}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.time}</span>
                      </div>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                        {t.event}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIONS TAB */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Manager/Admin Approval */}
              {canApprove && needsManagerApproval && ticket.status !== 'rejected' && (
                <div className="approval-actions">
                  <div style={{ flex: 1 }}>
                    <div className="approval-title">
                      {role === ROLES.ADMIN ? <><i className="fa-solid fa-key" style={{ marginRight: 6 }} aria-hidden="true"></i>อนุมัติระดับผู้ดูแลระบบ</> : <><i className="fa-solid fa-check-double" style={{ marginRight: 6 }} aria-hidden="true"></i>อนุมัติระดับหัวหน้าแผนก</>}
                    </div>
                    <div className="approval-subtitle">
                      Ticket นี้ต้องการการอนุมัติก่อนดำเนินการ
                    </div>
                    <div className="form-group" style={{ marginTop: 10 }}>
                      <label className="form-label">หมายเหตุ (ไม่บังคับ)</label>
                      <input
                        className="form-input"
                        placeholder="ระบุเหตุผลหรือหมายเหตุ..."
                        value={approvalNote}
                        onChange={e => setApprovalNote(e.target.value)}
                        id="approval-note-input"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        className="btn btn-success btn-sm"
                        id="btn-approve"
                        onClick={() => {
                          approveTicket(ticket.id, true, roleInfo.name, approvalNote);
                          onClose();
                        }}
                      >
                        <i className="fa-solid fa-check" style={{ marginRight: 4 }} aria-hidden="true"></i> อนุมัติ
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        id="btn-reject"
                        onClick={() => {
                          approveTicket(ticket.id, false, roleInfo.name, approvalNote);
                          onClose();
                        }}
                      >
                        <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} aria-hidden="true"></i> ปฏิเสธ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin: Change Status */}
              {canChangeStatus && (
                <div className="approval-actions" style={{ flexDirection: 'column', gap: 12 }}>
                  <div className="approval-title"><i className="fa-solid fa-gear" style={{ marginRight: 6 }} aria-hidden="true"></i> เปลี่ยนสถานะ (Admin)</div>
                  <div className="form-group">
                    <label className="form-label">หมายเหตุการดำเนินการ</label>
                    <input
                      className="form-input"
                      placeholder="บันทึกการดำเนินการ..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      id="status-note-input"
                    />
                  </div>
                  <div className="action-btns">
                    {ticket.status !== 'in-progress' && (
                      <button
                        className="btn btn-warning btn-sm"
                        id="btn-status-inprogress"
                        onClick={() => { updateTicketStatus(ticket.id, 'in-progress', note, roleInfo.name); onClose(); }}
                      >
                        <i className="fa-solid fa-wrench" style={{ marginRight: 4 }} aria-hidden="true"></i> รับงาน
                      </button>
                    )}
                    {ticket.status !== 'resolved' && (
                      <button
                        className="btn btn-success btn-sm"
                        id="btn-status-resolved"
                        onClick={() => { updateTicketStatus(ticket.id, 'resolved', note, roleInfo.name); onClose(); }}
                      >
                        <i className="fa-solid fa-check" style={{ marginRight: 4 }} aria-hidden="true"></i> แก้ไขสำเร็จ
                      </button>
                    )}
                    {ticket.status !== 'closed' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        id="btn-status-closed"
                        onClick={() => { updateTicketStatus(ticket.id, 'closed', note, roleInfo.name); onClose(); }}
                      >
                        <i className="fa-solid fa-lock" style={{ marginRight: 4 }} aria-hidden="true"></i> ปิด Ticket
                      </button>
                    )}
                    {ticket.status !== 'rejected' && (
                      <button
                        className="btn btn-danger btn-sm"
                        id="btn-status-reject"
                        onClick={() => { updateTicketStatus(ticket.id, 'rejected', note, roleInfo.name); onClose(); }}
                      >
                        <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} aria-hidden="true"></i> ปฏิเสธ
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Admin: Assign */}
              {canAssign && (
                <div className="approval-actions" style={{ flexDirection: 'column', gap: 12 }}>
                  <div className="approval-title"><i className="fa-solid fa-user-plus" style={{ marginRight: 6 }} aria-hidden="true"></i> มอบหมายงาน (Admin)</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">มอบหมายให้ทีม</label>
                      <select
                        className="form-select"
                        value={assignee}
                        onChange={e => setAssignee(e.target.value)}
                        id="assign-select"
                      >
                        {TEAM_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      id="btn-assign"
                      onClick={() => { assignTicket(ticket.id, assignee); onClose(); }}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              )}

              {/* Employee or no action */}
              {role === ROLES.EMPLOYEE && (
                <div className="no-access" style={{ minHeight: 200 }}>
                  <div className="no-access-icon"><i className="fa-solid fa-lock"  aria-hidden="true"></i></div>
                  <div className="no-access-title">ไม่มีสิทธิ์ดำเนินการ</div>
                  <div className="no-access-desc">
                    การดำเนินการและอนุมัติ Ticket สงวนไว้สำหรับหัวหน้าแผนกและผู้ดูแลระบบเท่านั้น
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}
