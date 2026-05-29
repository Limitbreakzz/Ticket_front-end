import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, URGENCY_LEVELS, ROLE_INFO, DEPARTMENTS } from '../data/mockData';

const CAT_THEME = {
  mechanical: { bg: '#fff7ed', border: '#fed7aa', active: '#ea580c', iconColor: '#ea580c' },
  electrical: { bg: '#fefce8', border: '#fef08a', active: '#ca8a04', iconColor: '#ca8a04' },
  facility:   { bg: '#f0fdf4', border: '#bbf7d0', active: '#16a34a', iconColor: '#16a34a' },
  it_support: { bg: '#eff6ff', border: '#bfdbfe', active: '#2563eb', iconColor: '#2563eb' },
};

export default function TicketFormModal({ onClose }) {
  const { createTicket, role, addToast } = useApp();
  const info = ROLE_INFO[role];
  const fileRef = useRef();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: '',
    subCategory: '',
    urgency: '',
    department: '',
  });
  const [file, setFile]       = useState(null);
  const [fileErr, setFileErr] = useState('');
  const [drag, setDrag]       = useState(false);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [viewImage, setViewImage] = useState(null);

  const [deptSearch, setDeptSearch] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const deptDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDepts = DEPARTMENTS.filter(dept =>
    dept.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const selectDepartment = (dept) => {
    set('department', dept);
    setDeptSearch(dept);
    setShowDeptDropdown(false);
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.subject.trim())     e.subject   = 'กรุณากรอกชื่อเรื่อง';
    if (!form.description.trim()) e.description = 'กรุณากรอกรายละเอียด';
    if (!form.category)           e.category  = 'กรุณาเลือกหมวดหมู่';
    if (!form.urgency)            e.urgency   = 'กรุณาเลือกระดับความเร่งด่วน';
    if (!form.department)         e.department = 'กรุณาเลือกแผนก / ฝ่าย';
    return e;
  };

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setFileErr('ขนาดไฟล์ต้องไม่เกิน 2MB'); return; }
    if (!f.type.startsWith('image/')) { setFileErr('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น'); return; }
    setFileErr('');
    setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      addToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return; 
    }
    setSubmitting(true);
    setTimeout(() => {
      createTicket({
        ...form,
        createdBy: info.name,
        department: form.department,
        image: file ? URL.createObjectURL(file) : null,
      });
      setSubmitting(false);
      onClose();
    }, 700);
  };

  const subOptions = CATEGORIES[form.category]?.sub || [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="form-modal-title"
        style={{ maxWidth: 620 }}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-title">
              <div className="modal-header-icon">
                <i className="fa-solid fa-ticket" style={{ color: 'var(--primary)', fontSize: 18 }} aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="modal-title" id="form-modal-title">แจ้งเรื่องใหม่</h2>
                <p className="modal-subtitle">กรอกข้อมูลให้ครบถ้วน</p>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="ปิด">
            <i className="fa-solid fa-xmark"  aria-hidden="true"></i>
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            <div className="form-grid">

              {/* Subject */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-heading" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  ชื่อเรื่อง <span>*</span>
                </label>
                <input
                  id="form-subject"
                  className="form-input"
                  placeholder="สรุปสั้น ๆ ว่าปัญหาคืออะไร..."
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  maxLength={100}
                />
                {errors.subject && (
                  <span className="form-error">
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {errors.subject}
                  </span>
                )}
              </div>

              {/* Department */}
              <div className="form-group" style={{ position: 'relative' }} ref={deptDropdownRef}>
                <label className="form-label">
                  <i className="fa-solid fa-building" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  แผนก / ฝ่าย <span>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => {
                      setDeptSearch('');
                      setShowDeptDropdown(!showDeptDropdown);
                    }}
                    className="form-select"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      cursor: 'pointer',
                      background: 'var(--bg-main)',
                      padding: '9px 12px',
                      minHeight: '38px',
                      userSelect: 'none',
                    }}
                    id="form-department-dropdown-trigger"
                  >
                    <span style={{ color: form.department ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {form.department || '-- เลือกแผนก / ฝ่าย --'}
                    </span>
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, color: 'var(--text-muted)' }} aria-hidden="true"></i>
                  </div>
                </div>

                {showDeptDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 100,
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      animation: 'fadeIn 0.12s ease',
                    }}
                  >
                    {/* Search Input Inside the Dropdown Menu */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="พิมพ์เพื่อค้นหาแผนก..."
                        value={deptSearch}
                        onChange={(e) => setDeptSearch(e.target.value)}
                        style={{ 
                          width: '100%', 
                          paddingRight: '32px',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          fontSize: '12.5px',
                        }}
                        autoFocus
                        autoComplete="off"
                        onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking the search box
                      />
                      <i 
                        className="fa-solid fa-magnifying-glass" 
                        style={{ 
                          position: 'absolute', 
                          right: 12, 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: 'var(--text-muted)', 
                          fontSize: 12 
                        }} 
                        aria-hidden="true"
                      ></i>
                    </div>

                    {/* Options List */}
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {filteredDepts.length === 0 ? (
                        <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} aria-hidden="true"></i>
                          ไม่พบแผนกที่ค้นหา
                        </div>
                      ) : (
                        filteredDepts.map(dept => {
                          const isSelected = form.department === dept;
                          return (
                            <button
                              type="button"
                              key={dept}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectDepartment(dept);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                border: 'none',
                                background: isSelected ? 'var(--primary-pale)' : 'transparent',
                                color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                fontSize: 13,
                                fontWeight: isSelected ? 700 : 500,
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'background 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'var(--bg-main)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span>{dept}</span>
                              {isSelected && <i className="fa-solid fa-check" style={{ fontSize: 11 }} aria-hidden="true"></i>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                
                {errors.department && (
                  <span className="form-error">
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {errors.department}
                  </span>
                )}
              </div>

              {/* ── Category Card Grid ── */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-tags" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  หมวดหมู่ <span>*</span>
                </label>

                <div className="category-grid">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const theme = CAT_THEME[key];
                    const isActive = form.category === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        id={`cat-${key}`}
                        onClick={() => {
                          set('category', key);
                          set('subCategory', '');
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          padding: '14px 8px',
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${isActive ? theme.active : theme.border}`,
                          background: isActive ? theme.active : theme.bg,
                          cursor: 'pointer',
                          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                          fontFamily: 'inherit',
                          transform: isActive ? 'translateY(-2px)' : 'none',
                          boxShadow: isActive ? `0 6px 18px ${theme.active}35` : 'none',
                        }}
                      >
                        {/* Icon circle */}
                        <div style={{
                          width: 42, height: 42,
                          borderRadius: '50%',
                          background: isActive ? 'rgba(255,255,255,0.2)' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isActive ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
                        }}>
                          <i className={`fa-solid fa-${cat.icon}`} style={{
                              fontSize: 18,
                              color: isActive ? '#fff' : theme.iconColor,
                            }} aria-hidden="true"></i>
                        </div>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? '#fff' : 'var(--text-primary)',
                          textAlign: 'center',
                          lineHeight: 1.3,
                        }}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {errors.category && (
                  <span className="form-error">
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {errors.category}
                  </span>
                )}
              </div>

              {/* ── Subcategory Pill Buttons ── */}
              {form.category && subOptions.length > 0 && (
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-list-ul" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                    หมวดหมู่ย่อย
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {subOptions.map(sub => {
                      const theme = CAT_THEME[form.category];
                      const isActive = form.subCategory === sub;
                      return (
                        <button
                          type="button"
                          key={sub}
                          id={`subcat-${sub}`}
                          onClick={() => set('subCategory', isActive ? '' : sub)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            border: `1.5px solid ${isActive ? theme.active : 'var(--border)'}`,
                            background: isActive ? theme.active : 'var(--bg-card)',
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isActive && <i className="fa-solid fa-check" style={{ marginRight: 5, fontSize: 10 }} aria-hidden="true"></i>}
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-align-left" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  รายละเอียด <span>*</span>
                </label>
                <textarea
                  id="form-description"
                  className="form-textarea"
                  placeholder="อธิบายปัญหาเพิ่มเติม เช่น เกิดขึ้นเมื่อไหร่ ขั้นตอนที่ทำก่อนเกิดปัญหา ข้อความ Error ที่แสดง..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                />
                {errors.description && (
                  <span className="form-error">
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {errors.description}
                  </span>
                )}
              </div>

              {/* ── Urgency ── */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-gauge-high" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  ระดับความเร่งด่วน <span>*</span>
                </label>
                <div className="urgency-grid">
                  {URGENCY_LEVELS.map(u => {
                    const isActive = form.urgency === u.value;
                    return (
                      <button
                        type="button"
                        key={u.value}
                        id={`urgency-${u.value}`}
                        onClick={() => set('urgency', u.value)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          padding: '12px 8px',
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${isActive ? u.color : 'var(--border)'}`,
                          background: isActive ? u.color : 'var(--bg-card)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.18s ease',
                          transform: isActive ? 'translateY(-2px)' : 'none',
                          boxShadow: isActive ? `0 6px 16px ${u.color}40` : 'none',
                        }}
                      >
                        <i className={`fa-solid fa-${u.icon}`} style={{
                            fontSize: 20,
                            color: isActive ? '#fff' : u.color,
                          }} aria-hidden="true"></i>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#fff' : 'var(--text-primary)' }}>
                          {u.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.urgency && (
                  <span className="form-error">
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {errors.urgency}
                  </span>
                )}
              </div>

              {/* ── File Upload ── */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-paperclip" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  แนบรูปภาพ (ไม่บังคับ)
                </label>
                {!file && (
                  <div
                    className={`upload-area${drag ? ' drag-over' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                    id="upload-area"
                  >
                    <div className="upload-icon">
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 32, color: 'var(--primary-lighter)' }} aria-hidden="true"></i>
                    </div>
                    <div className="upload-label">คลิกหรือลากไฟล์มาวางที่นี่</div>
                    <div className="upload-hint">รองรับ PNG, JPG, GIF — ขนาดไม่เกิน 2MB</div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFile(e.target.files[0])}
                      id="file-input"
                    />
                  </div>
                )}
                {fileErr && (
                  <span className="form-error">
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {fileErr}
                  </span>
                )}
                {file && (
                  <div className="upload-preview" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, padding: 12 }}>
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <div
                        onClick={() => setViewImage(URL.createObjectURL(file))}
                        className="preview-image-container"
                      >
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                        />
                        <div className="preview-image-overlay">
                          <i className="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>
                          <span>คลิกเพื่อดูรูปขนาดเต็ม</span>
                        </div>
                      </div>
                      
                      <div className="preview-image-badge">
                        <i className="fa-solid fa-eye" aria-hidden="true"></i>
                        กดเพื่อดูรูป
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        title="ลบไฟล์"
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          border: 'none', borderRadius: '50%',
                          width: 28, height: 28,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                      >
                        <i className="fa-solid fa-xmark"  aria-hidden="true"></i>
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="upload-preview-name" style={{ margin: 0 }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Creator info */}
              <div style={{
                background: 'var(--primary-bg)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  width: 34, height: 34,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fa-solid fa-user" style={{ color: '#fff', fontSize: 14 }} aria-hidden="true"></i>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    ผู้ส่ง: {info.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{info.label} — {info.desc}</div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              <i className="fa-solid fa-xmark" style={{ marginRight: 6 }} aria-hidden="true"></i>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" id="submit-ticket-btn" disabled={submitting}>
              {submitting
                ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 6 }} aria-hidden="true"></i>กำลังส่ง...</>
                : <><i className="fa-solid fa-paper-plane" style={{ marginRight: 6 }} aria-hidden="true"></i>ส่ง Ticket</>
              }
            </button>
          </div>
        </form>
      </div>

      {viewImage && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setViewImage(null)}
        >
          <div 
            className="lightbox-content"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={viewImage} 
              alt="Full view" 
            />
            <button
              className="lightbox-close"
              onClick={() => setViewImage(null)}
              title="ปิด"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
            <div className="lightbox-filename">
              {file?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
