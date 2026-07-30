/**
 * SLA Utility — HelpdeskPro
 * ─────────────────────────
 * SLA deadline (business hours) per urgency level.
 * "Business hours" = 08:00–17:00, Mon–Fri.
 *
 * For the demo we treat all time as calendar hours (simpler, still meaningful).
 */

export const SLA_POLICY = {
  critical: { hours: 4,   label: '4 ชั่วโมง',    desc: 'วิกฤต! ต้องแก้ไขภายใน 4 ชม.' },
  high:     { hours: 8,   label: '8 ชั่วโมง',    desc: 'เร่งด่วน! ต้องแก้ไขภายใน 8 ชม.' },
  medium:   { hours: 24,  label: '24 ชั่วโมง',   desc: 'ต้องแก้ไขภายใน 24 ชม.' },
  low:      { hours: 72,  label: '72 ชั่วโมง',   desc: 'ต้องแก้ไขภายใน 72 ชม.' },
};

export const SLA_RESPONSE_POLICY = {
  critical: { hours: 0.25, label: '15 นาที',    desc: 'วิกฤต! ต้องรับเรื่องภายใน 15 นาที' },
  high:     { hours: 0.5,  label: '30 นาที',    desc: 'เร่งด่วน! ต้องรับเรื่องภายใน 30 นาที' },
  medium:   { hours: 2,    label: '2 ชั่วโมง',   desc: 'ต้องรับเรื่องภายใน 2 ชั่วโมง' },
  low:      { hours: 4,    label: '4 ชั่วโมง',   desc: 'ต้องรับเรื่องภายใน 4 ชั่วโมง' },
};

// Ticket statuses that are "closed" (SLA no longer counts)
export const CLOSED_STATUSES = new Set(['resolved', 'closed', 'rejected']);

/**
 * Parse a Thai date string like "28 พ.ค. 2567, 08:30"
 * into a JS Date (Buddhist year → Gregorian year).
 */
const THAI_MONTHS = {
  'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3,
  'พ.ค.': 4, 'มิ.ย.': 5, 'ก.ค.': 6, 'ส.ค.': 7,
  'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11,
};

export function parseThaiDate(str) {
  if (!str) return null;
  // Support formats like "28 พ.ค. 2567, 08:30" or "28 พ.ค. 2567 08:30" or "28 พ.ค. 2567 เวลา 08:30"
  const m = str.match(/(\d+)\s+(\S+)\s+(\d+)[,\s]*?(?:เวลา)?\s*?(\d+):(\d+)/);
  if (!m) return null;
  const [, day, monthThai, buddYear, hour, min] = m;
  const month = THAI_MONTHS[monthThai];
  if (month === undefined) return null;
  const year = parseInt(buddYear) - 543; // Buddhist → Gregorian
  return new Date(year, month, parseInt(day), parseInt(hour), parseInt(min));
}

/**
 * Format a duration in hours to a human-readable string.
 */
export function formatDuration(hours) {
  if (hours < 1)       return `${Math.round(hours * 60)} นาที`;
  if (hours < 24)      return `${hours.toFixed(1)} ชั่วโมง`;
  const days = hours / 24;
  if (days < 30)       return `${days.toFixed(1)} วัน`;
  return `${(days / 30).toFixed(1)} วัน`;
}

/**
 * Core SLA calculator.
 *
 * @param {object} ticket  — ticket object with `urgency`, `createdAt`, `updatedAt`, `status`
 * @param {Date}   now     — current time (injectable for testing)
 * @returns {object} SLA info
 */
export function calcSLA(ticket, now = new Date()) {
  const createdDate = ticket.rawCreatedAt 
    ? new Date(ticket.rawCreatedAt) 
    : parseThaiDate(ticket.createdAt);

  let deadlineDate = ticket.slaDueDate ? new Date(ticket.slaDueDate) : null;
  const policy = SLA_POLICY[ticket.urgency || 'medium'];
  if (!policy) return null;

  const acceptedDate = ticket.acceptedAt ? new Date(ticket.acceptedAt) : null;

  if (!acceptedDate || isNaN(acceptedDate.getTime())) {
    const fallbackDeadline = deadlineDate || (createdDate ? new Date(createdDate.getTime() + policy.hours * 3600 * 1000) : null);
    return {
      policy,
      elapsedH: 0,
      remainingH: policy.hours,
      pct: 0,
      slaStatus: 'not-started',
      deadlineDate: fallbackDeadline,
      isClosed: false,
    };
  }

  const isClosed = CLOSED_STATUSES.has(ticket.status);
  const referenceDate = isClosed 
    ? (ticket.rawUpdatedAt ? new Date(ticket.rawUpdatedAt) : parseThaiDate(ticket.updatedAt)) || now 
    : now;

  if (!deadlineDate || isNaN(deadlineDate.getTime())) {
    deadlineDate = new Date(acceptedDate.getTime() + policy.hours * 3600 * 1000);
  }

  // Elapsed hours since ticket acceptance
  const elapsedMs  = referenceDate - acceptedDate;
  const elapsedH   = elapsedMs / (1000 * 60 * 60);

  // The remaining hours until the deadline
  const remainingH = (deadlineDate - referenceDate) / (1000 * 60 * 60);

  // The total allotted hours from acceptance to deadline
  const limitH = Math.max(0.1, (deadlineDate - acceptedDate) / (1000 * 60 * 60));
  
  // Calculate percentage based on elapsed time since acceptance vs total allotted time
  const pct = Math.min(100, Math.max(0, (elapsedH / limitH) * 100));

  // SLA status
  let slaStatus;
  if (isClosed) {
    slaStatus = referenceDate <= deadlineDate ? 'met' : 'missed';
  } else {
    if (remainingH <= 0)                        slaStatus = 'breached';
    else if (pct >= 75)                         slaStatus = 'at-risk';
    else                                        slaStatus = 'on-track';
  }

  return {
    policy,
    elapsedH,
    remainingH,
    pct,
    slaStatus,   // 'not-started' | 'on-track' | 'at-risk' | 'breached' | 'met' | 'missed'
    deadlineDate,
    isClosed,
  };
}

