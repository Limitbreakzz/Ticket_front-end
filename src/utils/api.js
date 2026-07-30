const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:4000/api`;
};
const API_BASE_URL = getApiBaseUrl();

// ── JWT TOKEN HELPERS ──
export const getToken = () => localStorage.getItem('jwt_token');
export const setToken = (token) => localStorage.setItem('jwt_token', token);
export const removeToken = () => localStorage.removeItem('jwt_token');

export function resolveImageUrl(url) {
  if (!url) return null;
  try {
    const backendBase = API_BASE_URL.replace(/\/api$/, '');
    if (url.startsWith('/')) {
      return `${backendBase}${url}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.includes('demo-hr.v2.api.organicsos.ai')) {
        return url;
      }
      const parsedUrl = new URL(url);
      if (parsedUrl.pathname.includes('/images/') || parsedUrl.pathname.includes('/uploads/')) {
        return `${backendBase}${parsedUrl.pathname}`;
      }
    }
  } catch (e) {
    console.error("Error resolving image URL:", e);
  }
  return url;
}

// ── BIDIRECTIONAL MAPPINGS ──

// Categories
const CATEGORY_FE_TO_BE = {
  hardware: 'HARDWARE',
  software: 'SOFTWARE',
  network: 'NETWORK',
  access: 'ACCESS',
  other: 'OTHER',
};

const CATEGORY_BE_TO_FE = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  ACCESS: 'access',
  OTHER: 'other',
};

// Subcategories
const SUBCATEGORY_FE_TO_BE = {
  // Hardware
  'คอมพิวเตอร์ / โน้ตบุ๊ก': 'computer_laptop',
  'หน้าจอ / จอภาพ': 'monitor',
  'ปริ้นเตอร์': 'printer_scanner',
  'คีย์บอร์ด / เมาส์': 'accessory',
  'อุปกรณ์อื่นๆ': 'hardware_other',

  // Software
  'OS (Windows / macOS)': 'os_system',
  'Microsoft 365 / Outlook': 'office_apps',
  'ERP / ระบบงานภายใน': 'internal_systems',
  'ติดตั้ง / อัปเดตโปรแกรม': 'install_update',
  'ซอฟต์แวร์อื่นๆ': 'software_other',

  // Network
  'ต่อ Wi-Fi ไม่ได้': 'wifi_issue',
  'เน็ตสายแลนเสีย': 'lan_issue',
  'VPN / เข้าถึงระยะไกล': 'vpn_remote',
  'เน็ตช้า / หลุดบ่อย': 'slow_network',
  'ระบบเครือข่ายอื่นๆ': 'network_other',

  // Account & Access
  'รีเซ็ตรหัสผ่าน / ปลดล็อกบัญชี': 'password_reset',
  'ขอสิทธิ์โฟลเดอร์แชร์': 'shared_folder',
  'ขอสิทธิ์ใช้งานโปรแกรม / อีเมล': 'license_request',
  'บัตรพนักงาน / สิทธิ์เข้าออกอาคาร': 'keycard_building',
  'สิทธิ์เข้าใช้งานอื่นๆ': 'access_other',

  // Other
  'ขอโต๊ะทำงาน / เก้าอี้': 'desk_chair',
  'อุปกรณ์สำนักงาน / เครื่องเขียน': 'stationery',
  'ประสานงานนักศึกษาฝึกงาน': 'intern_coord',
  'ขอคำปรึกษา / แนะนำทั่วไป': 'consultation',
  'บริการและคำขอทั่วไปอื่นๆ': 'other_general',
};

// Urgency / Priority
const URGENCY_FE_TO_BE = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
};

const URGENCY_BE_TO_FE = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Status
const STATUS_FE_TO_BE = {
  pending: 'NEW',
  'in-progress': 'IN_PROGRESS',
  progress: 'IN_PROGRESS',
  'wait-approve': 'PENDING_APPROVAL',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  forwarded: 'FORWARDED',
  'wait-parts': 'WAITING_PARTS',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
  cancelled: 'CANCELLED',
};

