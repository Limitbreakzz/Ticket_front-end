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
      width: '100vw',
      height: '100vh',
      height: '100dvh',
      display: 'grid',
      gridTemplateColumns: '1fr',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans Thai', 'Inter', system-ui, sans-serif",
      background: 'var(--bg-main, #f8fafc)'
    }} className="auth-split-root">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @media (min-width: 900px) {
          .auth-split-root {
            grid-template-columns: 1.15fr 1fr !important;
          }
          .auth-showcase-panel {
            display: flex !important;
          }
          .mobile-brand-header {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .desktop-form-header {
            display: none !important;
          }
          .auth-form-container {
            padding: 24px 18px !important;
          }
          .auth-form-card {
            padding: 28px 22px 24px !important;
            border-radius: 20px !important;
          }
          .auth-watermark-tl {
            width: 260px !important;
            height: 260px !important;
            top: -100px !important;
            left: -100px !important;
          }
          .auth-watermark-tr {
            width: 320px !important;
            height: 320px !important;
            top: -60px !important;
            right: -80px !important;
          }
          .auth-watermark-bl {
            width: 360px !important;
            height: 360px !important;
            bottom: -90px !important;
            left: -90px !important;
          }
          .auth-watermark-mr {
            width: 260px !important;
            height: 260px !important;
            right: -90px !important;
          }
        }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* ── Left Column: Dark Navy Wavy Showcase Panel (Desktop Only) ── */}
      <div 
        className="auth-showcase-panel"
        style={{
          display: 'none',
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 48px',
          boxSizing: 'border-box',
          color: '#ffffff'
        }}
      >
        {/* GIF Background Overlay (Faded) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/bg.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        {/* Exact Decorative Wavy SVG Background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 800" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', minHeight: '60%', opacity: 0.8 }} preserveAspectRatio="none">
            <path fill="rgba(30, 41, 59, 0.5)" d="M0,320L48,298.7C96,277,192,235,288,234.7C384,235,480,277,576,288C672,299,768,277,864,245.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z" />
            <path fill="rgba(56, 189, 248, 0.05)" d="M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,138.7C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z" />
            <path fill="rgba(59, 130, 246, 0.08)" d="M0,64L48,85.3C96,107,192,149,288,149.3C384,149,480,107,576,106.7C672,107,768,149,864,165.3C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z" />
          </svg>

          {/* Glow Radial Blobs */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        {/* 1. Top Left App Brand Logo */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <img src="/icon.png" alt="App Icon" style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Ticket
          </span>
        </div>

        {/* 2. Center Hero Content Area */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560, margin: 'auto 0' }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#ffffff', lineHeight: 1.35, margin: 0, letterSpacing: '-0.5px' }}>
            ระบบจัดการปัญหาและงานบริการ <br />
            <span style={{ color: '#38bdf8' }}>
              ครอบคลุมทุกแผนกในองค์กร
            </span>
          </h1>

          <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            ศูนย์รวมการยื่นเรื่อง ติดตามสถานะคำขอ และประสานงานระหว่างแผนกได้อย่างรวดเร็วและมีประสิทธิภาพ
          </p>
        </div>

        {/* 3. Bottom Footer */}
        <div style={{ position: 'relative', zIndex: 10, fontSize: 12, color: '#64748b' }}>
          © 2026 Ticket Systems. All rights reserved.
        </div>
      </div>

      {/* ── Right Column: Off-White App Background Form Panel ── */}
      <div 
        className="auth-form-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          position: 'relative',
          zIndex: 10,
          overflowY: 'auto',
          background: 'var(--bg-main, #f8fafc)'
        }}
      >
        {/* Large Faded Watermark Web App Icons */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          <img 
            src="/icon.png" 
            alt="" 
            className="auth-watermark-tl"
            style={{ 
              position: 'absolute', 
              top: '-150px', 
              left: '-150px', 
              width: 320, 
              height: 320, 
              opacity: 0.045, 
              filter: 'grayscale(100%)',
              transform: 'rotate(35deg)'
            }} 
          />
          <img 
            src="/icon.png" 
            alt="" 
            className="auth-watermark-tr"
            style={{ 
              position: 'absolute', 
              top: '-80px', 
              right: '-100px', 
              width: 440, 
              height: 440, 
              opacity: 0.08, 
              filter: 'grayscale(100%)',
              transform: 'rotate(15deg)'
            }} 
          />
          <img 
            src="/icon.png" 
            alt="" 
            className="auth-watermark-bl"
            style={{ 
              position: 'absolute', 
              bottom: '-120px', 
              left: '-120px', 
              width: 520, 
              height: 520, 
              opacity: 0.07, 
              filter: 'grayscale(100%)',
              transform: 'rotate(-6deg)'
            }} 
          />
          <img 
            src="/icon.png" 
            alt="" 
            className="auth-watermark-mr"
            style={{ 
              position: 'absolute', 
              top: '40%', 
              right: '-140px', 
              width: 360, 
              height: 360, 
              opacity: 0.06, 
              filter: 'grayscale(100%)',
              transform: 'rotate(-28deg)'
            }} 
          />
        </div>

        <div style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'relative',
          zIndex: 10
        }}>
          {/* Mobile Centered Brand Header (Matches Same Clean Off-White Theme) */}
          <div className="mobile-brand-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 58, height: 58, borderRadius: 16,
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-light, #e2e8f0)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)'
            }}>
              <img src="/icon.png" alt="App Icon" style={{ width: 34, height: 34, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.4px' }}>
                Ticket
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                ยินดีต้อนรับ! กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
              </p>
            </div>
          </div>

          {/* Form Header Title (Desktop) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }} className="desktop-form-header">
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.5px' }}>
              เข้าสู่ระบบ
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #64748b)', margin: 0 }}>
              ยินดีต้อนรับ! กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
            </p>
          </div>

          {/* Form Card (Same Crisp White Card) */}
          <div 
            className="auth-form-card"
            style={{
              background: 'var(--bg-card, #ffffff)',
              borderRadius: 24,
              padding: '36px 32px 30px',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid var(--border-light, #e2e8f0)',
              animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-right-to-bracket" style={{ color: '#3b82f6', fontSize: 16 }} />
              เข้าสู่ระบบ
            </h2>

            <form onSubmit={handleSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Username Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="login-username" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary, #475569)', letterSpacing: '0.02em' }}>
                  ชื่อผู้ใช้
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-user" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted, #94a3b8)' }} />
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    required
                    autoComplete="username"
                    style={{
                      width: '100%', padding: '12px 14px 12px 40px',
                      borderRadius: 'var(--radius-md, 10px)', border: '1px solid var(--border-light, #cbd5e1)',
                      fontSize: 14, outline: 'none', background: 'var(--bg-card, #ffffff)',
                      color: 'var(--text-primary, #0f172a)', boxSizing: 'border-box',
                      transition: 'all 0.18s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary, #3b82f6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-light, #cbd5e1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary, #475569)', letterSpacing: '0.02em' }}>
                  รหัสผ่าน
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted, #94a3b8)' }} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '12px 42px 12px 40px',
                      borderRadius: 'var(--radius-md, 10px)', border: '1px solid var(--border-light, #cbd5e1)',
                      fontSize: 14, outline: 'none', background: 'var(--bg-card, #ffffff)',
                      color: 'var(--text-primary, #0f172a)', boxSizing: 'border-box',
                      transition: 'all 0.18s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary, #3b82f6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-light, #cbd5e1)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted, #94a3b8)', fontSize: 13, padding: 4, zIndex: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color 0.15s'
                    }}
                    aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    <i className={`fa-solid fa-eye${showPw ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 10,
                  padding: '11px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans Thai', 'Inter', system-ui, sans-serif",
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  lineHeight: 1.4
                }}>
                  <i className="fa-solid fa-circle-xmark" style={{ flexShrink: 0, fontSize: 15 }} />
                  <span style={{ fontFamily: 'inherit', fontWeight: 700 }}>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: '13px',
                  borderRadius: 'var(--radius-md, 10px)',
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.18s',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.25)'; } }}
              >
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" /> กำลังเข้าสู่ระบบ...</>
                  : <><i className="fa-solid fa-right-to-bracket" /> เข้าสู่ระบบ <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, marginLeft: 4 }} /></>
                }
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
            Ticket System v1.0 · Multi-Department Ticket & Service System
          </p>
        </div>
      </div>
    </div>
  );
}
