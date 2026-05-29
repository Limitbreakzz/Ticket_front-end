import { calcSLA, calcResponseSLA, SLA_STATUS_CONFIG, SLA_POLICY, formatDuration, formatDeadline } from '../utils/sla';

/**
 * Compact inline SLA badge — used in ticket tables.
 */
export function SLABadge({ ticket }) {
  const sla = calcSLA(ticket);
  if (!sla) return null;
  const cfg = SLA_STATUS_CONFIG[sla.slaStatus];

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
        <i className={`fa-solid fa-${cfg.icon}`}  aria-hidden="true"></i> {cfg.label}
      </span>
    </div>
  );
}

/**
 * Progress bar strip — shows % of SLA consumed.
 */
export function SLABar({ ticket, showLabel = true }) {
  const sla = calcSLA(ticket);
  if (!sla) return null;
  const cfg = SLA_STATUS_CONFIG[sla.slaStatus];

  const pct = Math.round(sla.pct);
  const remaining = sla.remainingH > 0
    ? `เหลืออีก ${formatDuration(sla.remainingH)}`
    : `เกินกำหนด ${formatDuration(Math.abs(sla.remainingH))}`;

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>
            <i className={`fa-solid fa-${cfg.icon}`}  aria-hidden="true"></i> {cfg.label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {sla.isClosed ? (sla.slaStatus === 'met' ? 'สำเร็จภายในเวลา' : 'ไม่ทันกำหนด') : remaining}
          </span>
        </div>
      )}
      <div style={{
        height: 6, background: 'var(--bg-main)',
        borderRadius: 'var(--radius-full)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: cfg.color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.6s ease',
        }} />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {formatDuration(sla.elapsedH)} / {sla.policy.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
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
        borderLeft: `4px solid ${cfgResp.color}`,
        borderRadius: 'var(--radius-lg)',
        background: cfgResp.bg,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}><i className={`fa-solid fa-${cfgResp.icon}`}  aria-hidden="true"></i></span>
          <span style={{ fontWeight: 800, color: cfgResp.color, fontSize: 13.5 }}>
            SLA การรับเรื่อง (Response Time) — {cfgResp.label}
          </span>
          <span style={{
            marginLeft: 'auto',
            background: cfgResp.color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}>
            {Math.round(slaResp.pct)}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 'var(--radius-full)', marginBottom: 10 }}>
          <div style={{
            height: '100%', width: `${slaResp.pct}%`,
            background: cfgResp.color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s ease',
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
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
        borderLeft: `4px solid ${cfgRes.color}`,
        borderRadius: 'var(--radius-lg)',
        background: cfgRes.bg,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}><i className={`fa-solid fa-${cfgRes.icon}`}  aria-hidden="true"></i></span>
          <span style={{ fontWeight: 800, color: cfgRes.color, fontSize: 13.5 }}>
            SLA การแก้ไข (Resolution Time) — {cfgRes.label}
          </span>
          <span style={{
            marginLeft: 'auto',
            background: cfgRes.color,
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}>
            {Math.round(slaRes.pct)}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 'var(--radius-full)', marginBottom: 10 }}>
          <div style={{
            height: '100%', width: `${slaRes.pct}%`,
            background: cfgRes.color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s ease',
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
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
      <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