const STATUS_BE_TO_FE = {
  NEW: 'pending',
  IN_PROGRESS: 'progress',
  PENDING_APPROVAL: 'wait-approve',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FORWARDED: 'forwarded',
  WAITING_PARTS: 'wait-parts',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
};

// ── UTILITIES ──

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Attach JWT token if available
  const token = getToken();
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    };
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  } else {
    options.headers = {
      ...authHeader,
      ...options.headers,
    };
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.message || data.error || errMsg;
    } catch (err) {
      console.debug("Failed to parse error response body:", err);
    }
    throw new Error(errMsg);
  }

  return res.json();
}

// ── FILE UPLOAD ──

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await apiFetch('/upload', {
    method: 'POST',
    body: formData,
  });
  return res.data.url;
}

// ── AUTHENTICATION ──

export async function login(username, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  if (res.data && res.data.token) {
    setToken(res.data.token);
  }
  if (res.data && res.data.avatarUrl) {
    res.data.avatarUrl = resolveImageUrl(res.data.avatarUrl);
  }
  return res.data;
}

export async function logout() {
  removeToken();
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch { /* ignore */ }
}

export async function getMe() {
  const res = await apiFetch('/auth/me');
  if (res.data && res.data.avatarUrl) {
    res.data.avatarUrl = resolveImageUrl(res.data.avatarUrl);
  }
  return res.data;
}



// ── DEPARTMENTS ──

export async function getDepartments(force = false) {
  const cached = sessionStorage.getItem('cached_api_departments');
  const cachedTime = sessionStorage.getItem('cached_api_departments_time');
  const now = Date.now();
  if (!force && cached && cachedTime && (now - Number(cachedTime) < 15000)) {
    return JSON.parse(cached);
  }
  const res = await apiFetch('/departments');
  sessionStorage.setItem('cached_api_departments', JSON.stringify(res.data));
  sessionStorage.setItem('cached_api_departments_time', String(now));
  return res.data;
}

export async function getManagers() {
  const res = await apiFetch('/users');
  return (res.data || []).filter(u => u.role === 'MANAGER');
}

// ── TICKETS ──

