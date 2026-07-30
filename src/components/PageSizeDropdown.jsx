import { useState, useEffect, useRef } from 'react';

export default function PageSizeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = [10, 30, 50];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-light)',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.18s ease',
          minWidth: '68px',
        }}
      >
        <span>{value}</span>
        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: 9,
            color: 'var(--text-muted)',
            transition: 'transform 0.18s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Dropdown Panel - Opens Upwards */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 6px)',
          left: 0,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.13), 0 2px 8px rgba(37,99,235,0.08)',
          zIndex: 1000,
          overflow: 'hidden',
          minWidth: '80px',
          animation: 'dropdownIn 0.15s ease',
        }}>
          {options.map(val => (
            <button
              key={val}
              type="button"
              onClick={() => {
                onChange(val);
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: value === val ? 'var(--primary-pale)' : 'transparent',
                color: value === val ? 'var(--primary)' : 'var(--text-primary)',
                fontSize: 13,
                fontWeight: value === val ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (value !== val) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)';
              }}
              onMouseLeave={(e) => {
                if (value !== val) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>{val}</span>
              {value === val && <i className="fa-solid fa-check" style={{ fontSize: 10, color: 'var(--primary)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
