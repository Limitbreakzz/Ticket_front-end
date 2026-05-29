import { useState } from 'react';
import { useApp } from '../context/AppContext';

const DEMO_ACCOUNTS = [
  { email: 'employee@tickethub.com', password: 'password123', label: 'พนักงานทั่วไป', name: 'สมชาย ใจดี', color: '#2563eb', initials: 'สช', dept: 'ฝ่ายผลิต 1', icon: 'user' },
  { email: 'manager@tickethub.com',  password: 'password123', label: 'หัวหน้าแผนก', name: 'วิภา รักดี',   color: '#10b981', initials: 'วภ', dept: 'ฝ่ายซ่อมบำรุง', icon: 'user-tie' },
  { email: 'admin@tickethub.com',    password: 'password123', label: 'ผู้ดูแลระบบ', name: 'ธนา สมบูรณ์', color: '#7c3aed', initials: 'ธน', dept: 'ส่วนกลาง', icon: 'user-gear' },
];

export default function LoginView() {
  const { loginUser } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setError('กรุณากรอก Email และ Password'); return; }
    setError('');
    setLoading(true);
    try {
      await loginUser(normalizedEmail, password);
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (acc) => {
    setError('');
    setLoading(true);
    try {
      await loginUser(acc.email, acc.password);
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 40%, #2563eb 70%, #0ea5e9 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '10%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', marginBottom: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <i className="fa-solid fa-ticket" style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>TicketHub Pro</h1>
          <p style={{ fontSize: 13.5, opacity: 0.75, margin: 0 }}>ระบบจัดการ Ticket โรงงาน</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 20,
          padding: '32px 32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-right-to-bracket" style={{ color: 'var(--primary)', fontSize: 16 }} />
            เข้าสู่ระบบ
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                อีเมล
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  autoComplete="username"
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)',
                    fontSize: 13.5, outline: 'none', background: 'var(--bg-main)',
                    color: 'var(--text-primary)', boxSizing: 'border-box',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '11px 42px 11px 40px',
                    borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)',
                    fontSize: 13.5, outline: 'none', background: 'var(--bg-main)',
                    color: 'var(--text-primary)', boxSizing: 'border-box',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: 4 }}
                >
                  <i className={`fa-solid fa-eye${showPw ? '-slash' : ''}`} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-circle-xmark" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: '13px',
                borderRadius: 'var(--radius-md)',
                background: loading ? 'var(--primary-lighter)' : 'var(--primary)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.18s, transform 0.1s',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> กำลังเข้าสู่ระบบ...</>
                : <><i className="fa-solid fa-right-to-bracket" /> เข้าสู่ระบบ</>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 18px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>หรือเข้าสู่ระบบด้วยบัญชีทดสอบ</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                id={`demo-${acc.label.toLowerCase()}`}
                onClick={() => handleDemo(acc)}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px',
                  border: `1.5px solid ${acc.color}25`,
                  borderRadius: 'var(--radius-md)',
                  background: `${acc.color}08`,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.18s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${acc.color}15`; e.currentTarget.style.borderColor = `${acc.color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${acc.color}08`; e.currentTarget.style.borderColor = `${acc.color}25`; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: acc.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {acc.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{acc.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{acc.label} · {acc.dept}</div>
                </div>
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, color: acc.color, opacity: 0.7 }} />
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          TicketHub Pro v1.0 · Factory Maintenance System
        </p>
      </div>
    </div>
  );
}
