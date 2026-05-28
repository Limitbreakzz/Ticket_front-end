// ── ROLES ──
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

export const ROLE_INFO = {
  employee: {
    label: 'Operator',
    name: 'สมชาย ใจดี',
    initials: 'สช',
    color: '#2563eb',
    desc: 'พนักงานสายการผลิต',
  },
  manager: {
    label: 'Supervisor',
    name: 'วิภา รักดี',
    initials: 'วภ',
    color: '#10b981',
    desc: 'หัวหน้ากะ/หัวหน้าสายการผลิต',
  },
  admin: {
    label: 'Maintenance',
    name: 'ธนา สมบูรณ์',
    initials: 'ธน',
    color: '#7c3aed',
    desc: 'ช่างซ่อมบำรุง/วิศวกร',
  },
};

// ── CATEGORIES ──
export const CATEGORIES = {
  mechanical: {
    label: 'เครื่องจักร',
    icon: 'gear',
    sub: ['มอเตอร์สายพาน', 'ปั๊มน้ำ/ลม', 'ระบบไฮดรอลิก', 'ลูกปืน/เพลา', 'อื่น ๆ'],
  },
  electrical: {
    label: 'ระบบไฟฟ้า',
    icon: 'bolt',
    sub: ['ตู้คอนโทรล', 'เซ็นเซอร์', 'สายไฟ/ปลั๊ก', 'แสงสว่าง', 'อื่น ๆ'],
  },
  facility: {
    label: 'ระบบอาคาร',
    icon: 'building',
    sub: ['ระบบแอร์/HVAC', 'ท่อประปา/น้ำรั่ว', 'โครงสร้างชำรุด', 'อื่น ๆ'],
  },
  it_support: {
    label: 'ไอที/เครือข่าย',
    icon: 'desktop',
    sub: ['คอมพิวเตอร์/ปริ้นเตอร์', 'ระบบ ERP', 'อินเทอร์เน็ต/Wi-Fi', 'อื่น ๆ'],
  },
};

// ── URGENCY ──
export const URGENCY_LEVELS = [
  { value: 'low',      label: 'ต่ำ',     icon: 'circle-check',        color: '#16a34a' },
  { value: 'medium',   label: 'ปานกลาง', icon: 'circle-minus',        color: '#d97706' },
  { value: 'high',     label: 'สูง',     icon: 'circle-exclamation',  color: '#ef4444' },
  { value: 'critical', label: 'วิกฤต',  icon: 'triangle-exclamation', color: '#7c3aed' },
];

// ── STATUSES (Factory Context) ──
export const STATUS_LABEL = {
  pending: { label: 'รอดำเนินการ', cls: 'status-pending' },
  progress: { label: 'กำลังแก้ไข', cls: 'status-progress' },
  'wait-approve': { label: 'รออนุมัติ', cls: 'status-wait-approve' },
  approved: { label: 'อนุมัติแล้ว', cls: 'status-approved' },
  rejected: { label: 'ปฏิเสธ', cls: 'status-rejected' },
  forwarded: { label: 'ส่งต่อแผนก', cls: 'status-forwarded' },
  'wait-parts': { label: 'รออะไหล่/อุปกรณ์', cls: 'status-wait-parts' },
  resolved: { label: 'แก้ไขเสร็จสิ้น', cls: 'status-resolved' },
  closed: { label: 'ปิดเคส', cls: 'status-closed' },
  cancelled: { label: 'ยกเลิก', cls: 'status-cancelled' },
};

// ── DEPARTMENTS ──
export const DEPARTMENTS = [
  'ฝ่ายผลิต 1',
  'ฝ่ายบรรจุภัณฑ์',
  'ฝ่าย Machining',
  'ฝ่าย Pressing',
  'ฝ่ายคลังสินค้า',
  'แผนก IT',
  'ฝ่ายบุคคล',
  'แผนกจัดซื้อ',
  'ฝ่ายอาคารสถานที่',
  'ฝ่ายซ่อมบำรุง',
  'ส่วนกลาง',
];

// ── MOCK TICKETS ──
let idCounter = 9;
export const generateId = () => {
  idCounter++;
  return `TK-${new Date().getFullYear()}-${String(idCounter).padStart(3, '0')}`;
};

export const INITIAL_TICKETS = [];
