// ── ROLES ──
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

export const ROLE_INFO = {
  employee: {
    label: 'พนักงานทั่วไป',
    name: 'สมชาย ใจดี',
    initials: 'สช',
    color: '#2563eb',
    desc: 'พนักงานทั่วไป',
  },
  manager: {
    label: 'หัวหน้าแผนก',
    name: 'วิภา รักดี',
    initials: 'วภ',
    color: '#10b981',
    desc: 'หัวหน้าแผนก',
  },
  admin: {
    label: 'ผู้ดูแลระบบ',
    name: 'ธนา สมบูรณ์',
    initials: 'ธน',
    color: '#7c3aed',
    desc: 'ผู้ดูแลระบบ',
  },
};

// ── NAV_CONFIG ──
export const NAV_CONFIG = {
  [ROLES.EMPLOYEE]: [
    {
      section: 'เมนูหลัก',
      items: [
        { id: 'dashboard',       icon: 'table-columns',        label: 'แดชบอร์ด' },
        { id: 'create-ticket',   icon: 'circle-plus',          label: 'สร้าง Ticket' },
      ],
    },
    {
      section: 'งานของฉัน',
      items: [
        { id: 'my-own-tickets',  icon: 'user',                 label: 'Ticket ของฉัน' },
        { id: 'track',           icon: 'user-check',           label: 'งานในการดูแลของฉัน' },
        { id: 'my-sent-tickets', icon: 'paper-plane',          label: 'Ticket ที่แผนกเราส่งไป', badgeColor: 'blue' },
        { id: 'all-dept-tickets',icon: 'building-user',        label: 'Ticket ทั้งหมดของแผนก', badgeColor: 'blue' },
      ],
    },
  ],
  [ROLES.MANAGER]: [
    {
      section: 'เมนูหลัก',
      items: [
        { id: 'dashboard',       icon: 'table-columns',        label: 'แดชบอร์ด' },
      ],
    },
    {
      section: 'งานของฉัน',
      items: [
        { id: 'my-own-tickets',  icon: 'user',                 label: 'Ticket ของฉัน' },
        { id: 'track',           icon: 'user-check',           label: 'งานในการดูแลของฉัน' },
        { id: 'my-sent-tickets', icon: 'paper-plane',          label: 'Ticket ที่แผนกเราส่งไป', badgeColor: 'blue' },
        { id: 'all-dept-tickets',icon: 'building-user',        label: 'Ticket ทั้งหมดของแผนก', badgeColor: 'blue' },
        { id: 'approval',        icon: 'clipboard-check',      label: 'รออนุมัติ', badge: '2' },
        { id: 'approved-history',icon: 'clock-rotate-left',   label: 'ประวัติการอนุมัติ' },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    {
      section: 'เมนูหลัก',
      items: [
        { id: 'dashboard',       icon: 'table-columns',        label: 'แดชบอร์ด' },
      ],
    },
    {
      section: 'งานของฉัน',
      items: [
        { id: 'my-own-tickets',  icon: 'user',                 label: 'Ticket ของฉัน' },
        { id: 'track',           icon: 'user-check',           label: 'งานในการดูแลของฉัน' },
        { id: 'my-sent-tickets', icon: 'paper-plane',          label: 'Ticket ที่แผนกเราส่งไป', badgeColor: 'blue' },
        { id: 'all-dept-tickets',icon: 'building-user',        label: 'Ticket ทั้งหมดของแผนก', badgeColor: 'blue' },
        { id: 'all-tickets',     icon: 'layer-group',          label: 'ตั๋วทั้งหมดในระบบ', badge: '12', badgeColor: 'blue' },
        { id: 'approval',        icon: 'clipboard-check',      label: 'รออนุมัติ', badge: '3' },
        { id: 'assign',          icon: 'user-plus',            label: 'มอบหมายงาน', badge: '4', badgeColor: 'orange' },
        { id: 'escalated',       icon: 'triangle-exclamation', label: 'เร่งด่วน/วิกฤต', badge: '2' },
      ],
    },
    {
      section: 'การควบคุมระบบ',
      items: [
        { id: 'reports',         icon: 'chart-line',           label: 'รายงาน & วิเคราะห์' },
        { id: 'users',           icon: 'users',                label: 'จัดการผู้ใช้งาน' },
        { id: 'settings',        icon: 'gear',                 label: 'ตั้งค่าระบบ/Webhook' },
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
  pending:      { label: 'รอดำเนินการ',    cls: 'status-pending',      icon: 'clock' },
  progress:     { label: 'กำลังแก้ไข',     cls: 'status-progress',     icon: 'spinner' },
  'wait-approve': { label: 'รออนุมัติ',    cls: 'status-wait-approve', icon: 'hourglass-half' },
  approved:     { label: 'อนุมัติแล้ว',    cls: 'status-approved',     icon: 'circle-check' },
  rejected:     { label: 'ปฏิเสธ',         cls: 'status-rejected',     icon: 'circle-xmark' },
  forwarded:    { label: 'ส่งต่อแผนก',     cls: 'status-forwarded',    icon: 'share-from-square' },
  'wait-parts': { label: 'รออะไหล่/อุปกรณ์', cls: 'status-wait-parts', icon: 'box-open' },
  resolved:     { label: 'แก้ไขเสร็จสิ้น', cls: 'status-resolved',    icon: 'circle-check' },
  closed:       { label: 'ปิดเคส',          cls: 'status-closed',      icon: 'lock' },
  cancelled:    { label: 'ยกเลิก',          cls: 'status-cancelled',   icon: 'ban' },
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
