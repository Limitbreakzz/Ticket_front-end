import { calcSLA, calcResponseSLA, SLA_STATUS_CONFIG, formatDuration, formatDeadline } from '../utils/sla';

const RESPONSE_SLA_LABELS = {
  'not-started': 'รอรับเรื่อง',
  'on-track': 'ยังอยู่ในเกณฑ์',
  'at-risk': 'ใกล้เกินเวลารับเรื่อง',
  'breached': 'เกินเวลารับเรื่อง',
  'met': 'รับเรื่องทันเวลา',
  'missed': 'รับเรื่องเกินเวลา',
};

const RESOLUTION_SLA_LABELS = {
  'not-started': 'รอรับงาน (ยังไม่นับ)',
  'on-track': 'ยังอยู่ในเกณฑ์',
  'at-risk': 'ใกล้ครบกำหนด',
  'breached': 'เกินกำหนด (ยังไม่เสร็จ)',
  'met': 'เสร็จทันกำหนด',
  'missed': 'เสร็จเกินกำหนด',
};

/**
 * Compact inline SLA badge — used in ticket tables.
 */
export function SLABadge({ ticket }) {
  // A ticket is considered acknowledged if it has an agent assigned or status is not pending/new
  const isAcknowledged = (ticket.assignedTo && ticket.assignedTo !== 'รอมอบหมาย') || !['pending', 'new', 'wait-approve'].includes(ticket.status);

  if (!isAcknowledged) {
    // Show Response SLA status
    const slaResp = calcResponseSLA(ticket);
    if (!slaResp) return null;
    const cfgResp = SLA_STATUS_CONFIG[slaResp.slaStatus];
    const displayLabel = RESPONSE_SLA_LABELS[slaResp.slaStatus] || cfgResp.label;

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: cfgResp.bg,
          color: cfgResp.color,
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          <i className={`fa-solid fa-${cfgResp.icon}`} aria-hidden="true"></i> {displayLabel}
        </span>
      </div>
    );
  } else {
    // Show Resolution SLA status
    const sla = calcSLA(ticket);
    if (!sla) return null;
    const cfg = SLA_STATUS_CONFIG[sla.slaStatus];
    const displayLabel = RESOLUTION_SLA_LABELS[sla.slaStatus] || cfg.label;

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: cfg.bg,
          color: cfg.color,
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          <i className={`fa-solid fa-${cfg.icon}`} aria-hidden="true"></i> {displayLabel}
        </span>
      </div>
    );
  }
}

/**
 * Progress bar strip — shows % of SLA consumed.
 */