export function formatThaiDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function mapTicketBEtoFE(tk, comments) {
  const commentsArray = Array.isArray(comments) ? comments : (tk.comments || []);
  const hasApproveComment = commentsArray.some(c => c.message && c.message.includes('อนุมัติคำขอ'));
  const hasRejectComment = commentsArray.some(c => c.message && c.message.includes('ปฏิเสธคำขอ'));

  const claimComment = commentsArray.find(c => 
    c.message && (
      c.message.includes('ได้กดรับผิดชอบดูแล') || 
      c.message.includes('มอบหมายให้') || 
      c.message.includes('กำลังดำเนินการ')
    )
  );
  let acceptedAt = null;
  if (tk.agent) {
    acceptedAt = claimComment ? claimComment.createdAt : tk.createdAt;
  }

  const timeline = commentsArray.map(c => {
    const isSystem = c.message.includes('ระบบ:') || c.message.includes('🔄');
    const isApproved = c.message.includes('อนุมัติ');
    const isRejected = c.message.includes('ปฏิเสธ');
    
    let icon = 'comment';
    if (c.message.includes('สร้าง Ticket')) icon = 'pen-to-square';
    else if (isApproved) icon = 'check';
    else if (isRejected) icon = 'xmark';
    else if (c.message.includes('สถานะ') || c.message.includes('ปรับเป็น')) icon = 'rotate';
    else if (c.message.includes('มอบหมาย')) icon = 'user';
    
    return {
      id: c.id,
      event: c.message,
      actor: isSystem ? 'System' : (c.user ? c.user.name : 'Unknown'),
      actorAvatar: isSystem ? null : (c.user ? resolveImageUrl(c.user.avatarUrl) : null),
      time: formatThaiDateTime(c.createdAt),
      icon,
      attachmentUrl: resolveImageUrl(c.attachmentUrl),
      readAt: c.readAt ? formatThaiDateTime(c.readAt) : null,
      updatedAt: c.updatedAt ? formatThaiDateTime(c.updatedAt) : null,
      isEdited: c.isEdited || false,
    };
  });

  return {
    id: tk.id,
    subject: tk.title,
    description: tk.description,
    category: CATEGORY_BE_TO_FE[tk.category] || 'other',
    subCategory: tk.subcategory || '',
    urgency: URGENCY_BE_TO_FE[tk.priority] || 'medium',
    status: STATUS_BE_TO_FE[tk.status] || 'pending',
    assignedTo: tk.agent ? tk.agent.name : 'รอมอบหมาย',
    agentAvatar: tk.agent ? resolveImageUrl(tk.agent.avatarUrl) : null,
    createdBy: tk.user ? tk.user.name : 'ไม่ระบุ',
    creatorAvatar: tk.user ? resolveImageUrl(tk.user.avatarUrl) : null,
    department: tk.sourceDepartment ? tk.sourceDepartment.name : 'ไม่ระบุ',
    createdAt: formatThaiDateTime(tk.createdAt),
    updatedAt: formatThaiDateTime(tk.updatedAt),
    rawCreatedAt: tk.createdAt,
    rawUpdatedAt: tk.updatedAt,
    timeline: timeline,
    comments: commentsArray,
    managerApproval: tk.status === 'PENDING_APPROVAL' ? null : (tk.status === 'APPROVED' || hasApproveComment) ? 'approved' : (tk.status === 'REJECTED' || hasRejectComment) ? 'rejected' : null,
    adminNote: '', // Handled from latest comment or updates
    image: resolveImageUrl(tk.attachmentUrl) || null,
    // Add SLA data
    slaDueDate: tk.slaDueDate,
    targetDepartment: tk.targetDepartment ? tk.targetDepartment.name : '',
    acceptedAt: acceptedAt ? new Date(acceptedAt).toISOString() : null,
    receiverManager: tk.receiverManager ? {
      id: tk.receiverManager.id,
      name: tk.receiverManager.name,
      email: tk.receiverManager.email,
      avatarUrl: resolveImageUrl(tk.receiverManager.avatarUrl),
    } : null,
  };
}

export async function fetchTickets() {
  const res = await apiFetch('/tickets');
  return (res.data || []).map(mapTicketBEtoFE);
}

export async function createTicket(formData, file = null) {
  let attachmentUrl = null;
  if (file) {
    attachmentUrl = await uploadFile(file);
  }
  
  // Look up departments to find ID
  const depts = await getDepartments();
  const matchedDept = depts.find(d => d.name === formData.department);
  const targetDepartmentId = matchedDept ? matchedDept.id : null;
  
  const payload = {
    title: formData.subject,
    description: formData.description,
    category: CATEGORY_FE_TO_BE[formData.category] || 'OTHER',
    subcategory: SUBCATEGORY_FE_TO_BE[formData.subCategory] || formData.subCategory || null,
    priority: URGENCY_FE_TO_BE[formData.urgency] || 'MEDIUM',
    attachmentUrl,
    targetDepartmentId: formData.sendType === 'manager' ? null : targetDepartmentId,
    receiverManagerId: formData.sendType === 'manager' ? formData.receiverManagerId : null,
  };
  
  const res = await apiFetch('/tickets', {
    method: 'POST',
    body: payload,
  });
  return mapTicketBEtoFE(res.data);
}

