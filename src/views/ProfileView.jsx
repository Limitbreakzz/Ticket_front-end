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

  // Cropper states
  const [cropSrc, setCropSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });

  const cropperImgRef = useRef(null);

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

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      // Reset file input value so same file can be selected again if needed
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoaded = (e) => {
    const img = e.target;
    const aspect = img.naturalWidth / img.naturalHeight;
    let renderWidth, renderHeight;
    // Fit the crop area (220px)
    if (aspect >= 1) {
      renderHeight = 220;
      renderWidth = 220 * aspect;
    } else {
      renderWidth = 220;
      renderHeight = 220 / aspect;
    }
    setImgDimensions({
      width: renderWidth,
      height: renderHeight,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    });
  };

  // Dragging event handlers
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchEnd = () => handleEnd();

  const handleCropSave = () => {
    if (!cropperImgRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Apply transformation
    ctx.translate(128, 128);
    const ratio = 256 / 220;
    ctx.scale(ratio * zoom, ratio * zoom);
    ctx.translate(offset.x, offset.y);

    // Draw the image centered
    ctx.drawImage(
      cropperImgRef.current,
      -imgDimensions.width / 2,
      -imgDimensions.height / 2,
      imgDimensions.width,
      imgDimensions.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'cropped-avatar.jpg', { type: 'image/jpeg' });
      setAvatarFile(croppedFile);
      setAvatarPreview(URL.createObjectURL(croppedFile));
      setCropSrc('');
    }, 'image/jpeg', 0.95);
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

  const displayDept = 
    currentUser?.department?.name || 
    currentUser?.departmentName || 
    (typeof currentUser?.department === 'string' ? currentUser.department : null) || 
    currentUser?.dept?.name ||
    (typeof currentUser?.dept === 'string' ? currentUser.dept : null) ||
    currentUser?.departmentCode ||
    currentUser?.deptName ||
    (role === ROLES.ADMIN ? 'ส่วนกลาง' : (
      currentUser?.name?.toUpperCase().includes('_IT') || currentUser?.username?.toUpperCase().includes('_IT') ? 'ไอที' :
      currentUser?.name?.toUpperCase().includes('_HR') || currentUser?.username?.toUpperCase().includes('_HR') ? 'ทรัพยากรบุคคล (HR)' :
      'ไม่มีแผนก'
    ));

  return (
    <div className="view-container" style={{
      maxWidth: '620px',
      margin: '0 auto',
      padding: '20px 8px 36px 8px',
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

      {/* ── Image Cropping Modal (Drag & Zoom) ── */}
      {cropSrc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11000,
          padding: '16px',
          fontFamily: "inherit"
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', textAlign: 'center' }}>
              ปรับตำแหน่งรูปโปรไฟล์
            </h3>

            {/* Viewport container */}
            <div 
              style={{
                position: 'relative',
                width: '280px',
                height: '280px',
                overflow: 'hidden',
                borderRadius: '16px',
                border: '1px solid var(--border-light, #e2e8f0)',
                cursor: 'move',
                userSelect: 'none',
                background: '#0f172a',
                touchAction: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {imgDimensions.width > 0 && (
                <img
                  ref={cropperImgRef}
                  src={cropSrc}
                  alt="Crop Preview"
                  style={{
                    position: 'absolute',
                    width: imgDimensions.width,
                    height: imgDimensions.height,
                    left: 140 - imgDimensions.width / 2 + offset.x,
                    top: 140 - imgDimensions.height / 2 + offset.y,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                />
              )}
              {/* Semi-transparent mask with circular hole */}
              <div style={{
                position: 'absolute',
                width: '220px',
                height: '220px',
                top: '30px',
                left: '30px',
                borderRadius: '50%',
                border: '3px solid var(--primary, #3b82f6)',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                pointerEvents: 'none',
                zIndex: 2
              }} />

              {/* Invisible loader to calculate sizes */}
              <img 
                src={cropSrc} 
                alt="Invisible Loader" 
                style={{ display: 'none' }} 
                onLoad={handleImageLoaded} 
              />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
              คลิกค้างแล้วลากรูปภาพเพื่อปรับตำแหน่ง <br />
              ส่วนที่อยู่นอกวงกลมสีฟ้าจะถูกตัดออก
            </p>

            {/* Zoom Slider Control */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fa-solid fa-magnifying-glass-minus" style={{ color: 'var(--text-secondary, #64748b)', fontSize: '14px' }}></i>
              <input 
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: 'var(--primary, #3b82f6)'
                }}
              />
              <i className="fa-solid fa-magnifying-glass-plus" style={{ color: 'var(--text-secondary, #64748b)', fontSize: '14px' }}></i>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setCropSrc('')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light, #cbd5e1)',
                  background: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-secondary, #475569)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main, #f8fafc)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card, #ffffff)'}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary, #3b82f6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary, #3b82f6)'}
              >
                ยืนยันการตัดรูป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
