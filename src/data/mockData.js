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

// ── NAV_CONFIG ──
export const NAV_CONFIG = {
  [ROLES.EMPLOYEE]: [
    {
      section: 'ภาพรวม',
      items: [
        { id: 'dashboard',  icon: 'house',             label: 'หน้าหลัก' },
        { id: 'my-tickets', icon: 'rectangle-list',    label: 'Ticket ของฉัน', badge: '3', badgeColor: 'blue' },
      ],
    },
    {
      section: 'การดำเนินการ',
      items: [
        { id: 'create-ticket', icon: 'ticket',           label: 'แจ้งเรื่องใหม่' },
        { id: 'track',         icon: 'magnifying-glass', label: 'ติดตามสถานะ' },
      ],
    },
    {
      section: 'อื่น ๆ',
      items: [
        { id: 'sla', icon: 'gauge-high',              label: 'SLA ของฉัน' },
        { id: 'faq', icon: 'circle-question',         label: 'คำถามที่พบบ่อย' },
      ],
    },
  ],
  [ROLES.MANAGER]: [
    {
      section: 'ภาพรวม',
      items: [
        { id: 'dashboard',    icon: 'house',           label: 'หน้าหลัก' },
        { id: 'dept-tickets', icon: 'layer-group',     label: 'Ticket ของแผนก', badge: '5', badgeColor: 'blue' },
      ],
    },
    {
      section: 'การอนุมัติ',
      items: [
        { id: 'approval',          icon: 'clipboard-check',   label: 'รออนุมัติ', badge: '2' },
        { id: 'approved-history',  icon: 'clock-rotate-left', label: 'ประวัติการอนุมัติ' },
      ],
    },
    {
      section: 'รายงาน',
      items: [
        { id: 'sla',     icon: 'gauge-high',  label: 'SLA Dashboard' },
        { id: 'reports', icon: 'chart-line',  label: 'รายงานสรุป' },
        { id: 'team',    icon: 'users',       label: 'ทีมงาน' },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    {
      section: 'ภาพรวม',
      items: [
        { id: 'dashboard',  icon: 'house',   label: 'Dashboard' },
        { id: 'all-tickets', icon: 'rectangle-list', label: 'Ticket ทั้งหมด', badge: '12', badgeColor: 'blue' },
      ],
    },
    {
      section: 'การจัดการ',
      items: [
        { id: 'approval',  icon: 'clipboard-check',      label: 'รออนุมัติ',       badge: '3' },
        { id: 'assign',    icon: 'user-plus',             label: 'มอบหมายงาน',      badge: '4', badgeColor: 'orange' },
        { id: 'escalated', icon: 'triangle-exclamation',  label: 'เร่งด่วน/วิกฤต', badge: '2' },
      ],
    },
    {
      section: 'วิเคราะห์',
      items: [
        { id: 'sla',      icon: 'gauge-high',  label: 'SLA Dashboard' },
        { id: 'reports',  icon: 'chart-line',  label: 'รายงาน & วิเคราะห์' },
        { id: 'users',    icon: 'user-shield', label: 'จัดการผู้ใช้งาน' },
        { id: 'settings', icon: 'gear',        label: 'ตั้งค่าระบบ' },
        { id: 'audit',    icon: 'file-lines',  label: 'Audit Log' },
      ],
    },
  ],
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
