import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ROLES, ROLE_INFO } from '../data/mockData';
import * as api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [tickets, setTickets] = useState([]);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [depts, setDepts] = useState([]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // Load all data from API
  const loadData = useCallback(async () => {
    try {
      const tks = await api.fetchTickets();
      setTickets(tks);
      
      const notifs = await api.fetchNotifications();
      setNotifications(notifs);
      
      const departmentsData = await api.getDepartments();
      setDepts(departmentsData.map(d => d.name));
    } catch (err) {
      console.error("Error loading backend data:", err);
    }
  }, []);

  // Initialize session and load data
  useEffect(() => {
    async function initSession() {
      try {
        const me = await api.getMe();
        const roleMap = {
          USER: ROLES.EMPLOYEE,
          MANAGER: ROLES.MANAGER,
          ADMIN: ROLES.ADMIN,
        };
        setRole(roleMap[me.role] || ROLES.EMPLOYEE);
        await loadData();
      } catch (err) {
        // No session exists, auto-login as employee for seamless demo flow
        try {
          await api.login('employee@tickethub.com', 'password123');
          setRole(ROLES.EMPLOYEE);
          await loadData();
        } catch (loginErr) {
          console.error("Auto login failed:", loginErr);
        }
      }
    }
    initSession();
  }, [loadData]);

  // Switch role and log in automatically
  const switchRole = useCallback(async (newRole) => {
    const emailMap = {
      employee: 'employee@tickethub.com',
      manager: 'manager@tickethub.com',
      admin: 'admin@tickethub.com',
    };
    const email = emailMap[newRole];
    if (!email) return;

    try {
      await api.login(email, 'password123');
      setRole(newRole);
      await loadData();
      addToast(`สลับบทบาทเป็น ${ROLE_INFO[newRole].label} สำเร็จ!`, 'success');
    } catch (err) {
      addToast(`สลับบทบาทล้มเหลว: ${err.message}`, 'error');
    }
  }, [loadData, addToast]);

  const markNotifAsRead = useCallback(async (id) => {
    try {
      await api.markNotificationAsRead(id);
      await loadData();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, [loadData]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await api.markNotificationAsRead(null);
      await loadData();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  }, [loadData]);

  const createTicket = useCallback(async (data, file) => {
    try {
      const newTicket = await api.createTicket(data, file);
      addToast(`สร้าง Ticket ${newTicket.id} สำเร็จ!`, 'success');
      await loadData();
      return newTicket;
    } catch (err) {
      addToast(`สร้าง Ticket ล้มเหลว: ${err.message}`, 'error');
      throw err;
    }
  }, [addToast, loadData]);

  const updateTicketStatus = useCallback(async (id, status, note = '') => {
    try {
      await api.updateTicketStatus(id, status, note);
      addToast('อัปเดตสถานะ Ticket เรียบร้อย', 'success');
      await loadData();
    } catch (err) {
      addToast(`อัปเดตสถานะล้มเหลว: ${err.message}`, 'error');
    }
  }, [addToast, loadData]);

  const approveTicket = useCallback(async (id, approved, actor = '', note = '') => {
    try {
      await api.approveTicket(id, approved, note);
      addToast(approved ? 'อนุมัติ Ticket เรียบร้อย' : 'ปฏิเสธ Ticket แล้ว', approved ? 'success' : 'error');
      await loadData();
    } catch (err) {
      addToast(`ดำเนินการล้มเหลว: ${err.message}`, 'error');
    }
  }, [addToast, loadData]);

  const assignTicket = useCallback(async (id, assigneeId) => {
    try {
      await api.assignTicket(id, assigneeId);
      addToast(`มอบหมาย Ticket สำเร็จ!`, 'success');
      await loadData();
    } catch (err) {
      addToast(`มอบหมายล้มเหลว: ${err.message}`, 'error');
    }
  }, [addToast, loadData]);

  return (
    <AppContext.Provider value={{
      role, setRole: switchRole,
      tickets, setTickets,
      activeNav, setActiveNav,
      toasts,
      notifications,
      depts,
      markNotifAsRead,
      clearAllNotifications,
      createTicket,
      updateTicketStatus,
      approveTicket,
      assignTicket,
      addToast,
      removeToast,
      reloadTickets: loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
