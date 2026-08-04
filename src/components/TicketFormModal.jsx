import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, URGENCY_LEVELS } from '../data/mockData';

const CAT_THEME = {
  hardware: { bg: '#fff7ed', border: '#fed7aa', active: '#ea580c', iconColor: '#ea580c' },
  software: { bg: '#eff6ff', border: '#bfdbfe', active: '#2563eb', iconColor: '#2563eb' },
  network:  { bg: '#fefce8', border: '#fef08a', active: '#ca8a04', iconColor: '#ca8a04' },
  access:   { bg: '#f5f3ff', border: '#ddd6fe', active: '#7c3aed', iconColor: '#7c3aed' },
  other:    { bg: '#f8fafc', border: '#e2e8f0', active: '#64748b', iconColor: '#64748b' },
};

export default function TicketFormModal({ onClose }) {
  const { createTicket, addToast, depts, departmentsLoading, currentUser, managers, openTicketDetail } = useApp();
  const fileRef = useRef();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: '',
    subCategory: '',
    urgency: '',
    department: '',
    sendType: 'dept',
    receiverManagerId: '',
    receiverManagerName: '',
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

  const [managerSearch, setManagerSearch] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const managerDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
      if (managerDropdownRef.current && !managerDropdownRef.current.contains(e.target)) {
        setShowManagerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDepts = (depts || []).filter(dept =>
    dept.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const selectDepartment = (dept) => {
    set('department', dept);
    setDeptSearch(dept);
    setShowDeptDropdown(false);
  };

  const filteredManagers = (managers || [])
    .filter(m => m.id !== currentUser?.id)
    .filter(m => m.name.toLowerCase().includes(managerSearch.toLowerCase()));

  const selectManager = (mgr) => {
    setForm(f => ({
      ...f,
      receiverManagerId: mgr.id,
      receiverManagerName: mgr.name,
    }));
    setErrors(e => ({ ...e, receiverManagerId: '' }));
    setManagerSearch(mgr.name);
    setShowManagerDropdown(false);
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.subject.trim())     e.subject   = 'กรุณากรอกชื่อ Ticket';
    if (!form.description.trim()) e.description = 'กรุณากรอกรายละเอียด';
    if (!form.category)           e.category  = 'กรุณาเลือกหมวดหมู่';
    if (!form.urgency)            e.urgency   = 'กรุณาเลือกระดับความเร่งด่วน';
    if (form.sendType === 'dept') {
      if (!form.department)       e.department = 'กรุณาเลือกแผนก / ฝ่าย';
    } else {
      if (!form.receiverManagerId) e.receiverManagerId = 'กรุณาเลือกหัวหน้างาน / Manager';
    }
    return e;
  };

  const [files, setFiles]     = useState([]);

  const handleFiles = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;
    const fileList = Array.from(incomingFiles);
    
    // Check non-image files
    const nonImages = fileList.filter(f => !f.type.startsWith('image/'));
    if (nonImages.length > 0) {
      setFileErr('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Check oversized files (>10MB)
    const overSized = fileList.filter(f => f.size > 10 * 1024 * 1024);
    if (overSized.length > 0) {
      setFileErr('ขนาดไฟล์รูปภาพแต่ละไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    // Check limit max 5 files
    if (files.length + fileList.length > 5) {
      setFileErr(`สามารถแนบรูปภาพได้สูงสุดไม่เกิน 5 รูป (ปัจจุบันมี ${files.length} รูป)`);
      return;
    }

    setFileErr('');
    setFiles(prev => [...prev, ...fileList]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    createTicket(form, files.length > 0 ? files[0] : null, files)
      .then((newTicket) => {
        setSubmitting(false);
        onClose();
        if (newTicket && newTicket.id) {
          openTicketDetail(newTicket.id);
        }
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  const subOptions = CATEGORIES[form.category]?.sub || [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="modal" role="dialog" aria-modal="true" aria-labelledby="form-modal-title"
        style={{ maxWidth: 620, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-title">
              <div className="modal-header-icon">
                <i className="fa-solid fa-ticket" style={{ color: 'var(--primary)', fontSize: 18 }} aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="modal-title" id="form-modal-title">แจ้ง Ticket ใหม่</h2>
                <p className="modal-subtitle">กรอกข้อมูลให้ครบถ้วน</p>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="ปิด">
            <i className="fa-solid fa-xmark"  aria-hidden="true"></i>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
            <div className="form-grid">

              {/* Subject */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fa-solid fa-heading" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                  ชื่อ Ticket <span>*</span>
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

              {/* Send Type Selector (Managers and Admins) */}
              {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
                <div className="form-group">
                  <label className="form-label">
                    <i className="fa-solid fa-share" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                    ส่งไปให้ใคร <span>*</span>
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    background: 'var(--bg-main)',
                    padding: 4,
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <button
                      type="button"
                      onClick={() => set('sendType', 'dept')}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: form.sendType === 'dept' ? 'var(--bg-card)' : 'transparent',
                        color: form.sendType === 'dept' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: form.sendType === 'dept' ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: form.sendType === 'dept' ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      แผนก / ฝ่าย
                    </button>
                    <button
                      type="button"
                      onClick={() => set('sendType', 'manager')}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        background: form.sendType === 'manager' ? 'var(--bg-card)' : 'transparent',
                        color: form.sendType === 'manager' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: form.sendType === 'manager' ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: form.sendType === 'manager' ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ส่งถึง Manager
                    </button>
                  </div>
                </div>
              )}

              {/* Conditional Department or Manager selection */}
              {form.sendType === 'dept' ? (
                /* Department Dropdown */
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
                        {departmentsLoading || (!depts || depts.length === 0) ? (
                          <div style={{ padding: '20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--primary)' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 18 }}></i>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>กำลังโหลดรายการแผนก...</span>
                          </div>
                        ) : filteredDepts.length === 0 ? (
                          <div style={{ padding: '12px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
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
              ) : (
                /* Manager Dropdown */
                <div className="form-group" style={{ position: 'relative' }} ref={managerDropdownRef}>
                  <label className="form-label">
                    <i className="fa-solid fa-user-tie" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                    ส่งถึง Manager <span>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => {
                        setManagerSearch('');
                        setShowManagerDropdown(!showManagerDropdown);
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
                      id="form-manager-dropdown-trigger"
                    >
                      <span style={{ color: form.receiverManagerId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {form.receiverManagerName || '-- เลือก Manager --'}
                      </span>
                      <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, color: 'var(--text-muted)' }} aria-hidden="true"></i>
                    </div>
                  </div>

                  {showManagerDropdown && (
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
                      {/* Search Input */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="พิมพ์เพื่อค้นหา Manager..."
                          value={managerSearch}
                          onChange={(e) => setManagerSearch(e.target.value)}
                          style={{ 
                            width: '100%', 
                            paddingRight: '32px',
                            paddingTop: '6px',
                            paddingBottom: '6px',
                            fontSize: '12.5px',
                          }}
                          autoFocus
                          autoComplete="off"
                          onClick={(e) => e.stopPropagation()}
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
                        {filteredManagers.length === 0 ? (
                          <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} aria-hidden="true"></i>
                            ไม่พบ Manager ที่ค้นหา
                          </div>
                        ) : (
                          filteredManagers.map(mgr => {
                            const isSelected = form.receiverManagerId === mgr.id;
                            return (
                              <button
                                type="button"
                                key={mgr.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectManager(mgr);
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
                                <span>{mgr.name} ({mgr.department?.name || 'ไม่มีแผนก'})</span>
                                {isSelected && <i className="fa-solid fa-check" style={{ fontSize: 11 }} aria-hidden="true"></i>}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                  
                  {errors.receiverManagerId && (
                    <span className="form-error">
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                      {errors.receiverManagerId}
                    </span>
                  )}
                </div>
              )}


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
                          const nextVal = isActive ? '' : key;
                          set('category', nextVal);
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
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
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${isActive ? theme.active : 'var(--border)'}`,
                            background: isActive ? theme.active : 'var(--bg-card)',
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            boxSizing: 'border-box'
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
                  maxLength={250}
                  placeholder="อธิบายปัญหาเพิ่มเติม เช่น เกิดขึ้นเมื่อไหร่ ขั้นตอนที่ทำก่อนเกิดปัญหา ข้อความ Error ที่แสดง..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{ 
                    fontSize: 11.5, 
                    fontWeight: 600,
                    color: form.description.length >= 250 ? 'var(--danger)' : form.description.length >= 220 ? '#d97706' : 'var(--text-muted)' 
                  }}>
                    {form.description.length}/250
                  </span>
                </div>
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
                        onClick={() => set('urgency', isActive ? '' : u.value)}
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

              {/* ── File Upload (Multi-image up to 5) ── */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    <i className="fa-solid fa-paperclip" style={{ marginRight: 6, color: 'var(--primary)' }} aria-hidden="true"></i>
                    แนบรูปภาพประกอบ (ไม่บังคับ)
                  </label>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: files.length >= 5 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {files.length}/5 รูป
                  </span>
                </div>

                {/* Dropzone */}
                {files.length < 5 && (
                  <div
                    className={`upload-area${drag ? ' drag-over' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
                    id="upload-area"
                    style={{
                      border: `2px dashed ${drag ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: drag ? 'var(--primary-pale)' : 'var(--bg-main)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="upload-icon" style={{ marginBottom: 8 }}>
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 32, color: 'var(--primary)' }} aria-hidden="true"></i>
                    </div>
                    <div className="upload-label" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                    </div>
                    <div className="upload-hint" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF, WEBP) สูงสุด 5 รูป (ไม่เกิน 10MB/รูป)
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => handleFiles(e.target.files)}
                      id="file-input"
                    />
                  </div>
                )}

                {fileErr && (
                  <span className="form-error" style={{ marginTop: 6 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} aria-hidden="true"></i>
                    {fileErr}
                  </span>
                )}

                {/* Uploaded files grid list */}
                {files.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginTop: 12 }}>
                    {files.map((f, idx) => {
                      const imgUrl = URL.createObjectURL(f);
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-light)',
                            aspectRatio: '1',
                            background: 'var(--bg-main)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`preview-${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setViewImage(imgUrl)}
                          />
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            title="ลบรูปภาพ"
                            style={{
                              position: 'absolute', top: 4, right: 4,
                              background: 'rgba(239, 68, 68, 0.85)', color: '#fff',
                              border: 'none', borderRadius: '50%',
                              width: 22, height: 22,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 10,
                              fontSize: 10,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                          </button>
                        </div>
                      );
                    })}
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
                alignItems: 'flex-start',
                gap: 10,
                minWidth: 0,
              }}>
                <div style={{
                  width: 34, height: 34,
                  borderRadius: '50%',
                  background: currentUser?.avatarUrl ? 'transparent' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span style={{
                    display: currentUser?.avatarUrl ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}>
                    {currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : <i className="fa-solid fa-user" style={{ fontSize: 14 }} aria-hidden="true"></i>}
                  </span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    ผู้ส่ง: {currentUser?.name || '-'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: 1.5 }}>
                    {currentUser?.department?.name || ''}{currentUser?.department?.name ? ' — ' : ''}{currentUser?.email || ''}
                  </div>
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