export async function getTicketDetail(id, force = false) {
  const cacheKey = `cached_ticket_detail_${id}`;
  const timeKey = `cached_ticket_detail_${id}_time`;
  const cached = sessionStorage.getItem(cacheKey);
  const cachedTime = sessionStorage.getItem(timeKey);
  const now = Date.now();
  
  if (!force && cached && cachedTime && (now - Number(cachedTime) < 15000)) {
    return JSON.parse(cached);
  }

  const res = await apiFetch(`/tickets/${id}/data`);
  const { ticket, comments } = res.data;
  
  const feTicket = mapTicketBEtoFE(ticket, comments);
  
  // Find admin notes from comments if available
  const adminComments = comments.filter(c => c.message.includes('🔄 ระบบ:'));
  if (adminComments.length > 0) {
    feTicket.adminNote = adminComments[adminComments.length - 1].message;
  }
  
  // timeline is mapped automatically inside mapTicketBEtoFE
  
  sessionStorage.setItem(cacheKey, JSON.stringify(feTicket));
  sessionStorage.setItem(timeKey, String(now));
  return feTicket;
}

export async function getTicketChatUpdates(id) {
  const res = await apiFetch(`/tickets/${id}/chat-updates`);
  const { status, agent, targetDepartment, comments } = res.data;
  
  const commentsArray = Array.isArray(comments) ? comments : [];
  const timeline = commentsArray.map(c => {
    const isSystem = c.message.includes('ระบบ:') || c.message.includes('🔄');
    const isApproved = c.message.includes('อนุมัติ');
    const isRejected = c.message.includes('ปฏิเสธ');
    
    let icon = 'comment';
    if (c.message.includes('สร้าง Ticket')) icon = 'pen-to-square';
    else if (isApproved) icon = 'check';
    else if (isRejected) icon = 'xmark';
    else if (c.message.includes('สถานะ') || c.message.includes('ปรับเป็น')) icon = 'rotate';
    else if (c.message.includes('มอบหมาย')) icon = 'user';
    
    return {
      id: c.id,
      event: c.message,
      actor: isSystem ? 'System' : (c.user ? c.user.name : 'Unknown'),
      actorAvatar: isSystem ? null : (c.user ? resolveImageUrl(c.user.avatarUrl) : null),
      time: formatThaiDateTime(c.createdAt),
      icon,
      attachmentUrl: resolveImageUrl(c.attachmentUrl),
      readAt: c.readAt ? formatThaiDateTime(c.readAt) : null,
      updatedAt: c.updatedAt ? formatThaiDateTime(c.updatedAt) : null,
      isEdited: c.isEdited || false,
    };
  });
  
  const hasApproveComment = commentsArray.some(c => c.message && c.message.includes('อนุมัติคำขอ'));
  const hasRejectComment = commentsArray.some(c => c.message && c.message.includes('ปฏิเสธคำขอ'));
  const managerApproval = status === 'PENDING_APPROVAL' ? null : (status === 'APPROVED' || hasApproveComment) ? 'approved' : (status === 'REJECTED' || hasRejectComment) ? 'rejected' : null;

  return {
    status: STATUS_BE_TO_FE[status] || 'pending',
    assignedTo: agent ? agent.name : 'รอมอบหมาย',
    agentAvatar: agent ? resolveImageUrl(agent.avatarUrl) : null,
    targetDepartment: targetDepartment ? targetDepartment.name : '',
    managerApproval,
    comments: commentsArray,
    timeline
  };
}

export async function addComment(ticketId, message, file = null) {
  let attachmentUrl = null;
  if (file) {
    attachmentUrl = await uploadFile(file);
  }
  
  const res = await apiFetch(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: {
      message,
      attachmentUrl,
    },
  });
  return res.data;
}

export async function editComment(ticketId, commentId, message) {
  const res = await apiFetch(`/tickets/${ticketId}/comments/${commentId}`, {
    method: 'PATCH',
    body: { message },
  });
  return res.data;
}

export async function deleteComment(ticketId, commentId) {
  const res = await apiFetch(`/tickets/${ticketId}/comments/${commentId}`, {
    method: 'DELETE',
  });
  return res.data;
}

export async function updateTicketStatus(id, status, note) {
  const res = await apiFetch(`/tickets/${id}/status`, {
    method: 'POST',
    body: {
      status: STATUS_FE_TO_BE[status] || 'IN_PROGRESS',
      approvalNote: note,
    },
  });
  return mapTicketBEtoFE(res.data);
}

