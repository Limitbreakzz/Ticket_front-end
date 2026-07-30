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
    label: 'หัวหน้างาน',
    name: 'วิภา รักดี',
    initials: 'วภ',
    color: '#10b981',
    desc: 'หัวหน้างาน',
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
        { id: 'my-own-tickets',  icon: 'user-check',           label: 'งานในการดูแลของฉัน' },
        { id: 'track',           icon: 'user',                 label: 'Ticket ของฉัน' },
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
        { id: 'create-ticket',   icon: 'circle-plus',          label: 'สร้าง Ticket' },
      ],
    },
    {
      section: 'งานของฉัน',
      items: [
        { id: 'my-own-tickets',  icon: 'user-check',           label: 'งานในการดูแลของฉัน' },
        { id: 'track',           icon: 'user',                 label: 'Ticket ของฉัน' },
        { id: 'my-sent-tickets', icon: 'paper-plane',          label: 'Ticket ที่แผนกเราส่งไป', badgeColor: 'blue' },
        { id: 'all-dept-tickets',icon: 'building-user',        label: 'Ticket ทั้งหมดของแผนก', badgeColor: 'blue' },
        { id: 'approval',        icon: 'clipboard-check',      label: 'รออนุมัติ' },
        { id: 'escalated',       icon: 'triangle-exclamation', label: 'เร่งด่วน/วิกฤต' },
      ],
    },
    {
      section: 'รายงาน & ภาพรวมแผนก',
      items: [
        { id: 'reports',         icon: 'chart-line',           label: 'รายงานผลงานประจำแผนก' },
        { id: 'sla',             icon: 'clock',                label: 'ติดตาม SLA ประจำแผนก' },
      ],
    },
  ],
  [ROLES.ADMIN]: [
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
        { id: 'my-own-tickets',  icon: 'user-check',           label: 'งานในการดูแลของฉัน' },
        { id: 'track',           icon: 'user',                 label: 'Ticket ของฉัน' },
        { id: 'all-tickets',     icon: 'layer-group',          label: 'Ticket ทั้งหมด', badgeColor: 'blue' },
        { id: 'approval',        icon: 'clipboard-check',      label: 'รออนุมัติ' },
        { id: 'escalated',       icon: 'triangle-exclamation', label: 'เร่งด่วน/วิกฤต' },
      ],
    },
    {
      section: 'การควบคุมระบบ',
      items: [
        { id: 'reports',         icon: 'chart-line',           label: 'รายงาน & วิเคราะห์' },
        { id: 'sla',             icon: 'clock',                label: 'ติดตาม SLA' },
        { id: 'settings',        icon: 'gear',                 label: 'ตั้งค่า Webhook' },
      ],
    },
  ],
};

// ── CATEGORIES ──
export const CATEGORIES = {
  hardware: {
    label: 'ฮาร์ดแวร์ / อุปกรณ์',
    icon: 'desktop',
    sub: ['คอมพิวเตอร์ / โน้ตบุ๊ก', 'หน้าจอ / จอภาพ', 'ปริ้นเตอร์', 'คีย์บอร์ด / เมาส์', 'อุปกรณ์อื่นๆ'],
  },
  software: {
    label: 'ซอฟต์แวร์ / โปรแกรม',
    icon: 'laptop-code',
    sub: ['OS (Windows / macOS)', 'Microsoft 365 / Outlook', 'ERP / ระบบงานภายใน', 'ติดตั้ง / อัปเดตโปรแกรม', 'ซอฟต์แวร์อื่นๆ'],
  },
  network: {
    label: 'อินเทอร์เน็ต / Wi-Fi',
    icon: 'wifi',
    sub: ['ต่อ Wi-Fi ไม่ได้', 'เน็ตสายแลนเสีย', 'VPN / เข้าถึงระยะไกล', 'เน็ตช้า / หลุดบ่อย', 'ระบบเครือข่ายอื่นๆ'],
  },
  access: {
    label: 'สิทธิ์เข้าใช้งาน',
    icon: 'key',
    sub: ['รีเซ็ตรหัสผ่าน / ปลดล็อกบัญชี', 'ขอสิทธิ์โฟลเดอร์แชร์', 'ขอสิทธิ์ใช้งานโปรแกรม / อีเมล', 'บัตรพนักงาน / สิทธิ์เข้าออกอาคาร', 'สิทธิ์เข้าใช้งานอื่นๆ'],
  },
  other: {
    label: 'ทั่วไป / บริการอื่นๆ',
    icon: 'circle-info',
    sub: ['ขอโต๊ะทำงาน / เก้าอี้', 'อุปกรณ์สำนักงาน / เครื่องเขียน', 'ประสานงานนักศึกษาฝึกงาน', 'ขอคำปรึกษา / แนะนำทั่วไป', 'บริการและคำขอทั่วไปอื่นๆ'],
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
];

// ── MOCK TICKETS ──
let idCounter = 9;
export const generateId = () => {
  idCounter++;
  return `TK-${new Date().getFullYear()}-${String(idCounter).padStart(3, '0')}`;
};

export const INITIAL_TICKETS = [];
