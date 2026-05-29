import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, ROLES, ROLE_INFO, STATUS_LABEL } from '../data/mockData';
import { SLADetail } from './SLAComponents';
import * as api from '../utils/api';

const URGENCY_INFO = {
  low: { label: 'ต่ำ', cls: 'badge-low', color: '#059669', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: 'circle-check' },
  medium: { label: 'ปานกลาง', cls: 'badge-medium', color: '#b45309', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: 'circle-minus' },
  high: { label: 'สูง', cls: 'badge-high', color: '#dc2626', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: 'circle-exclamation' },
  critical: { label: 'วิกฤต', cls: 'badge-critical', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', icon: 'triangle-exclamation' },
};

export default function TicketDetailModal({ ticket, onClose }) {
  const { 
    role, 
    updateTicketStatus, 
    approveTicket, 
    assignTicket, 
    currentUser, 
    reloadTickets,
    addToast
  } = useApp();

  const [detailTicket, setDetailTicket] = useState(ticket);
  const [activeTab, setActiveTab] = useState('info');
  const [viewImage, setViewImage] = useState(null);
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [postingComment, setPostingComment] = useState(false);
  
  // Filter for Timeline
  const [showUpdatesOnly, setShowUpdatesOnly] = useState(false);
  
  // Transfer / Forward States
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferDeptId, setTransferDeptId] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferring, setTransferring] = useState(false);
  
  // Department list for transfers
  const [deptsList, setDeptsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const chatContainerRef = useRef(null);

  // Load ticket details and users list on mount
  const loadData = async () => {
    try {
      const details = await api.getTicketDetail(ticket.id);
      setDetailTicket(details);
      
      const depts = await api.getDepartments();
      setDeptsList(depts);

      if (role === ROLES.ADMIN || role === ROLES.MANAGER) {
        const users = await api.fetchUsers();
        setUsersList(users.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER'));
      }
    } catch (err) {
      console.error("Error loading ticket detail:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [ticket.id, role]);

  // Scroll ONLY the chat container to bottom when comments update
  useEffect(() => {
    if (chatContainerRef.current) {
      const timer = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [detailTicket?.timeline]);

  const catInfo = CATEGORIES[detailTicket.category];
  const statusInfo = STATUS_LABEL[detailTicket.status] || { label: detailTicket.status, cls: 'status-pending', icon: 'circle' };
  const urgInfo = URGENCY_INFO[detailTicket.urgency] || URGENCY_INFO.medium;

  // Determine permissions
  const isAgent = 
    role === ROLES.ADMIN || 
    (currentUser && detailTicket.targetDepartment && currentUser.department?.name === detailTicket.targetDepartment) ||
    detailTicket.assignedTo === currentUser?.name;

  const isMyCase = detailTicket.assignedTo === currentUser?.name;
  const canControl = 
    role === ROLES.ADMIN || 
    isMyCase ||
    (role === ROLES.MANAGER && (
      !detailTicket.targetDepartment || 
      detailTicket.targetDepartment === 'ส่วนกลาง' ||
      (currentUser?.department && currentUser.department.name === detailTicket.targetDepartment)
    ));
  const canClaim = 
    role === ROLES.ADMIN || 
    (currentUser && (
      !detailTicket.targetDepartment || 
      detailTicket.targetDepartment === 'ส่วนกลาง' || 
      (currentUser.department && currentUser.department.name === detailTicket.targetDepartment)
    ));
  const canCancel = !['cancelled', 'resolved', 'closed'].includes(detailTicket.status);
  const canClose = !['closed', 'cancelled'].includes(detailTicket.status);
  const canTransfer = role === ROLES.ADMIN || isMyCase || (currentUser && detailTicket.createdBy === currentUser.name);

  const canApprove = role === ROLES.MANAGER || role === ROLES.ADMIN;
  const canChangeStatus = role === ROLES.ADMIN || isAgent;
  const canAssign = role === ROLES.ADMIN || (currentUser && detailTicket.targetDepartment && currentUser.department?.name === detailTicket.targetDepartment);
  const needsManagerApproval = ['permission', 'hardware'].includes(detailTicket.category) && !detailTicket.managerApproval;

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentFile) return;
    setPostingComment(true);
    try {
      await api.addComment(detailTicket.id, commentText, false, commentFile);
      setCommentText('');
      setCommentFile(null);
      await loadData();
      await reloadTickets();
      addToast('ส่งความคิดเห็นเรียบร้อย', 'success');
    } catch (err) {
      console.error("Failed to post comment:", err);
      addToast(`ส่งความคิดเห็นล้มเหลว: ${err.message}`, 'error');
    } finally {
      setPostingComment(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferDeptId) return;
    setTransferring(true);
    try {
      await api.transferTicket(detailTicket.id, transferDeptId, transferNote);
      setShowTransferForm(false);
      setTransferDeptId('');
      setTransferNote('');
      await loadData();
      await reloadTickets();
      addToast('โอนย้ายงานไปยังแผนกใหม่สำเร็จแล้ว', 'success');
    } catch (err) {
      console.error("Failed to transfer ticket:", err);
      addToast(`โอนย้ายงานล้มเหลว: ${err.message}`, 'error');
    } finally {
      setTransferring(false);
    }
  };

  // Helper for workflow steps
  const getStepStatus = (step) => {
    const s = detailTicket.status;
    if (step === 1) return 'completed'; // always done
    if (step === 2) {
      return (s !== 'pending' && s !== 'NEW') ? 'completed' : 'active';
    }
    if (step === 3) {
      return (s === 'resolved' || s === 'closed' || s === 'RESOLVED' || s === 'CLOSED') ? 'completed' : 'pending';
    }
    return 'pending';
  };

  const getCategoryPath = (t) => {
    const catMap = {
      mechanical: 'เครื่องจักร',
      electrical: 'ระบบไฟฟ้า',
      facility: 'ระบบอาคาร',
      it_support: 'ไอที/เครือข่าย'
    };
    const subMap = {
      computer_laptop: "คอมพิวเตอร์ / จอภาพ / ปริ้นเตอร์",
      monitor: "หน้าจอ / จอภาพ",
      printer_scanner: "ปริ้นเตอร์",
      accessory: "คีย์บอร์ด / เมาส์",
      hardware_other: "อุปกรณ์อื่นๆ",
      os_system: "OS (Windows / macOS)",
      office_apps: "Microsoft 365 / Outlook",
      internal_systems: "ERP / ระบบงานภายใน",
      install_update: "ติดตั้ง / อัปเดตโปรแกรม",
      software_other: "ซอฟต์แวร์อื่นๆ",
      wifi_issue: "ต่อ Wi-Fi ไม่ได้",
      lan_issue: "เน็ตสายแลนเสีย",
      vpn_remote: "VPN / เข้าถึงระยะไกล",
      slow_network: "เน็ตช้า / หลุดบ่อย",
      network_other: "ระบบเครือข่ายอื่นๆ",
      password_reset: "รีเซ็ตรหัสผ่าน / ปลดล็อกบัญชี",
      shared_folder: "ขอสิทธิ์โฟลเดอร์แชร์",
      license_request: "ขอสิทธิ์ใช้งานโปรแกรม / อีเมล",
      keycard_building: "บัตรพนักงาน / สิทธิ์เข้าออกอาคาร",
      access_other: "สิทธิ์เข้าใช้งานอื่นๆ",
      desk_chair: "ขอโต๊ะทำงาน / เก้าอี้",
      stationery: "อุปกรณ์สำนักงาน / เครื่องเขียน",
      intern_coord: "ประสานงานนักศึกษาฝึกงาน",
      consultation: "ขอคำปรึกษา / แนะนำทั่วไป",
      other_general: "บริการและคำขอทั่วไปอื่นๆ",
    };
    const catLabel = catMap[t.category] || t.category;
    const subLabel = subMap[t.subCategory] || t.subCategory;
    return subLabel ? `${catLabel} > ${subLabel}` : catLabel;
  };

  // Filtered timeline
  const filteredTimeline = detailTicket.timeline ? detailTicket.timeline.filter(item => {
    if (showUpdatesOnly) {
      return item.event.includes('ระบบ:') || item.event.includes('🔄');
    }
    return true;
  }) : [];

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-main)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowY: 'auto'
    }} className="full-screen-detail-view">
      
      {/* ── Main Body Container ── */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24, width: '100%', flex: 1 }}>
        
        {/* 1. Workflow Progress Steps */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' }}>
            {/* Step 1: Created */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--success)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
              }}>1</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>ยื่น Ticket แล้ว</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>รับเรื่องแล้ว</div>
              </div>
            </div>

            {/* Line 1-2 */}
            <div style={{
              height: 2.5, flex: 1, maxWidth: 120,
              background: getStepStatus(2) === 'completed' ? 'var(--success)' : 'var(--border-light)',
              minWidth: 40
            }} />

            {/* Step 2: Processing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: getStepStatus(2) === 'completed' ? 'var(--success)' : 'var(--bg-main)',
                color: getStepStatus(2) === 'completed' ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14,
                boxShadow: getStepStatus(2) === 'completed' ? '0 4px 10px rgba(16,185,129,0.2)' : 'none',
                border: getStepStatus(2) === 'completed' ? 'none' : '1.5px solid var(--border-light)'
              }}>2</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: getStepStatus(2) === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>กำลังดำเนินการ</div>
                <div style={{ fontSize: 11, color: getStepStatus(2) === 'completed' ? 'var(--text-muted)' : 'var(--text-muted)' }}>เจ้าหน้าที่กำลังแก้ไข</div>
              </div>
            </div>

            {/* Line 2-3 */}
            <div style={{
              height: 2.5, flex: 1, maxWidth: 120,
              background: getStepStatus(3) === 'completed' ? 'var(--success)' : 'var(--border-light)',
              minWidth: 40
            }} />

            {/* Step 3: Resolved */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: getStepStatus(3) === 'completed' ? 'var(--success)' : 'var(--bg-main)',
                color: getStepStatus(3) === 'completed' ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14,
                boxShadow: getStepStatus(3) === 'completed' ? '0 4px 10px rgba(16,185,129,0.2)' : 'none',
                border: getStepStatus(3) === 'completed' ? 'none' : '1.5px solid var(--border-light)'
              }}>3</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: getStepStatus(3) === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>แก้ไขเสร็จสิ้น</div>
                <div style={{ fontSize: 11, color: getStepStatus(3) === 'completed' ? 'var(--text-muted)' : 'var(--text-muted)' }}>ปัญหาได้รับการแก้ไข</div>
              </div>
            </div>
          </div>
          
          {/* Top Actions: Reload and Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--primary-bg)',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                color: 'var(--primary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.18s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-pale)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-bg)'}
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              <span>รีโหลดข้อมูล</span>
            </button>

            <button 
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-pale)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              title="ปิด"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* 2. Middle Section Grid: Info vs Chat */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 24,
          alignItems: 'stretch'
        }}>
          
          {/* Left Column: Ticket Info */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Row of Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {/* ID */}
              <span style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--border-light)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                #{detailTicket.id.substring(0, 8)}
              </span>
              
              {/* Category Path */}
              <span style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary-light)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <i className={`fa-solid fa-${catInfo?.icon || 'folder'}`} style={{ fontSize: 10 }}></i>
                {getCategoryPath(detailTicket)}
              </span>

              {/* Urgency */}
              <span style={{
                background: urgInfo.bg,
                border: `1.5px solid ${urgInfo.border}`,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                color: urgInfo.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: urgInfo.color }}></span>
                {urgInfo.label}
              </span>

              {/* Target Dept */}
              <span style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: 'rgb(99, 102, 241)'
              }}>
                ส่งถึง: {detailTicket.targetDepartment || 'ส่วนกลาง'}
              </span>

              {/* SLA */}
              <span style={{
                background: 'rgba(236,72,153,0.08)',
                border: '1px solid rgba(236,72,153,0.2)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: '#ec4899'
              }}>
                SLA: {detailTicket.urgency === 'critical' ? '1 ชม.' : detailTicket.urgency === 'high' ? '4 ชม.' : '24-72 ชม.'}
              </span>
            </div>

            {/* Subject */}
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              {detailTicket.subject}
            </h1>

            {/* Description Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                รายละเอียด
              </div>
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: 14,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6
              }}>
                {detailTicket.description}
              </div>
            </div>

            {/* Image Attachments */}
            {detailTicket.image && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa-solid fa-image"></i> รูปภาพหลักฐาน (คลิกเพื่อขยาย)
                </div>
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-light)', cursor: 'pointer', maxWidth: 'fit-content' }} onClick={() => setViewImage(detailTicket.image)}>
                  <img src={detailTicket.image} alt="หลักฐาน" style={{ display: 'block', maxHeight: 260, maxWidth: '100%', objectFit: 'contain' }} />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: 24, color: 'var(--primary)' }}></i>
                  </div>
                </div>
              </div>
            )}

            {/* SLA breakdown box */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <SLADetail ticket={detailTicket} />
            </div>

            {/* Left Card Footer / Requester Info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-light)',
              paddingTop: 16,
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12
                }}>
                  {detailTicket.createdBy ? detailTicket.createdBy.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    ผู้แจ้ง: {detailTicket.createdBy}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    แผนก: {detailTicket.department}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>ส่งเมื่อ: {detailTicket.createdAt}</span>
                {canCancel && (
                  <button 
                    onClick={async () => {
                      if (window.confirm('คุณต้องการยกเลิก Ticket นี้ใช่หรือไม่?')) {
                        await updateTicketStatus(detailTicket.id, 'cancelled');
                        await loadData();
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1.5px solid rgba(239, 68, 68, 0.25)',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-md)',
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                  >
                    ยกเลิก Ticket
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Chat & Timeline */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            height: 'calc(100vh - 280px)',
            minHeight: 520,
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-comments" style={{ color: 'var(--primary)' }}></i> ประวัติแชท & บันทึก
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={showUpdatesOnly} 
                  onChange={e => setShowUpdatesOnly(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                แสดงเฉพาะการอัปเดตข้อมูล
              </label>
            </div>

            {/* Message Area */}
            <div 
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                paddingRight: 6
              }}
            >
              {filteredTimeline.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <i className="fa-solid fa-message-slash" style={{ fontSize: 24, marginBottom: 8, display: 'block', opacity: 0.5 }}></i>
                  ไม่มีประวัติการพูดคุยหรือบันทึกข้อมูล
                </div>
              ) : (
                filteredTimeline.map((item, index) => {
                  const isSystem = item.event.includes('ระบบ:') || item.event.includes('🔄') || item.actor === 'System';
                  
                  if (isSystem) {
                    return (
                      <div key={index} style={{
                        background: 'var(--primary-bg)',
                        border: '1.5px solid var(--border-light)',
                        borderRadius: 12,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 12.5,
                        color: 'var(--primary)'
                      }}>
                        <i className="fa-solid fa-arrows-rotate" style={{ marginTop: 3, flexShrink: 0, color: 'var(--primary)' }}></i>
                        <div style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>
                          {item.event}
                          <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                            {item.time}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--primary-pale)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 11, flexShrink: 0, border: '1px solid var(--border-light)'
                      }}>
                        {item.actor ? item.actor.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{item.actor}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.time}</span>
                        </div>
                        <div style={{
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '0 12px 12px 12px',
                          padding: '10px 12px',
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          wordBreak: 'break-word',
                          lineHeight: 1.4
                        }}>
                          {item.event}
                          
                          {item.attachmentUrl && (
                            <div 
                              style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxWidth: 180, cursor: 'pointer', border: '1px solid var(--border-light)' }}
                              onClick={() => setViewImage(item.attachmentUrl)}
                            >
                              <img src={item.attachmentUrl} alt="แชทประกอบ" style={{ width: '100%', display: 'block' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form at Bottom */}
            {detailTicket.status !== 'cancelled' && detailTicket.status !== 'closed' && (
              <form onSubmit={handlePostComment} style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '4px 10px' }}>
                  
                  {/* File attach label */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  title="แนบรูปภาพ"
                  >
                    <i className="fa-solid fa-paperclip" style={{ fontSize: 12, color: 'var(--text-muted)' }}></i>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={e => setCommentFile(e.target.files[0])}
                    />
                  </label>

                  {/* Input message */}
                  <input
                    type="text"
                    placeholder="พิมพ์ข้อความตอบกลับ..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      padding: '8px 0'
                    }}
                  />

                  {/* Submit icon */}
                  <button 
                    type="submit" 
                    disabled={postingComment || (!commentText.trim() && !commentFile)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '50%',
                      background: (commentText.trim() || commentFile) ? 'var(--primary)' : 'var(--border)',
                      border: 'none',
                      color: '#fff',
                      cursor: (commentText.trim() || commentFile) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                  >
                    {postingComment ? (
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 11 }}></i>
                    ) : (
                      <i className="fa-solid fa-paper-plane" style={{ fontSize: 11 }}></i>
                    )}
                  </button>
                </div>
                {commentFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--success)', paddingLeft: 4 }}>
                    <i className="fa-solid fa-image"></i>
                    <span>แนบรูป: {commentFile.name} ({(commentFile.size / 1024).toFixed(1)} KB)</span>
                    <i className="fa-solid fa-xmark" style={{ color: 'var(--danger)', cursor: 'pointer', marginLeft: 4 }} onClick={() => setCommentFile(null)}></i>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* 3. Bottom Section: Staff Control Panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--success)', fontSize: 16 }}></i>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>แผงควบคุมเจ้าหน้าที่</h2>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20
          }}>
            
            {/* Left Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                จัดการสถานะ {!canControl ? `(เฝ้าดูอย่างเดียว — เคสนี้${detailTicket.assignedTo && detailTicket.assignedTo !== 'รอมอบหมาย' ? `เป็นของ${detailTicket.assignedTo}` : 'ยังไม่มีผู้รับผิดชอบ'})` : `(สำหรับคุณ — ${currentUser?.name})`}
              </span>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {((!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') && canClaim) ? (
                  <span style={{ fontSize: 13, color: 'var(--danger)', fontStyle: 'italic', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-circle-exclamation"></i> กรุณากดปุ่ม "รับผิดชอบงานนี้" ขวาก่อนเพื่อจัดการสถานะตั๋ว
                  </span>
                ) : (
                  <>
                    {[
                      { statusVal: 'progress', label: 'เริ่มดำเนินการ', icon: 'fa-play', color: '#2563eb', bg: 'rgba(37,99,235,0.06)' },
                      { statusVal: 'wait-approve', label: 'ขออนุมัติ', icon: 'fa-hourglass-half', color: '#6366f1', bg: 'rgba(99,102,241,0.06)' },
                      { statusVal: 'wait-parts', label: 'รออะไหล่', icon: 'fa-wrench', color: '#b45309', bg: 'rgba(245,158,11,0.06)' },
                      { statusVal: 'resolved', label: 'แก้ไขแล้ว', icon: 'fa-circle-check', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                    ].map((btn) => {
                      const isCurrent = detailTicket.status === btn.statusVal;
                      const isDisabled = !canControl || isCurrent || ['resolved', 'closed'].includes(detailTicket.status);

                      return (
                        <button
                          key={btn.statusVal}
                          onClick={() => updateTicketStatus(detailTicket.id, btn.statusVal)}
                          disabled={isDisabled}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: isCurrent ? btn.bg : 'transparent',
                            color: isCurrent ? btn.color : (isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)'),
                            border: isCurrent ? `1.5px solid ${btn.color}` : `1.5px solid ${isDisabled ? 'var(--border-light)' : 'var(--border-strong)'}`,
                            padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 800,
                            opacity: isCurrent ? 1 : (isDisabled ? 0.4 : 1),
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.18s'
                          }}
                          onMouseEnter={e => {
                            if (!isDisabled && !isCurrent) {
                              e.currentTarget.style.background = btn.bg;
                              e.currentTarget.style.color = btn.color;
                              e.currentTarget.style.borderColor = btn.color;
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isDisabled && !isCurrent) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.borderColor = 'var(--border-strong)';
                            }
                          }}
                        >
                          <i className={`fa-solid ${btn.icon}`}></i> {btn.label}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setShowTransferForm(true)}
                      disabled={!canTransfer || ['resolved', 'closed'].includes(detailTicket.status)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-light)',
                        color: (!canTransfer || ['resolved', 'closed'].includes(detailTicket.status)) ? 'var(--text-muted)' : 'var(--text-secondary)',
                        padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 800,
                        opacity: (!canTransfer || ['resolved', 'closed'].includes(detailTicket.status)) ? 0.4 : 1,
                        cursor: (!canTransfer || ['resolved', 'closed'].includes(detailTicket.status)) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <i className="fa-solid fa-circle-arrow-right"></i> ส่งต่อไปแผนกอื่น
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Agent Claim/Release */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: '1px solid var(--border-light)', paddingLeft: 20 }}>
              
              {/* Agent Profile display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  เจ้าหน้าที่ผู้รับผิดชอบ
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: (!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? 'var(--bg-main)' : 'var(--success)',
                    color: (!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? 'var(--text-muted)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 12, border: '1px solid var(--border-light)'
                  }}>
                    {(!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? (
                      <i className="fa-solid fa-hourglass-half" style={{ fontSize: 11 }}></i>
                    ) : (
                      detailTicket.assignedTo.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {detailTicket.assignedTo || 'รอมอบหมาย'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {(!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? 'รอเจ้าหน้าที่รับเคส' : 'เจ้าหน้าที่ผู้ดูแล'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim / Release button */}
              {(!detailTicket.assignedTo || detailTicket.assignedTo === 'รอมอบหมาย') ? (
                canClaim && (
                  <button
                    onClick={async () => {
                      if (!currentUser) return;
                      await assignTicket(detailTicket.id, currentUser.id);
                      await loadData();
                    }}
                    style={{
                      background: 'var(--primary)', border: 'none', color: '#fff',
                      borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 800,
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                  >
                    รับผิดชอบงานนี้
                  </button>
                )
              ) : (
                (detailTicket.assignedTo === currentUser?.name || role === ROLES.ADMIN) && (
                  <button
                    onClick={async () => {
                      await assignTicket(detailTicket.id, null);
                      await loadData();
                    }}
                    style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)',
                      borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                  >
                    ปล่อยผู้รับผิดชอบ
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {showTransferForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontFamily: "'Inter', system-ui, sans-serif"
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>ส่งต่อ Ticket ไปแผนกอื่น</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>เปลี่ยนความรับผิดชอบ Ticket เพื่อแก้ไขปัญหาอย่างถูกจุด</p>
              </div>
              <button
                onClick={() => {
                  setShowTransferForm(false);
                  setTransferDeptId('');
                  setTransferNote('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>

            {/* Target Department Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>เลือกแผนกเป้าหมาย</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <i className="fa-solid fa-building" style={{
                  position: 'absolute',
                  left: '16px',
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  pointerEvents: 'none'
                }}></i>
                <select
                  value={transferDeptId}
                  onChange={e => setTransferDeptId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px 12px 44px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <option value="" disabled>-- เลือกแผนกที่ต้องการส่งต่อ --</option>
                  {deptsList
                    .filter(d => d.name !== detailTicket.targetDepartment)
                    .map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <i className="fa-solid fa-chevron-down" style={{
                  position: 'absolute',
                  right: '16px',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}></i>
              </div>
            </div>

            {/* Note Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>เหตุผลในการส่งต่อ (บันทึกลงประวัติ)</label>
              <textarea
                value={transferNote}
                onChange={e => setTransferNote(e.target.value)}
                placeholder="ระบุเหตุผลในการส่งมอบงาน เพื่อให้แผนกปลายทางเข้าใจรายละเอียด..."
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.5',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowTransferForm(false);
                  setTransferDeptId('');
                  setTransferNote('');
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={transferring || !transferDeptId}
                style={{
                  flex: 1,
                  background: (!transferDeptId || transferring) ? 'rgba(37, 99, 235, 0.5)' : 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (!transferDeptId || transferring) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  if (transferDeptId && !transferring) {
                    e.currentTarget.style.background = 'var(--primary-light)';
                  }
                }}
                onMouseLeave={e => {
                  if (transferDeptId && !transferring) {
                    e.currentTarget.style.background = 'var(--primary)';
                  }
                }}
              >
                {transferring ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>กำลังส่งต่อ...</span>
                  </>
                ) : (
                  <span>ส่งต่อแผนก</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox zoom */}
      {viewImage && (
        <div 
          onClick={() => setViewImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={viewImage} 
            alt="ขยายใหญ่" 
            style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain', borderRadius: 8, boxShadow: 'var(--shadow-xl)' }} 
          />
          <button
            onClick={() => setViewImage(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', fontSize: 18, transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      
    </div>
  );
}
