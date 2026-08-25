import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ROLES, ROLE_INFO } from '../data/mockData';
import * as api from '../utils/api';
import { getToken, removeToken } from '../utils/api';
import { initSocket, disconnectSocket, parsePayload } from '../utils/socket';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole]             = useState(ROLES.EMPLOYEE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [useWs, setUseWs]           = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets]       = useState([]);
  const [toasts, setToasts]         = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeNav, setActiveNav]   = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname;
    if (path.startsWith('/tickets/')) {
      return sessionStorage.getItem('last_active_nav') || 'dashboard';
    }
    const nav = path.replace('/', '') || 'dashboard';
    const validNavs = [
      'dashboard', 'my-own-tickets', 'track', 'my-sent-tickets',
      'all-dept-tickets', 'dept-tickets', 'all-tickets',
      'escalated', 'approval', 'approved-history', 'sla', 'profile',
      'reports', 'settings', 'team', 'faq'
    ];
    return validNavs.includes(nav) ? nav : 'dashboard';
  });
  const [activeTicketId, setActiveTicketId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/tickets/')) {
      return path.split('/').pop() || null;
    }
    return null;
  });

  // Keep ref of notifications to avoid stale closure in WebSocket listener
  const notificationsRef = useRef([]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  const [depts, setDepts]           = useState([]);
  const [managers, setManagers]     = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [globalConfirm, setGlobalConfirm] = useState(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const updateTheme = () => {
      if (!currentUser) {
        root.classList.remove('dark');
        return;
      }
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };
    updateTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme, currentUser]);

  const showConfirm = useCallback(({ title, message, showInput = false, inputPlaceholder = '', requiredInput = false }) => {
    return new Promise((resolve) => {
      setGlobalConfirm({
        title,
        message,
        showInput,
        inputPlaceholder,
        requiredInput,
        onConfirm: (val) => {
          setGlobalConfirm(null);
          resolve(showInput ? val : true);
        },
        onCancel: () => {
          setGlobalConfirm(null);
          resolve(showInput ? null : false);
        }
      });
    });
  }, []);

  const addToast = useCallback((msg, type = 'success', title = null) => {
    const id = Date.now();
    if (typeof msg === 'object' && msg !== null && !msg.$$typeof) {
      // If passed as an object { message, title, type }
      setToasts(t => [...t, { id, msg: msg.message || msg.msg, type: msg.type || type, title: msg.title || title }]);
    } else {
      setToasts(t => [...t, { id, msg, type, title }]);
    }
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const isFetchingRef = useRef(false);
  const lastFetchRef  = useRef(0); // Timestamp of last successful fetch

  // Minimum time (ms) that must pass before a background refetch is allowed.
  // Action-triggered reloads (createTicket, etc.) bypass this guard via forceRefetch.
  const MIN_REFETCH_MS = 10_000; // 10 seconds cache validity

  const loadData = useCallback(async (fetchDepts = false, forceRefetch = false) => {
    if (isFetchingRef.current) return; // Already in-flight – skip
    const now = Date.now();
    if (!forceRefetch && (now - lastFetchRef.current) < MIN_REFETCH_MS) return; // Too soon

    isFetchingRef.current = true;
    
    // Set individual and global loading states
    setTicketsLoading(true);
    setNotificationsLoading(true);
    if (fetchDepts) {
      setDepartmentsLoading(true);
    }
    setDataLoading(true);

    // Fetch tickets asynchronously and update state immediately
    const ticketsPromise = api.fetchTickets()
      .then(tks => {
        setTickets(tks);
        sessionStorage.setItem('cached_tickets', JSON.stringify(tks));
      })
      .catch(err => console.error('Error fetching tickets:', err))
      .finally(() => setTicketsLoading(false));

    // Fetch notifications asynchronously and update state immediately
    const notificationsPromise = api.fetchNotifications()
      .then(notifs => {
        setNotifications(notifs);
        sessionStorage.setItem('cached_notifications', JSON.stringify(notifs));
      })
      .catch(err => console.error('Error fetching notifications:', err))
      .finally(() => setNotificationsLoading(false));

    // Fetch departments asynchronously and update state immediately
    let departmentsPromise = Promise.resolve();
    if (fetchDepts) {
      departmentsPromise = (async () => {
        let departmentsData = [];
        let managersData = [];
        try {
          departmentsData = await api.getDepartments();
        } catch (err) {
          console.error('Error fetching departments:', err);
        }

        try {
          managersData = await api.getManagers();
        } catch (err) {
          console.warn('Error fetching managers (likely unauthorized for this role):', err);
        }

        const deptNames = departmentsData.map(d => d.name);
        setDepts(deptNames);
        sessionStorage.setItem('cached_depts', JSON.stringify(deptNames));
        
        setManagers(managersData);
        sessionStorage.setItem('cached_managers', JSON.stringify(managersData));
      })()
      .catch(err => console.error('Error fetching departments/managers:', err))
      .finally(() => setDepartmentsLoading(false));
    }

    const fetchTime = Date.now();
    lastFetchRef.current = fetchTime;
    sessionStorage.setItem('cached_time', String(fetchTime));

    // Wait for all in background to clear global loader and lock
    Promise.all([ticketsPromise, notificationsPromise, departmentsPromise]).finally(() => {
      isFetchingRef.current = false;
      setDataLoading(false);
    });
  }, []);

  // Helper to decode JWT payload safely
  const decodeJwtPayload = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Check existing session on mount (no auto-login)
  useEffect(() => {
    async function initSession() {
      const token = getToken();
      // No JWT token in localStorage = not logged in, skip all
      if (!token) {
        setAuthLoading(false);
        return;
      }

      const decoded = decodeJwtPayload(token);
      // If token is malformed or expired, clear and return
      if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
        removeToken();
        sessionStorage.clear();
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }

      const roleMap = { USER: ROLES.EMPLOYEE, MANAGER: ROLES.MANAGER, ADMIN: ROLES.ADMIN };
      const verifiedTokenRole = roleMap[decoded.role] || ROLES.EMPLOYEE;

      try {
        // Check cache first to avoid server loading on rapid F5 refreshes
        const cachedUser = sessionStorage.getItem('cached_user');
        const cachedRole = sessionStorage.getItem('cached_role');
        const cachedTickets = sessionStorage.getItem('cached_tickets');
        const cachedNotifs = sessionStorage.getItem('cached_notifications');
        const cachedDepts = sessionStorage.getItem('cached_depts');
        const cachedManagers = sessionStorage.getItem('cached_managers');
        const cachedTime = sessionStorage.getItem('cached_time');

        const now = Date.now();
        // If cache exists, role matches verified JWT token, and is less than 10 seconds old
        const isCacheValid = cachedUser && cachedRole === verifiedTokenRole && cachedTime && (now - Number(cachedTime) < 10_000);

        if (isCacheValid) {
          const parsedUser = JSON.parse(cachedUser);
          if (parsedUser && (parsedUser.id === decoded.id || parsedUser.username === decoded.username)) {
            setCurrentUser(parsedUser);
            setRole(verifiedTokenRole);
            setIsLoggedIn(true);
            
            if (cachedTickets) setTickets(JSON.parse(cachedTickets));
            if (cachedNotifs) setNotifications(JSON.parse(cachedNotifs));
            if (cachedDepts) setDepts(JSON.parse(cachedDepts));
            if (cachedManagers) setManagers(JSON.parse(cachedManagers));
            
            lastFetchRef.current = Number(cachedTime);
            setAuthLoading(false);
            return; // Skip API calls
          }
        }
      } catch (e) {
        console.error('Failed to parse session storage cache', e);
      }

      try {
        const me = await api.getMe();
        setCurrentUser(me);
        const userRole = roleMap[me.role] || verifiedTokenRole || ROLES.EMPLOYEE;
        setRole(userRole);
        setIsLoggedIn(true);
        
        sessionStorage.setItem('cached_user', JSON.stringify(me));
        sessionStorage.setItem('cached_role', userRole);
        sessionStorage.setItem('cached_time', String(Date.now()));

        await loadData(true, true); // Force on login
      } catch {
        // Token is invalid or expired — clean up
        removeToken();
        sessionStorage.clear();
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    }
    initSession();
  }, [loadData]);

  // WebSocket lifecycle and listeners
  useEffect(() => {
    let socket = null;
    if (isLoggedIn) {
      socket = initSocket(() => {
        setUseWs(false); // Fallback to Polling if WebSocket fails completely
      });

      if (socket) {
        socket.on('connect', () => {
          setUseWs(true);
        });

        socket.on('disconnect', () => {
          setUseWs(false);
        });

        // Reset existing listeners first to prevent duplicates (double-trigger protection)
        socket.off('notification:new');
        socket.off('ticket:created');
        socket.off('ticket:updated');
        socket.off('comment:created');

        socket.on('notification:new', (data) => {
          const parsed = parsePayload(data);
          if (parsed) {
            // Check duplicates outside the state updater to prevent StrictMode double-triggering side effects
            const exists = notificationsRef.current.some((n) => n.id === parsed.id);
            if (!exists) {
              // Map payload to match fetchNotifications structure
              const ticketId = parsed.link ? parsed.link.split('/').pop() : 'N/A';
              let type = 'info';
              if (parsed.title.includes('สำเร็จ') || parsed.title.includes('อนุมัติ')) type = 'success';
              else if (parsed.title.includes('ปฏิเสธ') || parsed.title.includes('ข้อผิดพลาด')) type = 'error';
              else if (parsed.title.includes('เตือน') || parsed.title.includes('ค้าง')) type = 'warning';

              const formattedNotif = {
                id: parsed.id,
                ticketId,
                title: parsed.title,
                message: parsed.message,
                time: 'เมื่อสักครู่',
                read: parsed.isRead,
                type,
              };

              // Trigger toast exactly once with title & message
              addToast(formattedNotif.message || 'มีแจ้งเตือนใหม่', type, formattedNotif.title || 'การแจ้งเตือน');

              setNotifications((prev) => {
                const doubleCheck = prev.some((n) => n.id === parsed.id);
                if (doubleCheck) return prev;
                const updated = [formattedNotif, ...prev];
                sessionStorage.setItem('cached_notifications', JSON.stringify(updated));
                return updated;
              });
            }
          }
        });

        socket.on('comment:created', () => {
          loadData(false, true); // Reload dashboard in real-time
        });

        socket.on('comment:updated', () => {
          loadData(false, true); // Reload dashboard in real-time
        });

        socket.on('comment:deleted', () => {
          loadData(false, true); // Reload dashboard in real-time
        });

        socket.on('ticket:created', () => {
          loadData(false, true); // Reload dashboard in real-time
        });

        socket.on('ticket:updated', () => {
          loadData(false, true); // Reload dashboard in real-time
        });
      }
    } else {
      disconnectSocket();
    }

    return () => {
      if (socket) {
        socket.off('notification:new');
        socket.off('ticket:created');
        socket.off('ticket:updated');
        socket.off('comment:created');
        socket.off('comment:updated');
        socket.off('comment:deleted');
      }
    };
  }, [isLoggedIn, loadData, addToast]);

  // Background polling – runs every 60 s but is guarded by MIN_REFETCH_MS
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(); // Throttle guard inside loadData will skip if too recent
      }
    }, 60_000); // Relaxed to 60 s; tab-focus refresh provides freshness

    // Refresh when user switches back to this tab, but only if stale
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(); // Throttle guard prevents over-fetching
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, loadData]);

  // Real-time polling for notifications every 10 seconds (bell icon updates)
  useEffect(() => {
    if (!isLoggedIn || useWs) return;

    const fetchNotifs = async () => {
      try {
        const notifs = await api.fetchNotifications();
        setNotifications(notifs);
        sessionStorage.setItem('cached_notifications', JSON.stringify(notifs));
      } catch (err) {
        console.error('Failed to poll notifications:', err);
      }
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifs();
      }
    }, 10_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, loadData, useWs]);

  // Save activeNav to cache on change
  useEffect(() => {
    if (activeNav && activeNav !== 'create-ticket') {
      sessionStorage.setItem('last_active_nav', activeNav);
    }
  }, [activeNav]);

  // Sync state to/from URL pathname
  const handleLocationChange = useCallback(() => {
    const path = window.location.pathname;
    if (path.startsWith('/tickets/')) {
      const id = path.split('/').pop();
      setActiveTicketId(id);
      const cachedNav = sessionStorage.getItem('last_active_nav') || 'dashboard';
      setActiveNav(cachedNav);
    } else {
      setActiveTicketId(null);
      const nav = path.replace('/', '') || 'dashboard';
      const validNavs = [
        'dashboard', 'my-own-tickets', 'track', 'my-sent-tickets',
        'all-dept-tickets', 'create-ticket', 'dept-tickets', 'all-tickets',
        'escalated', 'approval', 'approved-history', 'sla', 'profile',
        'reports', 'settings', 'team', 'faq'
      ];
      if (nav === 'sla-settings') {
        window.history.replaceState({ navName: 'dashboard' }, '', '/');
        setActiveNav('dashboard');
      } else if (nav === 'create-ticket') {
        window.history.replaceState({ navName: 'dashboard' }, '', '/');
        setActiveNav('dashboard');
        setShowCreateModal(true);
      } else if (validNavs.includes(nav)) {
        setActiveNav(nav);
      } else {
        setActiveNav('dashboard');
      }
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      handleLocationChange();
    });
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [handleLocationChange]);

  const changeActiveNav = useCallback((nav) => {
    if (nav === 'create-ticket') {
      setShowCreateModal(true);
      return;
    }
    setActiveNav(nav);
    setActiveTicketId(null);
    if (window.location.pathname !== '/') {
      window.history.pushState({ navName: nav }, '', '/');
    }
  }, []);

  const openTicketDetail = useCallback((id) => {
    setActiveTicketId(id);
    if (window.location.pathname !== `/tickets/${id}`) {
      window.history.pushState({ ticketId: id }, '', `/tickets/${id}`);
    }
  }, []);

  const closeTicketDetail = useCallback(() => {
    setActiveTicketId(null);
    if (window.location.pathname.startsWith('/tickets/')) {
      window.history.pushState({ navName: activeNav }, '', '/');
    }
  }, [activeNav]);

  // Login
  const loginUser = useCallback(async (username, password) => {
    await api.login(username, password);
    const me = await api.getMe();
    setCurrentUser(me);
    const roleMap = { USER: ROLES.EMPLOYEE, MANAGER: ROLES.MANAGER, ADMIN: ROLES.ADMIN };
    const userRole = roleMap[me.role] || ROLES.EMPLOYEE;
    setRole(userRole);
    setIsLoggedIn(true);
    setActiveNav('dashboard');
    setActiveTicketId(null);
    window.history.pushState({ navName: 'dashboard' }, '', '/');
    
    // Save to sessionStorage cache
    sessionStorage.setItem('cached_user', JSON.stringify(me));
    sessionStorage.setItem('cached_role', userRole);
    sessionStorage.setItem('cached_time', String(Date.now()));

    await loadData(true, true); // Force-refresh on login
    addToast(`ยินดีต้อนรับ ${me.name || ''}!`, 'success');
  }, [loadData, addToast]);

  // Logout
  const logoutUser = useCallback(async () => {
    removeToken(); // Remove JWT from localStorage first
    try {
      await api.logout();
    } catch {
      // ignore
    }
    disconnectSocket(); // Disconnect real-time sockets
    setIsLoggedIn(false);
    setCurrentUser(null);
    setTickets([]);
    setNotifications([]);
    setActiveNav('dashboard');
    setActiveTicketId(null);
    window.history.pushState({ navName: 'dashboard' }, '', '/');
    
    // Clear sessionStorage cache
    sessionStorage.clear();

    addToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  }, [addToast]);

  // Switch role
  const switchRole = useCallback(async (newRole) => {
    const usernameMap = {
      employee: 'employee',
      manager:  'manager',
      admin:    'admin',
    };
    const username = usernameMap[newRole];
    if (!username) return;
    try {
      await api.login(username, 'password123');
      const me = await api.getMe();
      setCurrentUser(me);
      setRole(newRole);
      
      // Save to sessionStorage cache
      sessionStorage.setItem('cached_user', JSON.stringify(me));
      sessionStorage.setItem('cached_role', newRole);
      sessionStorage.setItem('cached_time', String(Date.now()));

      await loadData(true, true); // Force-refresh on role switch
      addToast(`สลับบทบาทเป็น ${ROLE_INFO[newRole].label} สำเร็จ!`, 'success');
    } catch (err) {
      addToast(`สลับบทบาทล้มเหลว: ${err.message}`, 'error');
    }
  }, [loadData, addToast]);

  // Optimistic updates for notifications – avoid a full server round-trip for read-marking
  const markNotifAsRead = useCallback(async (id) => {
    // Optimistically mark as read in local state immediately
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await api.markNotificationAsRead(id); }
    catch (err) {
      console.error('Failed to mark notification:', err);
      // Revert optimistic update on failure
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    // Optimistically clear all in local state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await api.markNotificationAsRead(null); }
    catch (err) {
      console.error('Failed to clear notifications:', err);
      await loadData(false, true); // Only revert on failure
    }
  }, [loadData]);

  const createTicket = useCallback(async (data, file, files = []) => {
    try {
      const newTicket = await api.createTicket(data, file, files);
      addToast(`สร้าง Ticket ${newTicket.id} สำเร็จ!`, 'success');
      await loadData(false, true); // Force-refresh so new ticket appears instantly
      return newTicket;
    } catch (err) {
      addToast(`สร้าง Ticket ล้มเหลว: ${err.message}`, 'error');
      throw err;
    }
  }, [addToast, loadData]);

  const updateTicketStatus = useCallback(async (id, status, note = '') => {
    await api.updateTicketStatus(id, status, note);
    await loadData(false, true); // Force-refresh after mutation
  }, [loadData]);

  const approveTicket = useCallback(async (id, approved, note = '') => {
    try {
      await api.approveTicket(id, approved, note);
      // Auto-set status to 'progress' (เริ่มดำเนินการ) immediately after approval
      if (approved) {
        await api.updateTicketStatus(id, 'progress', 'เริ่มดำเนินการหลังจากได้รับอนุมัติ');
      }
      addToast(approved ? 'อนุมัติ Ticket เรียบร้อย — เปลี่ยนสถานะเป็น เริ่มดำเนินการ แล้ว' : 'ปฏิเสธ Ticket แล้ว', approved ? 'success' : 'error');
      await loadData(false, true); // Force-refresh after mutation
    } catch (err) {
      addToast(`ดำเนินการล้มเหลว: ${err.message}`, 'error');
    }
  }, [addToast, loadData]);

  const assignTicket = useCallback(async (id, assigneeId) => {
    try {
      await api.assignTicket(id, assigneeId);
      addToast('มอบหมาย Ticket สำเร็จ!', 'success');
      await loadData(false, true); // Force-refresh after mutation
    } catch (err) {
      addToast(`มอบหมายล้มเหลว: ${err.message}`, 'error');
    }
  }, [addToast, loadData]);

  const updateProfile = useCallback(async (payload) => {
    try {
      const updatedUser = await api.updateMe(payload);
      setCurrentUser(updatedUser); // Only profile data changed – no ticket/notif refetch needed
      
      // Update cache
      sessionStorage.setItem('cached_user', JSON.stringify(updatedUser));
      
      addToast('อัปเดตโปรไฟล์สำเร็จ!', 'success');
      return updatedUser;
    } catch (err) {
      addToast(`อัปเดตโปรไฟล์ล้มเหลว: ${err.message}`, 'error');
      throw err;
    }
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      role, setRole: switchRole,
      isLoggedIn, authLoading, dataLoading,
      ticketsLoading, notificationsLoading, departmentsLoading,
      currentUser,
      loginUser, logoutUser,
      tickets, setTickets,
      activeNav, setActiveNav: changeActiveNav,
      activeTicketId, openTicketDetail, closeTicketDetail,
      showCreateModal, setShowCreateModal,
      showMobileSidebar, setShowMobileSidebar,
      toasts,
      notifications,
      depts,
      managers,
      markNotifAsRead,
      clearAllNotifications,
      createTicket,
      updateTicketStatus,
      approveTicket,
      assignTicket,
      updateProfile,
      addToast,
      removeToast,
      reloadTickets: (fetchDepts = false, forceRefetch = false) => loadData(fetchDepts, forceRefetch),
      globalConfirm,
      showConfirm,
      setGlobalConfirm,
      theme,
      setTheme,
      showHelp,
      setShowHelp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
