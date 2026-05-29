import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';

export default function MyTicketsView({ filterOverride, titleOverride, defaultTab }) {
  const { tickets, role, currentUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [deptTab, setDeptTab] = useState(defaultTab || 'my-created');

  // ── หาชื่อแผนกของ user ปัจจุบัน ──
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

  // 2) งานในการดูแลของฉัน = ticket ที่ฉันถูก assign (จับด้วย name หรือ agentId)
  const myAssignedTickets = baseTickets.filter(t =>
    (currentUser?.name && t.assignedTo === currentUser.name) ||
    (currentUser?.id   && (t.agentId === currentUser.id || t.assignedToId === currentUser.id))
  );

  // 3) Ticket ที่แผนกเราส่งออก (sourceDept = ourDept)
  //    ADMIN เห็นทุก ticket (ไม่มีแผนกเฉพาะ)
  const outboundTickets = isAdmin
    ? baseTickets
    : ourDept
      ? baseTickets.filter(t => t.department === ourDept)
      : [];

  // 4) Ticket ทั้งหมดของแผนก (targetDept = ourDept)
  //    ADMIN เห็นทุก ticket
  const inboundTickets = isAdmin
    ? baseTickets
    : ourDept
      ? baseTickets.filter(t => t.targetDepartment === ourDept)
      : [];

  const displayTickets =
    deptTab === 'my-created'  ? myCreatedTickets  :
    deptTab === 'my-assigned' ? myAssignedTickets :
    deptTab === 'outbound'    ? outboundTickets   :
    inboundTickets;

  const getHeaderTitle = () => {
    if (titleOverride) return titleOverride;
    if (deptTab === 'my-created')  return 'Ticket ของฉัน';
    if (deptTab === 'my-assigned') return 'งานในการดูแลของฉัน';
    if (deptTab === 'outbound')    return ourDept ? `Ticket ที่ ${ourDept} ส่งไป` : 'Ticket ที่แผนกเราส่งไป';
    return ourDept ? `Ticket ทั้งหมดของ ${ourDept}` : 'Ticket ทั้งหมดของแผนก';
  };

  // Stats calculation
  const totalCount = displayTickets.length;
  const newOrPendingCount = displayTickets.filter(t => t.status === 'pending' || t.status === 'new' || t.status === 'wait-approve').length;
  const inProgressCount = displayTickets.filter(t => t.status === 'progress' || t.status === 'in-progress' || t.status === 'wait-parts').length;
  const resolvedCount = displayTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>


      {/* 4 Stats Cards — Dashboard style */}
      <div className="dashboard-summary-grid">

        {/* Card 1: ทั้งหมด */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid rgba(37,99,235,0.15)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: 120
        }}>
          <div style={{ position:'absolute', right:'-20px', top:'-20px', width:80, height:80, borderRadius:'50%', background:'rgba(37,99,235,0.08)', filter:'blur(20px)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>TICKET ทั้งหมด</span>
            <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'rgba(37,99,235,0.1)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              <i className="fa-solid fa-ticket" />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{totalCount}</div>
        </div>

        {/* Card 2: เคสใหม่ / รอดำเนินการ */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(56,189,248,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid rgba(56,189,248,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: 120
        }}>
          <div style={{ position:'absolute', right:'-20px', top:'-20px', width:80, height:80, borderRadius:'50%', background:'rgba(56,189,248,0.08)', filter:'blur(20px)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>เคสใหม่ / รอดำเนินการ</span>
            <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'rgba(56,189,248,0.1)', color:'#0284c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              <i className="fa-solid fa-square-plus" />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{newOrPendingCount}</div>
        </div>

        {/* Card 3: กำลังดำเนินการ */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: 120
        }}>
          <div style={{ position:'absolute', right:'-20px', top:'-20px', width:80, height:80, borderRadius:'50%', background:'rgba(245,158,11,0.08)', filter:'blur(20px)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>กำลังดำเนินการ</span>
            <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'rgba(245,158,11,0.1)', color:'#d97706', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              <i className="fa-solid fa-screwdriver-wrench" />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', lineHeight:1.1 }}>{inProgressCount}</div>
        </div>

        {/* Card 4: แก้ไขเสร็จสิ้น */}
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.03) 100%)',
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid rgba(34,197,94,0.25)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'var(--transition)', minHeight: 120
        }}>
          <div style={{ position:'absolute', right:'-20px', top:'-20px', width:80, height:80, borderRadius:'50%', background:'rgba(34,197,94,0.08)', filter:'blur(20px)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span className="kpi-label" style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:700 }}>แก้ไขเสร็จสิ้น</span>
            <div className="kpi-icon-box" style={{ width:38, height:38, borderRadius:10, background:'rgba(34,197,94,0.1)', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
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
      />

      {showForm && <TicketFormModal onClose={() => setShowForm(false)} />}

      <style>{`
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>
    </div>
  );
}
