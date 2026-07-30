import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_INFO, ROLES } from '../data/mockData';
import * as api from '../utils/api';

export default function ProfileView() {
  const { currentUser, role, updateProfile, addToast, logoutUser } = useApp();
  const info = ROLE_INFO[role];
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  useEffect(() => {
    if (currentUser) {
      Promise.resolve().then(() => {
        setName(currentUser.name || '');
        setAvatarUrl(currentUser.avatarUrl || '');
        setAvatarPreview(currentUser.avatarUrl || '');
      });
    }
  }, [currentUser]);

  // Handle avatar click/selection
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('กรุณาระบุชื่อ-นามสกุล', 'error');
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await api.uploadFile(avatarFile);
        setAvatarUrl(finalAvatarUrl);
      }

      const payload = {
        name,
        avatarUrl: finalAvatarUrl
      };

      await updateProfile(payload);
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const displayDept = currentUser?.department?.name || 'ไม่มีแผนก';

  return (
    <div className="view-container" style={{
      maxWidth: '620px',
      margin: '0 auto',
      padding: '20px 8px 80px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      color: 'var(--text-primary)'
    }}>
      
      {/* ── Top Header Avatar Card ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
      }}>
        {/* Avatar container with click & hover effect */}
        <div 
          onClick={handleAvatarClick}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            border: '2.5px solid var(--border-light)',
            background: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: avatarHovered ? 'scale(1.04)' : 'scale(1)',
            boxShadow: avatarHovered ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
          }}
          title="คลิกเพื่อเปลี่ยนรูปภาพ"
        >
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              color: info?.color || 'var(--primary)'
            }}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {/* Hover Overlay Camera Icon */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(1.5px)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: avatarHovered ? 1 : 0,
            transition: 'all 0.25s ease-in-out',
            gap: '6px',
          }}>
            <i className="fa-solid fa-camera" style={{ 
              fontSize: '18px',
              transform: avatarHovered ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(4px)',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}></i>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>เปลี่ยนรูปภาพ</span>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        {/* User text details — stacked, centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
            {currentUser?.name || 'กำลังโหลด...'}
          </h2>
          <span style={{
            background: role === ROLES.ADMIN ? 'var(--critical-pale)' : role === ROLES.MANAGER ? 'var(--success-pale)' : 'var(--primary-pale)',
            color: role === ROLES.ADMIN ? 'var(--critical)' : role === ROLES.MANAGER ? '#065f46' : 'var(--primary)',
            border: `1px solid ${role === ROLES.ADMIN ? 'rgba(124,58,237,0.3)' : role === ROLES.MANAGER ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`,
            borderRadius: '6px',
            padding: '3px 12px',
            fontSize: '11.5px',
            fontWeight: 700,
          }}>
            {info?.label || 'พนักงานทั่วไป'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all', textAlign: 'center' }}>
            <i className="fa-regular fa-envelope" style={{ flexShrink: 0 }}></i>
            <span>{currentUser?.email || '-'}</span>
          </span>
        </div>
      </div>

      {/* ── Form Section ── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. Personal Information Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <i className="fa-regular fa-user" style={{ color: 'var(--primary)', fontSize: '16px' }}></i>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>ข้อมูลส่วนตัว</h3>
          </div>

          {/* Full Name (Disabled) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>ชื่อ-นามสกุล (ไม่สามารถแก้ไขได้)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={name}
                disabled 
                style={{
                  width: '100%',
                  background: 'var(--primary-bg)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 40px 12px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  cursor: 'not-allowed',
                  outline: 'none'
                }}
              />
              <i className="fa-solid fa-lock" style={{
                position: 'absolute',
                right: '16px',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}></i>
            </div>
          </div>



          {/* Email (Disabled) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>อีเมล (ไม่สามารถแก้ไขได้)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={currentUser?.email || ''} 
                disabled 
                style={{
                  width: '100%',
                  background: 'var(--primary-bg)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 40px 12px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  cursor: 'not-allowed',
                  outline: 'none'
                }}
              />
              <i className="fa-solid fa-lock" style={{
                position: 'absolute',
                right: '16px',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}></i>
            </div>
          </div>

          {/* Department (Disabled) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>แผนกที่สังกัด (ไม่สามารถแก้ไขได้)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={displayDept} 
                disabled 
                style={{
                  width: '100%',
                  background: 'var(--primary-bg)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 40px 12px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  cursor: 'not-allowed',
                  outline: 'none'
                }}
              />
              <i className="fa-solid fa-lock" style={{
                position: 'absolute',
                right: '16px',
                color: 'var(--text-muted)',
                fontSize: '14px'
              }}></i>
            </div>
          </div>
        </div>

        {/* 3. Submit/Save Button & Logout Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {avatarFile && (
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              }}
              onMouseEnter={e => { if(!saving) e.currentTarget.style.background = '#2563eb'; }}
              onMouseLeave={e => { if(!saving) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              <i className={saving ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-floppy-disk"}></i>
              <span>{saving ? 'กำลังบันทึกรูปภาพ...' : 'บันทึกรูปภาพใหม่'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={async () => { await logoutUser(); }}
            style={{
              background: 'rgba(239, 68, 68, 0.07)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.07)'; }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>ออกจากระบบ (Logout)</span>
          </button>
        </div>

      </form>
    </div>
  );
}