/**
 * Response SLA calculator.
 *
 * @param {object} ticket  — ticket object
 * @param {Date}   now     — current time
 * @returns {object} SLA info
 */
export function calcResponseSLA(ticket, now = new Date()) {
  const policy = SLA_RESPONSE_POLICY[ticket.urgency] || SLA_RESPONSE_POLICY.medium;

  const createdDate = ticket.rawCreatedAt 
    ? new Date(ticket.rawCreatedAt) 
    : parseThaiDate(ticket.createdAt);
  if (!createdDate || isNaN(createdDate.getTime())) return null;

  // Considered acknowledged if assignedTo is not 'รอมอบหมาย' and not empty, or status is not 'pending'
  const isAcknowledged = (ticket.assignedTo && ticket.assignedTo !== 'รอมอบหมาย') || !['pending', 'new'].includes(ticket.status);
  const ackDate = isAcknowledged 
    ? (ticket.rawUpdatedAt ? new Date(ticket.rawUpdatedAt) : parseThaiDate(ticket.updatedAt)) || now
    : now;

  const elapsedMs = ackDate - createdDate;
  const elapsedH = elapsedMs / (1000 * 60 * 60);

  const deadlineH = policy.hours;
  const remainingH = deadlineH - elapsedH;
  const pct = Math.min((elapsedH / deadlineH) * 100, 100);

  let slaStatus;
  if (isAcknowledged) {
    slaStatus = elapsedH <= deadlineH ? 'met' : 'missed';
  } else {
    if (remainingH <= 0)                        slaStatus = 'breached';
    else if (pct >= 75)                         slaStatus = 'at-risk';
    else                                        slaStatus = 'on-track';
  }

  const deadlineDate = new Date(createdDate.getTime() + deadlineH * 3600 * 1000);

  return {
    policy,
    elapsedH,
    remainingH,
    pct,
    slaStatus,   // 'on-track' | 'at-risk' | 'breached' | 'met' | 'missed'
    deadlineDate,
    isClosed: isAcknowledged,
  };
}

/** Display config per slaStatus */
export const SLA_STATUS_CONFIG = {
  'not-started': { label: 'รอรับงาน (ยังไม่นับ)', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', icon: 'clock' },
  'on-track': { label: 'ยังอยู่ในเกณฑ์', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)', icon: 'check' },
  'at-risk':  { label: 'ใกล้ครบกำหนด', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: 'triangle-exclamation' },
  'breached': { label: 'เกินกำหนด (ยังไม่เสร็จ)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: 'circle-xmark' },
  'met':      { label: 'เสร็จทันกำหนด',   color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: 'circle-check' },
  'missed':   { label: 'เสร็จเกินกำหนด', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', icon: 'circle-xmark' },
};

/**
 * Format the deadline date to a readable Thai-style string.
 */
export function formatDeadline(date) {
  if (!date) return '—';
  return date.toLocaleString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Aggregate SLA stats from a list of tickets */
export function aggregateSLAStats(tickets) {
  const active   = tickets.filter(t => !CLOSED_STATUSES.has(t.status));
  const closed   = tickets.filter(t => CLOSED_STATUSES.has(t.status));

  let onTrack = 0, atRisk = 0, breached = 0, met = 0, missed = 0, notStarted = 0;

  tickets.forEach(t => {
    const s = calcSLA(t);
    if (!s) return;
    if (s.slaStatus === 'not-started') notStarted++;
    else if (s.slaStatus === 'on-track') onTrack++;
    else if (s.slaStatus === 'at-risk') atRisk++;
    else if (s.slaStatus === 'breached') breached++;
    else if (s.slaStatus === 'met') met++;
    else if (s.slaStatus === 'missed') missed++;
  });

  const metRate = closed.length
    ? Math.round((met / closed.length) * 100)
    : null;

  return { onTrack, atRisk, breached, met, missed, notStarted, metRate, activeCount: active.length, closedCount: closed.length };
}