export async function approveTicket(id, approved, note) {
  const res = await apiFetch(`/tickets/${id}/status`, {
    method: 'POST',
    body: {
      approvalAction: approved ? 'APPROVE' : 'REJECT',
      approvalNote: note,
    },
  });
  return mapTicketBEtoFE(res.data);
}

export async function assignTicket(id, agentId) {
  const res = await apiFetch(`/tickets/${id}/assign`, {
    method: 'POST',
    body: {
      agentId,
    },
  });
  return mapTicketBEtoFE(res.data);
}

export async function transferTicket(id, toDepartmentId, note) {
  const res = await apiFetch(`/tickets/${id}/transfer`, {
    method: 'POST',
    body: {
      toDepartmentId,
      note,
    },
  });
  return res.data;
}

export async function fetchUsers() {
  const res = await apiFetch('/users');
  return res.data || [];
}

// ── NOTIFICATIONS ──

export async function fetchNotifications() {
  const res = await apiFetch('/notifications');
  return (res.data || []).map(n => {
    // Extract ticket ID from link (e.g. /tickets/TK-123)
    const ticketId = n.link ? n.link.split('/').pop() : 'N/A';
    
    // Map type
    let type = 'info';
    if (n.title.includes('สำเร็จ') || n.title.includes('อนุมัติ')) type = 'success';
    else if (n.title.includes('ปฏิเสธ') || n.title.includes('ข้อผิดพลาด')) type = 'error';
    else if (n.title.includes('เตือน') || n.title.includes('ค้าง')) type = 'warning';
    
    return {
      id: n.id,
      ticketId,
      title: n.title,
      message: n.message,
      time: formatThaiDateTime(n.createdAt),
      read: n.isRead,
      type,
    };
  });
}

export async function markNotificationAsRead(id = null) {
  await apiFetch('/notifications', {
    method: 'PUT',
    body: id ? { id } : {},
  });
}

// ── ADMIN USER MANAGEMENT ──
export async function adminFetchUsers() {
  const res = await apiFetch('/admin/users');
  return res.data || [];
}

export async function adminCreateUser(payload) {
  const res = await apiFetch('/admin/users', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function adminUpdateUser(id, payload) {
  const res = await apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function adminDeleteUser(id) {
  await apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

// ── ADMIN DEPARTMENT MANAGEMENT ──
export async function adminFetchDepartments() {
  const res = await apiFetch('/admin/departments');
  return res.data || [];
}

export async function adminCreateDepartment(payload) {
  const res = await apiFetch('/admin/departments', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function adminUpdateDepartment(id, payload) {
  const res = await apiFetch(`/admin/departments/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function adminDeleteDepartment(id) {
  await apiFetch(`/admin/departments/${id}`, {
    method: 'DELETE',
  });
}

// ── ADMIN ANALYTICS ──
export async function fetchAnalytics() {
  const res = await apiFetch('/admin/analytics');
  return res.data;
}


// ── WEBHOOK MANAGEMENT ──
export async function fetchWebhooks() {
  const res = await apiFetch('/webhooks');
  return res.data || [];
}

export async function createWebhook(payload) {
  const res = await apiFetch('/webhooks', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function updateWebhook(id, payload) {
  const res = await apiFetch(`/webhooks/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function deleteWebhook(id) {
  await apiFetch(`/webhooks/${id}`, {
    method: 'DELETE',
  });
}

export async function testWebhook(id) {
  return await apiFetch(`/webhooks/${id}/test`, {
    method: 'POST',
  });
}

export async function updateMe(payload) {
  const res = await apiFetch('/auth/me', {
    method: 'PATCH',
    body: payload,
  });
  if (res.data && res.data.avatarUrl) {
    res.data.avatarUrl = resolveImageUrl(res.data.avatarUrl);
  }
  return res.data;
}