export function SLABar({ ticket, showLabel = true, showBottomLabel = true, stackLabel = false }) {
  // A ticket is considered acknowledged if it has an agent assigned or status is not pending/new
  const isAcknowledged = (ticket.assignedTo && ticket.assignedTo !== 'รอมอบหมาย') || !['pending', 'new', 'wait-approve'].includes(ticket.status);

  const sla = isAcknowledged ? calcSLA(ticket) : calcResponseSLA(ticket);
  if (!sla) return null;
  const cfg = SLA_STATUS_CONFIG[sla.slaStatus];
  const displayLabel = isAcknowledged 
    ? (RESOLUTION_SLA_LABELS[sla.slaStatus] || cfg.label)
    : (RESPONSE_SLA_LABELS[sla.slaStatus] || cfg.label);

  const pct = Math.round(sla.pct);
  const remaining = sla.slaStatus === 'not-started'
    ? 'ยังไม่เริ่ม'
    : (sla.remainingH > 0
      ? `เหลืออีก ${formatDuration(sla.remainingH)}`
      : `เกินกำหนด ${formatDuration(Math.abs(sla.remainingH))}`);

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          flexDirection: stackLabel ? 'column' : 'row',
          justifyContent: stackLabel ? 'flex-start' : 'space-between',
          alignItems: stackLabel ? 'flex-start' : 'center',
          marginBottom: 4,
          gap: stackLabel ? 2 : 8
        }}>
          <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
            <i className={`fa-solid fa-${cfg.icon}`}  aria-hidden="true"></i> {displayLabel}
          </span>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {sla.isClosed ? (sla.slaStatus === 'met' ? (isAcknowledged ? 'แก้ไขเสร็จทันเวลา' : 'รับเรื่องทันเวลา') : (isAcknowledged ? 'ไม่ทันกำหนดการแก้ไข' : 'ไม่ทันกำหนดการรับเรื่อง')) : remaining}
          </span>
        </div>
      )}
      <div style={{
        height: 6, background: 'var(--bg-main)',
        borderRadius: 'var(--radius-full)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: '100%',
          transform: `scaleX(${sla.isClosed ? 1 : Math.min(100, Math.max(0, pct)) / 100})`,
          transformOrigin: 'left',
          background: cfg.color,
          borderRadius: 'var(--radius-full)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
      {showLabel && showBottomLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {formatDuration(sla.elapsedH)} / {sla.policy.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            ครบ: {formatDeadline(sla.deadlineDate)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Full SLA detail block — used in ticket detail modal.
 */
export function SLADetail({ ticket }) {
  const slaRes = calcSLA(ticket);
  const slaResp = calcResponseSLA(ticket);
  if (!slaRes || !slaResp) return null;

  const cfgRes = SLA_STATUS_CONFIG[slaRes.slaStatus];
  const cfgResp = SLA_STATUS_CONFIG[slaResp.slaStatus];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Response SLA */}
      <div style={{
        border: `1.5px solid ${cfgResp.color}40`,
        borderRadius: 'var(--radius-lg)',
        background: cfgResp.bg,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16, color: cfgResp.color, marginTop: 1 }}><i className={`fa-solid fa-${cfgResp.icon}`}  aria-hidden="true"></i></span>
          <span style={{ fontWeight: 800, color: cfgResp.color, fontSize: 13.5, flex: 1, lineHeight: '1.4' }}>
            เป้าหมายเวลารับเรื่อง (Response Time Target) — {RESPONSE_SLA_LABELS[slaResp.slaStatus] || cfgResp.label}
          </span>
          <span style={{
            background: cfgResp.color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            flexShrink: 0,
            marginLeft: 8,
          }}>
            {slaResp.isClosed ? (slaResp.slaStatus === 'met' ? 'สำเร็จ' : 'เกินกำหนด') : `${Math.round(slaResp.pct)}%`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--bg-main)', borderRadius: 'var(--radius-full)', marginBottom: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '100%',
            transform: `scaleX(${slaResp.isClosed ? 1 : Math.min(100, Math.max(0, slaResp.pct)) / 100})`,
            transformOrigin: 'left',
            background: cfgResp.color,
            borderRadius: 'var(--radius-full)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>

        <div className="sla-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
          <SLARow label="เกณฑ์เวลาตอบรับ" value={slaResp.policy.label} />
          <SLARow label="เส้นตายรับเรื่อง" value={formatDeadline(slaResp.deadlineDate)} />
          <SLARow label="เวลาที่ใช้" value={formatDuration(slaResp.elapsedH)} />
          {!slaResp.isClosed && slaResp.remainingH > 0 && (
            <SLARow label="เวลาที่เหลือ" value={formatDuration(slaResp.remainingH)} highlight={slaResp.slaStatus === 'at-risk'} />
          )}
          {!slaResp.isClosed && slaResp.remainingH <= 0 && (
            <SLARow label="เกินกำหนด" value={formatDuration(Math.abs(slaResp.remainingH))} danger />
          )}
          {slaResp.isClosed && (
            <SLARow label="ผลการตอบรับ" value={slaResp.slaStatus === 'met' ? 'รับเรื่องทันเวลา' : 'เกินกำหนดการรับเรื่อง'} danger={slaResp.slaStatus !== 'met'} />
          )}
        </div>
      </div>

      {/* 2. Resolution SLA */}
      <div style={{
        border: `1.5px solid ${cfgRes.color}40`,
        borderRadius: 'var(--radius-lg)',
        background: cfgRes.bg,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16, color: cfgRes.color, marginTop: 1 }}><i className={`fa-solid fa-${cfgRes.icon}`}  aria-hidden="true"></i></span>
          <span style={{ fontWeight: 800, color: cfgRes.color, fontSize: 13.5, flex: 1, lineHeight: '1.4' }}>
            เป้าหมายเวลาแก้ไข (Resolution Time Target) — {RESOLUTION_SLA_LABELS[slaRes.slaStatus] || cfgRes.label}
          </span>
          <span style={{
            background: cfgRes.color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            flexShrink: 0,
            marginLeft: 8,
          }}>
            {slaRes.isClosed ? (slaRes.slaStatus === 'met' ? 'สำเร็จ' : 'เกินกำหนด') : `${Math.round(slaRes.pct)}%`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--bg-main)', borderRadius: 'var(--radius-full)', marginBottom: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '100%',
            transform: `scaleX(${slaRes.isClosed ? 1 : Math.min(100, Math.max(0, slaRes.pct)) / 100})`,
            transformOrigin: 'left',
            background: cfgRes.color,
            borderRadius: 'var(--radius-full)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>

        <div className="sla-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
          <SLARow label="เกณฑ์เวลาแก้ไข" value={slaRes.policy.label} />
          <SLARow label="เส้นตายแก้ไขเสร็จ" value={formatDeadline(slaRes.deadlineDate)} />
          <SLARow label="เวลาที่ใช้" value={formatDuration(slaRes.elapsedH)} />
          {!slaRes.isClosed && slaRes.remainingH > 0 && (
            <SLARow label="เวลาที่เหลือ" value={formatDuration(slaRes.remainingH)} highlight={slaRes.slaStatus === 'at-risk'} />
          )}
          {!slaRes.isClosed && slaRes.remainingH <= 0 && (
            <SLARow label="เกินกำหนด" value={formatDuration(Math.abs(slaRes.remainingH))} danger />
          )}
          {slaRes.isClosed && (
            <SLARow label="ผลการแก้ไข" value={slaRes.slaStatus === 'met' ? 'แก้ไขเสร็จทันเวลา' : 'เกินกำหนดการแก้ไข'} danger={slaRes.slaStatus !== 'met'} />
          )}
        </div>
      </div>
    </div>
  );
}

function SLARow({ label, value, highlight, danger }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{
        fontSize: 12, fontWeight: 700,
        color: danger ? '#ef4444' : highlight ? '#d97706' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  );
}
