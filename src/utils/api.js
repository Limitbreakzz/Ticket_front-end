const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ── BIDIRECTIONAL MAPPINGS ──

// Categories
const CATEGORY_FE_TO_BE = {
  mechanical: 'HARDWARE',
  electrical: 'NETWORK',
  facility: 'OTHER',
  it_support: 'SOFTWARE',
};

const CATEGORY_BE_TO_FE = {
  HARDWARE: 'mechanical',
  NETWORK: 'electrical',
  OTHER: 'facility',
  SOFTWARE: 'it_support',
  ACCESS: 'it_support',
};

// Subcategories
const SUBCATEGORY_FE_TO_BE = {
  'มอเตอร์สายพาน': 'hardware_other',
  'ปั๊มน้ำ/ลม': 'hardware_other',
  'ระบบไฮดรอลิก': 'hardware_other',
  'ลูกปืน/เพลา': 'hardware_other',
  'ตู้คอนโทรล': 'network_other',
  'เซ็นเซอร์': 'network_other',
  'สายไฟ/ปลั๊ก': 'network_other',
  'แสงสว่าง': 'network_other',
  'ระบบแอร์/HVAC': 'desk_chair',
  'ท่อประปา/น้ำรั่ว': 'stationery',
  'โครงสร้างชำรุด': 'other_general',
  'คอมพิวเตอร์/ปริ้นเตอร์': 'computer_laptop',
  'ระบบ ERP': 'internal_systems',
  'อินเทอร์เน็ต/Wi-Fi': 'wifi_issue',
  'อื่น ๆ': 'other_general',
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
  
  options.credentials = 'include';
  
  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, options);
  
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.message || data.error || errMsg;
    } catch (_) {}
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

export async function login(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return res.data;
}

export async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  const res = await apiFetch('/auth/me');
  return res.data;
}

// ── DEPARTMENTS ──

export async function getDepartments() {
  const res = await apiFetch('/departments');
  return res.data;
}

// ── TICKETS ──

export function mapTicketBEtoFE(tk) {
  return {
    id: tk.id,
    subject: tk.title,
    description: tk.description,
    category: CATEGORY_BE_TO_FE[tk.category] || 'it_support',
    subCategory: tk.subcategory || '',
    urgency: URGENCY_BE_TO_FE[tk.priority] || 'medium',
    status: STATUS_BE_TO_FE[tk.status] || 'pending',
    assignedTo: tk.agent ? tk.agent.name : 'รอมอบหมาย',
    createdBy: tk.user ? tk.user.name : 'ไม่ระบุ',
    department: tk.sourceDepartment ? tk.sourceDepartment.name : 'ไม่ระบุ',
    createdAt: new Date(tk.createdAt).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    updatedAt: new Date(tk.updatedAt).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    timeline: [], // Mapped when fetching detailed data
    managerApproval: tk.status === 'APPROVED' ? 'approved' : tk.status === 'REJECTED' ? 'rejected' : null,
    adminNote: '', // Handled from latest comment or updates
    image: tk.attachmentUrl || null,
    // Add SLA data
    slaDueDate: tk.slaDueDate,
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
    targetDepartmentId,
  };
  
  const res = await apiFetch('/tickets', {
    method: 'POST',
    body: payload,
  });
  return mapTicketBEtoFE(res.data);
}

export async function getTicketDetail(id) {
  const res = await apiFetch(`/tickets/${id}/data`);
  const { ticket, comments } = res.data;
  
  const feTicket = mapTicketBEtoFE(ticket);
  
  // Find admin notes from comments if available
  const adminComments = comments.filter(c => c.isInternal || c.message.includes('🔄 ระบบ:'));
  if (adminComments.length > 0) {
    feTicket.adminNote = adminComments[adminComments.length - 1].message;
  }
  
  // Map timeline events from comments
  feTicket.timeline = comments.map(c => {
    const isSystem = c.message.includes('ระบบ:') || c.user.role === 'ADMIN';
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
      actor: isSystem ? 'System' : c.user.name,
      time: new Date(c.createdAt).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      icon,
      attachmentUrl: c.attachmentUrl,
    };
  });
  
  return feTicket;
}

export async function addComment(ticketId, message, isInternal = false, file = null) {
  let attachmentUrl = null;
  if (file) {
    attachmentUrl = await uploadFile(file);
  }
  
  const res = await apiFetch(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: {
      message,
      isInternal,
      attachmentUrl,
    },
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
      time: new Date(n.createdAt).toLocaleString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
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
