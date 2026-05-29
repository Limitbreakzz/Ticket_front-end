import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_INFO, ROLES } from '../data/mockData';
import * as api from '../utils/api';

export default function ProfileView() {
  const { currentUser, role, updateProfile, addToast } = useApp();
  const info = ROLE_INFO[role];
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync state on user load
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setAvatarPreview(currentUser.avatarUrl || '');
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

    if (newPassword) {
      if (!currentPassword) {
        addToast('กรุณาระบุรหัสผ่านปัจจุบันเพื่อเปลี่ยนรหัสผ่านใหม่', 'error');
        return;
      }
      if (newPassword.length < 6) {
        addToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast('การยืนยันรหัสผ่านใหม่ไม่ตรงกัน', 'error');
        return;
      }
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
        avatarUrl: finalAvatarUrl,
        ...(newPassword && {
          currentPassword,
          newPassword
        })
      };

      await updateProfile(payload);
      
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const displayDept = currentUser?.department?.name || (role === ROLES.EMPLOYEE ? 'ฝ่ายผลิต 1' : role === ROLES.MANAGER ? 'ฝ่ายซ่อมบำรุง' : 'ส่วนกลาง');

  return (
    <div style={{
      maxWidth: '620px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: 'var(--text-primary)'
    }}>
      
      {/* ── Top Header Avatar Card ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Avatar container */}
        <div 
          onClick={handleAvatarClick}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            border: '2.5px dashed var(--border)',
            background: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          className="group-avatar"
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
          
          {/* Hover overlay to change picture */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(37, 99, 235, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <i className="fa-solid fa-camera" style={{ fontSize: '20px', color: 'var(--primary)' }}></i>
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

        {/* User text details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {currentUser?.name || 'กำลังโหลด...'}
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              background: role === ROLES.ADMIN ? 'var(--critical-pale)' : role === ROLES.MANAGER ? 'var(--success-pale)' : 'var(--primary-pale)',
              color: role === ROLES.ADMIN ? 'var(--critical)' : role === ROLES.MANAGER ? '#065f46' : 'var(--primary)',
              border: `1px solid ${role === ROLES.ADMIN ? 'rgba(124,58,237,0.3)' : role === ROLES.MANAGER ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`,
              borderRadius: '6px',
              padding: '3px 10px',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              {info?.label || 'พนักงานทั่วไป'}
            </span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-regular fa-envelope"></i>
            {currentUser?.email || '-'}
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
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <i className="fa-regular fa-user" style={{ color: 'var(--primary)', fontSize: '16px' }}></i>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>ข้อมูลส่วนตัว</h3>
          </div>

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>ชื่อ-นามสกุล</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="กรอกชื่อ-นามสกุล..."
              style={{
                width: '100%',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
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

        {/* 2. Change Password Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <i className="fa-solid fa-key" style={{ color: 'var(--primary)', fontSize: '16px' }}></i>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              เปลี่ยนรหัสผ่าน <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>(ว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span>
            </h3>
          </div>

          {/* Current Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>รหัสผ่านปัจจุบัน</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="ป้อนรหัสผ่านเดิม..."
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 40px 12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button 
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`fa-solid ${showCurrent ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>รหัสผ่านใหม่</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 40px 12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button 
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`fa-solid ${showNew ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>ยืนยันรหัสผ่านใหม่</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง..."
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 40px 12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`fa-solid ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Submit Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-md)'
          }}
          onMouseEnter={e => { if(!saving) e.currentTarget.style.background = 'var(--primary-light)'; }}
          onMouseLeave={e => { if(!saving) e.currentTarget.style.background = 'var(--primary)'; }}
        >
          {saving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>กำลังบันทึกการเปลี่ยนแปลง...</span>
            </>
          ) : (
            <>
              <i className="fa-regular fa-floppy-disk"></i>
              <span>บันทึกการเปลี่ยนแปลง</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
