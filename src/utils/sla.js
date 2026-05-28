/**
 * SLA Utility — HelpdeskPro
 * ─────────────────────────
 * SLA deadline (business hours) per urgency level.
 * "Business hours" = 08:00–17:00, Mon–Fri.
 *
 * For the demo we treat all time as calendar hours (simpler, still meaningful).
 */

export const SLA_POLICY = {
  critical: { hours: 1,   label: '1 ชั่วโมง',    desc: 'Line Stop! ต้องแก้ไขภายใน 1 ชม.' },
  high:     { hours: 4,   label: '4 ชั่วโมง',    desc: 'เร่งด่วน ต้องแก้ไขภายใน 4 ชม.' },
  medium:   { hours: 24,  label: '1 วัน',         desc: 'ต้องแก้ไขภายใน 1 วันทำการ' },
  low:      { hours: 72,  label: '3 วัน',         desc: 'ต้องแก้ไขภายใน 3 วันทำการ' },
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
  // "28 พ.ค. 2567, 08:30"
  const m = str.match(/(\d+)\s+(\S+)\s+(\d+),\s+(\d+):(\d+)/);
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
  return `${(days / 30).toFixed(1)} เดือน`;
}

/**
 * Core SLA calculator.
 *
 * @param {object} ticket  — ticket object with `urgency`, `createdAt`, `updatedAt`, `status`
 * @param {Date}   now     — current time (injectable for testing)
 * @returns {object} SLA info
 */
export function calcSLA(ticket, now = new Date()) {
  const policy = SLA_POLICY[ticket.urgency];
  if (!policy) return null;

  const createdDate = parseThaiDate(ticket.createdAt);
  if (!createdDate) return null;

  const isClosed = CLOSED_STATUSES.has(ticket.status);
  const referenceDate = isClosed ? parseThaiDate(ticket.updatedAt) || now : now;

  // Elapsed hours since ticket creation
  const elapsedMs  = referenceDate - createdDate;
  const elapsedH   = elapsedMs / (1000 * 60 * 60);

  const deadlineH  = policy.hours;
  const remainingH = deadlineH - elapsedH;
  const pct        = Math.min((elapsedH / deadlineH) * 100, 100);

  // SLA status
  let slaStatus;
  if (isClosed) {
    slaStatus = elapsedH <= deadlineH ? 'met' : 'missed';
  } else {
    if (remainingH <= 0)                        slaStatus = 'breached';
    else if (pct >= 75)                         slaStatus = 'at-risk';
    else                                        slaStatus = 'on-track';
  }

  // Deadline absolute time
  const deadlineDate = new Date(createdDate.getTime() + deadlineH * 3600 * 1000);

  return {
    policy,
    elapsedH,
    remainingH,
    pct,
    slaStatus,   // 'on-track' | 'at-risk' | 'breached' | 'met' | 'missed'
    deadlineDate,
    isClosed,
  };
}

/** Display config per slaStatus */
export const SLA_STATUS_CONFIG = {
  'on-track': { label: 'ทันเวลา',     color: '#10b981', bg: '#d1fae5', icon: 'check' },
  'at-risk':  { label: 'ใกล้หมดเวลา', color: '#f59e0b', bg: '#fef3c7', icon: 'triangle-exclamation' },
  'breached': { label: 'เกิน SLA',    color: '#ef4444', bg: '#fee2e2', icon: 'circle-xmark' },
  'met':      { label: 'ผ่าน SLA',   color: '#10b981', bg: '#d1fae5', icon: 'trophy' },
  'missed':   { label: 'ไม่ผ่าน SLA', color: '#ef4444', bg: '#fee2e2', icon: 'circle-exclamation' },
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

  let onTrack = 0, atRisk = 0, breached = 0, met = 0, missed = 0;

  tickets.forEach(t => {
    const s = calcSLA(t);
    if (!s) return;
    if (s.slaStatus === 'on-track') onTrack++;
    else if (s.slaStatus === 'at-risk') atRisk++;
    else if (s.slaStatus === 'breached') breached++;
    else if (s.slaStatus === 'met') met++;
    else if (s.slaStatus === 'missed') missed++;
  });

  const metRate = closed.length
    ? Math.round((met / closed.length) * 100)
    : null;

  return { onTrack, atRisk, breached, met, missed, metRate, activeCount: active.length, closedCount: closed.length };
}
