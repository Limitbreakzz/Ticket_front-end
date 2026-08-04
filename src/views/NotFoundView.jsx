import React from 'react';

export default function NotFoundView({ onGoHome }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      background: '#090a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
      fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      color: '#ffffff',
      userSelect: 'none'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      {/* Massive Clean 404 Number */}
      <h1 style={{
        fontSize: '120px',
        fontWeight: 800,
        margin: 0,
        color: '#ffffff',
        lineHeight: 1,
        letterSpacing: '-0.04em',
        fontFamily: "'Inter', sans-serif"
      }}>
        404
      </h1>

      {/* Title & Description text */}
      <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '20px 0 10px', color: '#ffffff' }}>
        ไม่พบหน้าที่คุณต้องการ หรือไม่มีสิทธิ์เข้าถึง
      </h2>

      <p style={{
        maxWidth: 460,
        fontSize: '14.5px',
        color: '#94a3b8',
        lineHeight: 1.6,
        margin: '0 0 32px',
        fontWeight: 400
      }}>
        ขออภัย เส้นทาง URL ที่คุณพิมพ์เข้ามาอาจไม่ถูกต้อง ถูกลบออก หรือคุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณากลับสู่หน้าหลักเพื่อใช้งานต่อ
      </p>

      {/* Button */}
      <button
        type="button"
        onClick={() => {
          try {
            if (onGoHome) onGoHome();
          } catch { /* ignore */ }
          window.history.pushState({}, '', '/');
          window.location.assign('/');
        }}
        style={{
          position: 'relative',
          zIndex: 1000000,
          pointerEvents: 'auto',
          background: '#ffffff',
          color: '#090a0f',
          border: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '14.5px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 14px rgba(255, 255, 255, 0.12)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#e2e8f0';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <i className="fa-solid fa-house"></i>
        <span>กลับสู่หน้าหลัก</span>
      </button>
    </div>
  );
}
