import { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_TICKETS, generateId, ROLES } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      ticketId: 'TK-2567-001',
      title: 'อัปเดตสถานะงานซ่อม',
      message: 'สายพานลำเลียง Line 3 เปลี่ยนสถานะเป็น: กำลังดำเนินการ',
      time: '10 นาทีที่แล้ว',
      read: false,
      type: 'info',
    },
    {
      id: 2,
      ticketId: 'TK-2567-004',
      title: 'การอนุมัติงานซ่อม',
      message: 'เครื่องปั๊มโลหะ (Press) ได้รับอนุมัติการดำเนินงานแล้ว',
      time: '1 ชั่วโมงที่แล้ว',
      read: false,
      type: 'success',
    },
    {
      id: 3,
      ticketId: 'TK-2567-008',
      title: 'แก้ไขปัญหาเสร็จสิ้น',
      message: 'ขอเพิ่มสิทธิ์เข้าใช้งานโฟลเดอร์ฝ่ายบุคคล ได้รับการแก้ไขแล้ว',
      time: '3 ชั่วโมงที่แล้ว',
      read: true,
      type: 'success',
    },
    {
      id: 4,
      ticketId: 'TK-2567-002',
      title: 'คำขออนุมัติจัดซื้อชิ้นส่วน',
      message: 'เครื่องสแกนบาร์โค้ด Station 5 ได้รับการอนุมัติใบสั่งซื้ออะไหล่ใหม่แล้ว',
      time: '4 ชั่วโมงที่แล้ว',
      read: false,
      type: 'success',
    },
    {
      id: 5,
      ticketId: 'TK-2567-007',
      title: 'แจ้งเตือนเวลา SLA ค้างคา',
      message: 'ระบบตรวจพบคิวงานเครื่องแอร์ห้อง Server มีความเสี่ยงใกล้เกินเวลากำหนด (SLA At-Risk)',
      time: '5 ชั่วโมงที่แล้ว',
      read: false,
      type: 'warning',
    },
    {
      id: 6,
      ticketId: 'TK-2567-010',
      title: 'มอบหมายช่างเข้างาน',
      message: 'โปรแกรม ERP เข้าไม่ได้ ได้รับการมอบหมายงานให้: ทีม Software',
      time: '1 วันที่แล้ว',
      read: true,
      type: 'info',
    },
    {
      id: 7,
      ticketId: 'TK-2567-011',
      title: 'ปฏิเสธงานแจ้งซ่อม',
      message: 'ท่อน้ำรั่วห้องน้ำชาย ชั้น 2 ถูกระงับชั่วคราวเนื่องจากอยู่ระหว่างปรับปรุงอาคารใหญ่',
      time: '1 วันที่แล้ว',
      read: true,
      type: 'error',
    },
    {
      id: 8,
      ticketId: 'TK-2567-014',
      title: 'งานซ่อมเสร็จสมบูรณ์',
      message: 'ลูกปืนแตกมอเตอร์สายพาน 3 ได้รับการเปลี่ยนอะไหล่และปิดงานซ่อมเรียบร้อย',
      time: '2 วันที่แล้ว',
      read: true,
      type: 'success',
    },
    {
      id: 9,
      ticketId: 'TK-2567-015',
      title: 'ช่างรับงานระบบ',
      message: 'Wi-Fi โรงอาหาร ได้รับการลงคิวตรวจโดย ทีม Support',
      time: '3 วันที่แล้ว',
      read: true,
      type: 'info',
    },
    {
      id: 10,
      ticketId: 'TK-2567-020',
      title: 'แจ้งเตือนเครื่องจักร Line Stop',
      message: 'เครื่องควบคุมไฮดรอลิกเสียหายฉับพลัน เกิดสภาวะหยุดสายการผลิตชั่วคราว',
      time: '4 วันที่แล้ว',
      read: true,
      type: 'error',
    },
  ]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const addNotification = useCallback((ticketId, title, message, type = 'info') => {
    const id = Date.now();
    const newNotif = {
      id,
      ticketId,
      title,
      message,
      time: 'เมื่อสักครู่',
      read: false,
      type,
    };
    setNotifications(n => [newNotif, ...n]);
  }, []);

  const markNotifAsRead = useCallback((id) => {
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const createTicket = useCallback((data) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const newTicket = {
      id: generateId(),
      ...data,
      status: 'new',
      assignedTo: 'รอมอบหมาย',
      createdAt: dateStr,
      updatedAt: dateStr,
      timeline: [
        { event: 'สร้าง Ticket', actor: data.createdBy, time: dateStr, icon: 'pen-to-square' },
      ],
      managerApproval: null,
      adminNote: '',
    };
    setTickets(t => [newTicket, ...t]);
    addToast(`สร้าง Ticket ${newTicket.id} สำเร็จ!`, 'success');
    addNotification(newTicket.id, 'สร้าง Ticket ใหม่', `Ticket ${newTicket.id}: ${newTicket.subject} ถูกสร้างเรียบร้อยแล้ว`, 'info');
    return newTicket;
  }, [addToast, addNotification]);

  const updateTicketStatus = useCallback((id, status, note = '', actor = '') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const eventMap = {
      'in-progress': 'รับเรื่อง / เริ่มดำเนินการ',
      'resolved': 'แก้ไขสำเร็จ',
      'closed': 'ปิด Ticket',
      'open': 'เปิด Ticket ใหม่อีกครั้ง',
      'rejected': 'ปฏิเสธ Ticket',
    };
    const notifTypeMap = {
      'in-progress': 'info',
      'resolved': 'success',
      'closed': 'success',
      'open': 'info',
      'rejected': 'error',
    };
    setTickets(t => t.map(tk => {
      if (tk.id !== id) return tk;
      const eventLabel = (note ? `${eventMap[status] || status} — ${note}` : eventMap[status] || status);
      return {
        ...tk,
        status,
        updatedAt: dateStr,
        adminNote: note || tk.adminNote,
        timeline: [
          ...tk.timeline,
          { event: eventLabel, actor: actor || 'ระบบ', time: dateStr, icon: status === 'resolved' || status === 'closed' ? 'check' : status === 'rejected' ? 'xmark' : 'rotate' },
        ],
      };
    }));
    addToast('อัปเดตสถานะ Ticket เรียบร้อย', 'success');
    addNotification(id, 'อัปเดตสถานะ Ticket', `Ticket ${id} เปลี่ยนสถานะเป็น: ${eventMap[status] || status}`, notifTypeMap[status] || 'info');
  }, [addToast, addNotification]);

  const approveTicket = useCallback((id, approved, actor = '', note = '') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    setTickets(t => t.map(tk => {
      if (tk.id !== id) return tk;
      const eventLabel = approved
        ? `อนุมัติโดย ${actor}${note ? ` — ${note}` : ''}`
        : `ปฏิเสธโดย ${actor}${note ? ` — ${note}` : ''}`;
      return {
        ...tk,
        managerApproval: approved ? 'approved' : 'rejected',
        status: approved ? (tk.status === 'new' || tk.status === 'pending' ? 'open' : tk.status) : 'rejected',
        updatedAt: dateStr,
        timeline: [
          ...tk.timeline,
          { event: eventLabel, actor, time: dateStr, icon: approved ? 'check' : 'xmark' },
        ],
      };
    }));
    addToast(approved ? 'อนุมัติ Ticket เรียบร้อย' : 'ปฏิเสธ Ticket แล้ว', approved ? 'success' : 'error');
    addNotification(id, 'การพิจารณาอนุมัติ', `Ticket ${id} ได้รับการ${approved ? 'อนุมัติ' : 'ปฏิเสธ'}การดำเนินงานโดยหัวหน้างาน`, approved ? 'success' : 'error');
  }, [addToast, addNotification]);

  const assignTicket = useCallback((id, assignee) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    setTickets(t => t.map(tk => {
      if (tk.id !== id) return tk;
      return {
        ...tk,
        assignedTo: assignee,
        updatedAt: dateStr,
        timeline: [
          ...tk.timeline,
          { event: `มอบหมายให้ ${assignee}`, actor: 'ผู้ดูแลระบบ', time: dateStr, icon: 'user' },
        ],
      };
    }));
    addToast(`มอบหมาย Ticket ให้ ${assignee} เรียบร้อย`, 'success');
    addNotification(id, 'มอบหมายงานช่าง', `Ticket ${id} ได้รับการมอบหมายงานให้ทีม: ${assignee}`, 'info');
  }, [addToast, addNotification]);

  return (
    <AppContext.Provider value={{
      role, setRole,
      tickets, setTickets,
      activeNav, setActiveNav,
      toasts,
      notifications,
      markNotifAsRead,
      clearAllNotifications,
      createTicket,
      updateTicketStatus,
      approveTicket,
      assignTicket,
      addToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
