import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const { loginUser } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) { 
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'); 
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return; 
    }
    setError('');
    setLoading(true);
    try {
      await loginUser(normalizedUsername, password);
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        {/* Base Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }} />
        
        {/* Wavy Shapes */}
        <svg viewBox="0 0 1440 800" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', minHeight: '60%', opacity: 0.8 }} preserveAspectRatio="none">
          <path fill="rgba(30, 41, 59, 0.5)" d="M0,320L48,298.7C96,277,192,235,288,234.7C384,235,480,277,576,288C672,299,768,277,864,245.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z" />
          <path fill="rgba(56, 189, 248, 0.05)" d="M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,138.7C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z" />
          <path fill="rgba(59, 130, 246, 0.08)" d="M0,64L48,85.3C96,107,192,149,288,149.3C384,149,480,107,576,106.7C672,107,768,149,864,165.3C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z" />
        </svg>

        <svg viewBox="0 0 1440 800" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto', minHeight: '60%', opacity: 0.6, transform: 'rotate(180deg)' }} preserveAspectRatio="none">
          <path fill="rgba(30, 41, 59, 0.4)" d="M0,160L80,149.3C160,139,320,117,480,128C640,139,800,181,960,186.7C1120,192,1280,160,1360,144L1440,128L1440,800L1360,800C1280,800,1120,800,960,800C800,800,640,800,480,800C320,800,160,800,80,800L0,800Z" />
        </svg>
        
        {/* Glow Blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .pw-toggle-btn:focus, .pw-toggle-btn:active {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          transform: translateY(-50%) !important;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20, zIndex: 10 }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', marginBottom: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <i className="fa-solid fa-ticket" style={{ fontSize: 28, color: '#3b82f6' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px', color: '#ffffff' }}>TicketHub Pro</h1>
          <p style={{ fontSize: 13.5, opacity: 0.7, margin: 0, color: '#94a3b8' }}>ระบบจัดการ Ticket โรงงาน</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: 24,
          padding: '36px 36px 30px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-right-to-bracket" style={{ color: '#3b82f6', fontSize: 16 }} />
            เข้าสู่ระบบ
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Username */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                ชื่อผู้ใช้
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-user" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748b' }} />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ชื่อผู้ใช้"
                  autoComplete="username"
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 13.5, outline: 'none', background: 'rgba(15, 23, 42, 0.4)',
                    color: '#ffffff', boxSizing: 'border-box',
                    transition: 'all 0.18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = 'rgba(15, 23, 42, 0.6)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(15, 23, 42, 0.4)'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748b' }} />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '11px 42px 11px 40px',
                    borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 13.5, outline: 'none', background: 'rgba(15, 23, 42, 0.4)',
                    color: '#ffffff', boxSizing: 'border-box',
                    transition: 'all 0.18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = 'rgba(15, 23, 42, 0.6)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(15, 23, 42, 0.4)'; }}
                />
                <button
                  type="button"
                  className="pw-toggle-btn"
                  onClick={() => setShowPw(p => !p)}
                  onMouseDown={e => e.preventDefault()}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: 13,
                    padding: 4,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className={`fa-solid fa-eye${showPw ? '-slash' : ''}`} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
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
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.18s',
                boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.35)'; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.25)'; } }}
            >
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin" /> กำลังเข้าสู่ระบบ...</>
                : <><i className="fa-solid fa-right-to-bracket" /> เข้าสู่ระบบ</>
              }
            </button>
          </form>

        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', margin: 0 }}>
          TicketHub Pro v1.0 · Factory Maintenance System
        </p>
      </div>
    </div>
  );
}
