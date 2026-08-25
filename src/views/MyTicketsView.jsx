import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';
import { motion, AnimatePresence } from 'framer-motion';
import ApprovalView from './ApprovalView';

export default function MyTicketsView({ filterOverride, titleOverride, defaultTab }) {
  const { tickets, role, currentUser, activeNav, reloadTickets } = useApp();
  console.log("MyTicketsView rendering, role:", role);
  const [showForm, setShowForm] = useState(false);
  const [deptTab, setDeptTab] = useState(() => {
    return window.tempTicketTab || defaultTab || 'my-created';
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (reloadTickets && !filterOverride) {
      reloadTickets(false, false);
    }
  }, [reloadTickets, filterOverride]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.tempTicketTab) {
      setDeptTab(window.tempTicketTab);
      const timer = setTimeout(() => {
        window.tempTicketTab = null;
      }, 100);
      return () => clearTimeout(timer);
    } else if (defaultTab) {
      setDeptTab(defaultTab);
    }
  }, [defaultTab]);

  const getTabOptions = () => {
    if (activeNav === 'track') {
      return [{ value: 'my-created', label: 'Ticket ของฉัน' }];
    }
    switch (role) {
      case ROLES.ADMIN:
        return [
          { value: 'my-assigned', label: 'งานในการดูแล' },
          { value: 'inbound', label: 'ทั้งหมดในระบบ' },
          { value: 'wait-approve', label: 'รออนุมัติ' },
        ];
      case ROLES.MANAGER:
        return [
          { value: 'my-assigned', label: 'งานในการดูแล' },
          { value: 'outbound', label: 'ส่งจากแผนกเรา' },
          { value: 'inbound', label: 'ทั้งหมดในแผนก' },
        ];
      case ROLES.EMPLOYEE:
      default:
        return [
          { value: 'my-assigned', label: 'งานในการดูแล' },
          { value: 'outbound', label: 'ส่งจากแผนกเรา' },
          { value: 'inbound', label: 'ทั้งหมดในแผนก' },
        ];
    }
  };

  // หาชื่อแผนกของ user ปัจจุบัน
  // backend อาจส่งมาเป็น: department.name | departmentName | department (string)
  const ourDept =
    currentUser?.department?.name ||
    currentUser?.departmentName ||
    (typeof currentUser?.department === 'string' ? currentUser.department : null) ||
    null;

  // Filter based on parent view if specified
  const baseTickets = filterOverride ?? tickets;

  // ADMIN เห็นทุก ticket (ไม่ filter แผนก)
  const isAdmin = role === ROLES.ADMIN;

  // 1) Ticket ของฉัน = ticket ที่ฉันสร้าง (จับด้วย userId หรือ name)
  const myCreatedTickets = baseTickets.filter(t =>
    (currentUser?.id   && (t.userId === currentUser.id || t.reporterId === currentUser.id)) ||
    (currentUser?.name && t.createdBy === currentUser.name)
  );

  // 2) งานในการดูแลของฉัน = ticket ที่ฉันถูก assign (จับด้วย name หรือ agentId หรือ receiverManager.id)
  const myAssignedTickets = baseTickets.filter(t =>
    (currentUser?.name && t.assignedTo === currentUser.name) ||
    (currentUser?.id   && (t.agentId === currentUser.id || t.assignedToId === currentUser.id || t.receiverManager?.id === currentUser.id))
  );

  // 3) Ticket ที่แผนกเราส่งออก (sourceDept = ourDept)
  // ADMIN เห็นทุก ticket (ไม่มีแผนกเฉพาะ)
  const outboundTickets = isAdmin
    ? baseTickets
    : ourDept
      ? baseTickets.filter(t => t.department === ourDept)
      : [];

  // 4) Ticket ทั้งหมดของแผนก (targetDept = ourDept)
  // ADMIN เห็นทุก ticket
  const inboundTickets = isAdmin
    ? baseTickets
    : ourDept
      ? baseTickets.filter(t => t.targetDepartment === ourDept)
      : [];

  // 5) Ticket รอการอนุมัติ
  const waitApproveTickets = baseTickets.filter(t => t.status === 'wait-approve');

  const displayTickets =
    deptTab === 'my-created'  ? myCreatedTickets  :
    deptTab === 'my-assigned' ? myAssignedTickets :
    deptTab === 'outbound'    ? outboundTickets   :
    deptTab === 'wait-approve'? waitApproveTickets:
    inboundTickets;

  const getHeaderTitle = () => {
    if (titleOverride && (!defaultTab || deptTab === defaultTab)) return titleOverride;
    if (deptTab === 'my-created')  return 'Ticket ของฉัน';
    if (deptTab === 'my-assigned') return 'งานในการดูแลของฉัน';
    if (deptTab === 'outbound')    return ourDept ? `Ticket ที่ ${ourDept} ส่งไป` : 'Ticket ที่แผนกเราส่งไป';
    if (deptTab === 'wait-approve') return 'Ticket รอการอนุมัติ';
    return ourDept ? `Ticket ทั้งหมดของ ${ourDept}` : 'Ticket ทั้งหมดของแผนก';
  };

  // Stats calculation
  const totalCount = displayTickets.length;
  const newOrPendingCount = displayTickets.filter(t => t.status === 'pending' || t.status === 'new' || t.status === 'wait-approve').length;
  const inProgressCount = displayTickets.filter(t => t.status === 'progress' || t.status === 'in-progress' || t.status === 'wait-parts').length;
  const resolvedCount = displayTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="view-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: isMobile ? '0px' : undefined }}>

      {/* Mobile Tab Switcher */}
      {getTabOptions().length > 1 && (
        <div className="mobile-only mobile-tabs-grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getTabOptions().length}, 1fr)`,
          background: 'rgba(15,23,42,0.03)',
          borderRadius: 'var(--radius-lg)',
          padding: '4px',
          border: '1px solid var(--border-light)',
          gap: '2px',
          margin: '0 12px 8px 12px',
        }}>
          {getTabOptions().map(tab => {
            const active = deptTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setDeptTab(tab.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: active ? 800 : 600,
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {deptTab === 'wait-approve' ? (
          <motion.div key="wait-approve" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ padding: isMobile ? '0 12px' : '0' }}>
            <ApprovalView isEmbedded={true} />
          </motion.div>
        ) : (
          <motion.div key={deptTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          {/* 4 Stats Cards — Dashboard style */}
          <div className="dashboard-summary-grid" style={{ marginBottom: 16, marginInline: isMobile ? 12 : 0 }}>

            {/* Card 1: ทั้งหมด */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.03) 100%)',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid #474d55ff',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'var(--transition)', minHeight: 120
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>TICKET ทั้งหมด</span>
                <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'#E2E8F0', color: '#676e78ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  <i className="fa-solid fa-ticket" />
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{totalCount}</div>
            </div>

            {/* Card 2: เคสใหม่ / รอดำเนินการ */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(56,189,248,0.03) 100%)',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid #3b82f6',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'var(--transition)', minHeight: 120
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>
                  {isMobile ? 'เคสใหม่' : 'เคสใหม่ / รอดำเนินการ'}
                </span>
                <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'#E0F2FE', color:'#0284c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  <i className="fa-solid fa-square-plus" />
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{newOrPendingCount}</div>
            </div>

            {/* Card 3: กำลังดำเนินการ */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.03) 100%)',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #f59e0b',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'var(--transition)', minHeight: 120
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>กำลังดำเนินการ</span>
                <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'#FEF3C7', color:'#d97706', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  <i className="fa-solid fa-screwdriver-wrench" />
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{inProgressCount}</div>
            </div>

            {/* Card 4: แก้ไขเสร็จสิ้น */}
            <div className="kpi-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.03) 100%)',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #10b981',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'var(--transition)', minHeight: 120
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>แก้ไขเสร็จสิ้น</span>
                <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'#D1FAE5', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  <i className="fa-solid fa-circle-check" />
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{resolvedCount}</div>
            </div>

          </div>

          {/* Table Card */}
          <TicketTable 
            tickets={displayTickets} 
            title={getHeaderTitle()} 
            showPersonalToggle={
              role === ROLES.MANAGER || role === ROLES.ADMIN
            }
          />
        </motion.div>
      )}
      </AnimatePresence>

      {showForm && <TicketFormModal onClose={() => setShowForm(false)} />}

      <style>{`
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md) !important;
        }
        @media (max-width: 768px) {
          div.mobile-only.mobile-tabs-grid {
            display: grid !important;
          }
        }
        @media (min-width: 769px) {
          div.mobile-only.mobile-tabs-grid {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
