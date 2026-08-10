import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS } from '../data/mockData';
import * as api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReportsView from './ReportsView';
import SLAView from './SLAView';
import ApprovalView from './ApprovalView';

function CustomDropdown({ icon, label, value, onChange, options, placeholder, direction, inline }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const selected = options.find(o => o.value === value);
  const isActive = !!value && value !== 'all';

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
          background: isActive ? 'var(--primary-pale)' : 'var(--bg-main)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.18s ease',
          minWidth: 0,
        }}
      >
        {icon && <i className={`fa-solid fa-${icon}`} style={{ fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />}
        {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{label}:</span>}
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          flex: 1,
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'transform 0.18s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {open && (
        <div style={{
          position: inline ? 'relative' : 'absolute',
          top: inline ? 'auto' : (direction === 'up' ? 'auto' : 'calc(100% + 6px)'),
          bottom: inline ? 'auto' : (direction === 'up' ? 'calc(100% + 6px)' : 'auto'),
          marginTop: inline ? 6 : 0,
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: inline ? 'none' : '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          minWidth: '100%',
        }}>
          {/* Search box overlay */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
            <input
              type="text"
              placeholder="พิมพ์เพื่อค้นหาแผนก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '8px 32px 8px 12px',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <i 
              className="fa-solid fa-magnifying-glass" 
              style={{
                position: 'absolute',
                right: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: 12,
                pointerEvents: 'none'
              }}
            />
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                ไม่พบแผนกที่ค้นหา
              </div>
            ) : (
              filteredOptions.map(o => {
                const isSel = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: isSel ? 'var(--primary-pale)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: isSel ? 700 : 500,
                      color: isSel ? 'var(--primary)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--bg-main)'; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {o.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsView({ defaultActiveTab }) {
  const { addToast, showConfirm, role, depts = [] } = useApp();
  const [activeTab, setActiveTab] = useState(defaultActiveTab || (role === 'admin' ? 'reports' : 'sla')); // 'reports' | 'sla' | 'webhooks'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedUrls, setExpandedUrls] = useState({});
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [defaultActiveTab]);

  const displayDepts = depts.length > 0 ? depts : DEPARTMENTS;
  const deptOptions = [
    { value: 'all', label: 'ทั้งหมดในระบบ (ทุกแผนก)' },
    ...displayDepts.map(d => {
      if (d === 'แผนก IT' || d === 'IT') {
        return { value: 'IT', label: 'แผนก IT' };
      }
      return { value: d, label: d };
    })
  ];

  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    url: '',
    targetDepartment: 'all',
    allowPrivateTickets: false
  });
  const [testingId, setTestingId] = useState(null);
  const [togglingWebhooks, setTogglingWebhooks] = useState({});
  // cooldowns: { [webhookId]: secondsRemaining }
  const [cooldowns, setCooldowns] = useState({});
  const COOLDOWN_SEC = 30;

  // Tick down cooldown counters every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[id] > 0) { next[id] -= 1; changed = true; }
          if (next[id] <= 0) delete next[id];
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadWebhooks = useCallback(async (showLoading = true, force = false) => {
    if (role !== 'admin') return;
    const cachedData = sessionStorage.getItem('cached_webhooks');
    const cachedTime = sessionStorage.getItem('cached_webhooks_time');
    const now = Date.now();

    if (!force && cachedData && cachedTime && (now - Number(cachedTime) < 15000)) {
      setWebhooks(JSON.parse(cachedData));
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const data = await api.fetchWebhooks();
      setWebhooks(data);
      sessionStorage.setItem('cached_webhooks', JSON.stringify(data));
      sessionStorage.setItem('cached_webhooks_time', String(Date.now()));
    } catch (err) {
      console.error(err);
      if (cachedData) setWebhooks(JSON.parse(cachedData));
      addToast('โหลดข้อมูล Webhook ล้มเหลว: ' + err.message, 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (role !== 'admin') return;
    let active = true;
    const initialLoad = async () => {
      const cachedData = sessionStorage.getItem('cached_webhooks');
      const cachedTime = sessionStorage.getItem('cached_webhooks_time');
      const now = Date.now();

      if (cachedData && cachedTime && (now - Number(cachedTime) < 15000)) {
        if (active) {
          setWebhooks(JSON.parse(cachedData));
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const data = await api.fetchWebhooks();
        if (active) {
          setWebhooks(data);
          sessionStorage.setItem('cached_webhooks', JSON.stringify(data));
          sessionStorage.setItem('cached_webhooks_time', String(Date.now()));
        }
      } catch (err) {
        console.error(err);
        if (active) {
          if (cachedData) setWebhooks(JSON.parse(cachedData));
          addToast('โหลดข้อมูล Webhook ล้มเหลว: ' + err.message, 'error');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    initialLoad();
    return () => {
      active = false;
    };
  }, [addToast]);

  const [editingWebhook, setEditingWebhook] = useState(null);
  const [editingForm, setEditingForm] = useState({
    name: '',
    url: '',
    targetDepartment: 'all',
    allowPrivateTickets: false
  });

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    if (!form.name || !form.url) {
      addToast('กรุณากรอกชื่อและ Webhook URL', 'warning');
      return;
    }

    // Basic discord webhook url validation
    if (!form.url.includes('discord.com/api/webhooks') && !form.url.includes('discordapp.com/api/webhooks')) {
      addToast('กรุณากรอก Discord Webhook URL ที่ถูกต้อง', 'warning');
      return;
    }

    try {
      await api.createWebhook({
        name: form.name.trim(),
        url: form.url.trim(),
        targetDepartment: form.targetDepartment || 'all',
        allowPrivateTickets: !!form.allowPrivateTickets
      });
      addToast('เพิ่ม Discord Webhook สำเร็จ', 'success');
      setForm({ name: '', url: '', targetDepartment: 'all', allowPrivateTickets: false });
      setShowAddForm(false);
      loadWebhooks(true, true);
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    }
  };

  const handleOpenEdit = (webhook) => {
    setEditingWebhook(webhook);
    setEditingForm({
      name: webhook.name || '',
      url: webhook.url || '',
      targetDepartment: webhook.targetDepartment || 'all',
      allowPrivateTickets: !!webhook.allowPrivateTickets
    });
  };

  const handleUpdateWebhookSubmit = async (e) => {
    e.preventDefault();
    if (!editingForm.name || !editingForm.url) {
      addToast('กรุณากรอกชื่อและ Webhook URL', 'warning');
      return;
    }

    if (!editingForm.url.includes('discord.com/api/webhooks') && !editingForm.url.includes('discordapp.com/api/webhooks')) {
      addToast('กรุณากรอก Discord Webhook URL ที่ถูกต้อง', 'warning');
      return;
    }

    try {
      await api.updateWebhook(editingWebhook.id, {
        name: editingForm.name.trim(),
        url: editingForm.url.trim(),
        targetDepartment: editingForm.targetDepartment || 'all',
        allowPrivateTickets: !!editingForm.allowPrivateTickets
      });
      addToast('แก้ไข Discord Webhook สำเร็จ', 'success');
      setEditingWebhook(null);
      loadWebhooks(true, true);
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    }
  };

  const handleToggleWebhook = async (webhook) => {
    if (togglingWebhooks[webhook.id]) return; // Prevent spam clicking while request is pending

    const nextState = !webhook.isActive;
    setTogglingWebhooks(prev => ({ ...prev, [webhook.id]: true }));
    // Optimistic UI update for instant sliding animation
    setWebhooks(prev => prev.map(w => w.id === webhook.id ? { ...w, isActive: nextState } : w));

    try {
      await api.updateWebhook(webhook.id, { isActive: nextState });
      addToast(`เปลี่ยนสถานะการใช้งานสำเร็จ`, 'success');
      loadWebhooks(true, true);
    } catch (err) {
      // Revert back on error
      setWebhooks(prev => prev.map(w => w.id === webhook.id ? { ...w, isActive: webhook.isActive } : w));
      addToast(err.message, 'error');
    } finally {
      setTogglingWebhooks(prev => ({ ...prev, [webhook.id]: false }));
    }
  };

  const handleDeleteWebhook = async (id) => {
    const confirmed = await showConfirm({
      title: 'ยืนยันการลบ Webhook',
      message: 'คุณต้องการลบ Webhook นี้ใช่หรือไม่? ระบบจะหยุดส่งแจ้งเตือนออกช่องทางนี้',
      dangerConfirm: true
    });
    if (confirmed) {
      try {
        await api.deleteWebhook(id);
        addToast('ลบ Webhook เรียบร้อยแล้ว', 'success');
        loadWebhooks(true, true);
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const handleTestWebhook = async (id) => {
    if (cooldowns[id] > 0) return; // still in cooldown
    setTestingId(id);
    try {
      await api.testWebhook(id);
      addToast('ส่ง Webhook ทดสอบสำเร็จ! กรุณาตรวจสอบผลการส่งในช่องทางที่รับข้อมูล', 'success');
      // Start cooldown after successful send
      setCooldowns(prev => ({ ...prev, [id]: COOLDOWN_SEC }));
    } catch (err) {
      console.error(err);
      addToast('ทดสอบ Webhook ล้มเหลว: ' + err.message, 'error');
      // Short cooldown even on failure to prevent rapid retry
      setCooldowns(prev => ({ ...prev, [id]: 10 }));
    } finally {
      setTestingId(null);
    }
  };

  const tabOptions = [
    ...(role === 'manager' ? [{ value: 'approval', label: 'รออนุมัติ', icon: 'fa-clipboard-check' }] : []),
    ...(role === 'admin' || role === 'manager' ? [{ value: 'reports', label: role === 'manager' ? 'สรุปภาพรวมแผนก' : 'รายงาน & วิเคราะห์', icon: 'fa-chart-line' }] : []),
    { value: 'sla', label: role === 'manager' ? 'ติดตาม SLA แผนก' : 'ติดตาม SLA', icon: 'fa-clock' },
    ...(role === 'admin' ? [{ value: 'webhooks', label: 'ตั้งค่า Webhook', icon: 'fa-gear' }] : [])
  ];

  return (
    <div className="view-container" style={{
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: isMobile ? '12px 12px 36px 12px' : '24px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* Integrated Admin Navigation Tabs */}
      {tabOptions.length > 1 && (
        <div 
          className="mobile-only"
          style={{
            display: 'flex',
            background: 'rgba(15,23,42,0.03)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            border: '1px solid var(--border-light)',
            gap: '4px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {tabOptions.map(tab => {
            const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setShowAddForm(false);
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: active ? 'var(--bg-card)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: active ? 800 : 600,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      )}

      {/* Render sub-views */}
      <AnimatePresence mode="wait">
        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <ReportsView />
          </motion.div>
        )}

        {activeTab === 'approval' && (
          <motion.div key="approval" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <ApprovalView />
          </motion.div>
        )}

        {activeTab === 'sla' && (
          <motion.div key="sla" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <SLAView />
          </motion.div>
        )}

        {activeTab === 'webhooks' && (
          <motion.div key="webhooks" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: isMobile ? '8px' : '0'
            }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 4 }}>
                  ตั้งค่า Discord Webhook
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4, margin: 4 }}>
                  ตั้งค่าและเชื่อมโยงส่งแจ้งเตือนงานไปยังห้องสนทนา Discord
                </p>
              </div>
            </div>

            <div className="settings-grid">
              {/* Webhooks list Card */}
              <div className="settings-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <i className="fa-brands fa-discord" style={{ color: '#5865F2', fontSize: 18, marginTop: 2 }}></i>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>การแจ้งเตือนผ่าน Discord</span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                        ({webhooks.length} รายการ)
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(true)} 
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <i className="fa-solid fa-plus"></i> เพิ่ม Webhook
                  </button>
                </div>

              {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 8 }}></i>
                  <div>กำลังโหลดข้อมูล Webhook...</div>
                </div>
              ) : webhooks.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-link-slash" style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.5, display: 'block', marginBottom: 8 }}></i>
                  <div className="empty-state-title" style={{ fontSize: 14 }}>ยังไม่มีการเชื่อมต่อ Webhook</div>
                  <div className="empty-state-desc">เชื่อมต่อส่งแจ้งเตือนเข้า Discord เพื่อให้ทีมช่างรับงานได้เร็วขึ้น</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                  {webhooks.map(wh => {
                    const isExpanded = !!expandedUrls[wh.id];
                    return (
                      <div 
                        key={wh.id} 
                        className={`webhook-item ${wh.isActive ? '' : 'inactive'}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: isExpanded ? 16 : 0,
                          padding: 16,
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          transition: 'all 0.2s ease',
                          cursor: 'default'
                        }}
                      >
                        {/* Header Clickable Row */}
                        <div 
                          onClick={() => setExpandedUrls(prev => ({ ...prev, [wh.id]: !prev[wh.id] }))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            width: '100%',
                            gap: 12
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'flex-start', 
                            gap: 6, 
                            flex: 1,
                            minWidth: 0
                          }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14.5, lineHeight: 1.3 }}>{wh.name}</div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px 8px',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                borderRadius: 10,
                                fontWeight: 700,
                                background: wh.isActive ? 'var(--success-pale)' : 'rgba(0,0,0,0.08)',
                                color: wh.isActive ? 'var(--success)' : 'var(--text-muted)',
                                whiteSpace: 'nowrap'
                              }}>
                                {wh.isActive ? (
                                  <>
                                    <i className="fa-solid fa-circle-check" style={{ color: 'var(--success)', marginRight: 4 }} />
                                    เปิดใช้งาน
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-circle-dot" style={{ color: 'var(--text-muted)', marginRight: 4 }} />
                                    ปิดใช้งาน
                                  </>
                                )}
                              </span>
                              <span style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                borderRadius: 10,
                                fontWeight: 700,
                                background: 'rgba(59,130,246,0.1)',
                                color: 'var(--primary)',
                                whiteSpace: 'nowrap'
                              }}>
                                <i className="fa-solid fa-building" style={{ marginRight: 4 }} />{wh.targetDepartment === 'all' || !wh.targetDepartment ? 'ทุกแผนก' : wh.targetDepartment}
                              </span>
                              {wh.allowPrivateTickets && (
                                <span style={{
                                  fontSize: 10,
                                  padding: '2px 8px',
                                  borderRadius: 10,
                                  fontWeight: 700,
                                  background: 'var(--critical-pale)',
                                  color: 'var(--critical)',
                                  whiteSpace: 'nowrap'
                                }}>
                                  <i className="fa-solid fa-lock" style={{ marginRight: 4 }} />Private Ticket
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Chevron Icon */}
                          <i 
                            className="fa-solid fa-chevron-down" 
                            style={{ 
                              fontSize: 12,
                              color: 'var(--text-muted)',
                              transition: 'transform 0.2s ease',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              flexShrink: 0
                            }} 
                          />
                        </div>

                        {/* Collapsible Content */}
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 12,
                          maxHeight: isExpanded ? '250px' : '0px',
                          opacity: isExpanded ? 1 : 0,
                          overflow: 'hidden',
                          transition: 'max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, border-top-color 0.2s ease, padding 0.25s ease, margin 0.25s ease',
                          borderTop: '1px solid var(--border-light)',
                          borderTopColor: isExpanded ? 'var(--border-light)' : 'transparent',
                          paddingTop: isExpanded ? 12 : 0,
                          marginTop: isExpanded ? 12 : 0
                        }}>
                          {/* URL */}
                          <div style={{ 
                            fontSize: 11, 
                            color: 'var(--text-muted)', 
                            wordBreak: 'break-all', 
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            display: 'block',
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-main)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border-light)',
                            fontFamily: 'monospace',
                            lineHeight: 1.4
                          }}>
                            {wh.url}
                          </div>

                          {/* Actions */}
                          <div style={{ 
                            display: 'flex', 
                            gap: 8, 
                            justifyContent: 'flex-end', 
                            flexWrap: 'wrap',
                            marginTop: 4
                          }}>
                            <button
                              onClick={() => handleTestWebhook(wh.id)}
                              className="btn btn-outline btn-xs"
                              style={{
                                color: cooldowns[wh.id] > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                borderColor: cooldowns[wh.id] > 0 ? 'var(--border-light)' : 'rgba(59,130,246,0.2)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                transition: 'color 0.2s, border-color 0.2s',
                                cursor: (testingId === wh.id || cooldowns[wh.id] > 0) ? 'not-allowed' : 'pointer',
                                opacity: (testingId === wh.id || cooldowns[wh.id] > 0) ? 0.6 : 1,
                              }}
                              disabled={testingId === wh.id || cooldowns[wh.id] > 0}
                            >
                              {testingId === wh.id ? (
                                <>
                                  <i className="fa-solid fa-spinner fa-spin"></i>
                                  กำลังทดสอบ...
                                </>
                              ) : cooldowns[wh.id] > 0 ? (
                                <>
                                  <i className="fa-solid fa-clock"></i>
                                  รอ {cooldowns[wh.id]}s
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-paper-plane"></i>
                                  ทดสอบ Webhook
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(wh)}
                              className="btn btn-outline btn-xs"
                              title="แก้ไข Webhook"
                              style={{ color: 'var(--primary)', borderColor: 'rgba(59,130,246,0.3)', minWidth: 32 }}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              onClick={() => handleToggleWebhook(wh)}
                              disabled={!!togglingWebhooks[wh.id]}
                              className="btn btn-xs"
                              title={wh.isActive ? 'ปิดการใช้งาน Webhook' : 'เปิดการใช้งาน Webhook'}
                              style={{
                                color: wh.isActive ? 'var(--success)' : 'var(--danger)',
                                backgroundColor: wh.isActive ? 'var(--success-pale)' : 'var(--danger-pale)',
                                borderColor: wh.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderRadius: '20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '3px 10px 3px 6px',
                                cursor: togglingWebhooks[wh.id] ? 'not-allowed' : 'pointer',
                                opacity: togglingWebhooks[wh.id] ? 0.7 : 1
                              }}
                            >
                              {/* Sliding Switch Track (Only part with sliding animation) */}
                              <span style={{
                                width: 28,
                                height: 16,
                                borderRadius: 10,
                                background: wh.isActive ? 'var(--success)' : '#cbd5e1',
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px',
                                position: 'relative',
                                transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}>
                                {/* Sliding Handle Circle */}
                                <span style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  background: '#ffffff',
                                  transform: wh.isActive ? 'translateX(12px)' : 'translateX(0px)',
                                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} />
                              </span>
                              <span>{wh.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteWebhook(wh.id)}
                              className="btn btn-outline btn-xs"
                              style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)', minWidth: 32 }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Edit Webhook form Modal */}
            {editingWebhook && (
              <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingWebhook(null)} style={{ zIndex: 2100 }}>
                <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', overflow: isMobile ? 'hidden' : 'visible' }}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <div className="modal-icon-title">
                        <div className="modal-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--primary-pale)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                          <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        <div>
                          <h2 className="modal-title" style={{ fontSize: 16, fontWeight: 800 }}>แก้ไข Discord Webhook</h2>
                          <p className="modal-subtitle" style={{ fontSize: 12 }}>แก้ไขการตั้งค่าและการเชื่อมต่อข้อมูล</p>
                        </div>
                      </div>
                    </div>
                    <button className="modal-close" onClick={() => setEditingWebhook(null)} aria-label="ปิด">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <form onSubmit={handleUpdateWebhookSubmit} style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: isMobile ? 'auto' : 'visible' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>ชื่อระบบแจ้งเตือน <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="เช่น ห้องแจ้งซ่อมหลัก, Discord แจ้งการจองห้องประชุม"
                          value={editingForm.name}
                          onChange={e => setEditingForm({ ...editingForm, name: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Discord Webhook URL <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="url"
                          required
                          placeholder="https://discord.com/api/webhooks/..."
                          value={editingForm.url}
                          onChange={e => setEditingForm({ ...editingForm, url: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label" style={{ fontWeight: 700, marginBottom: 6, display: 'block' }}>แผนกเป้าหมาย</label>
                        <CustomDropdown
                          icon="building"
                          value={editingForm.targetDepartment}
                          onChange={val => setEditingForm({ ...editingForm, targetDepartment: val })}
                          options={deptOptions}
                          placeholder="ทั้งหมดในระบบ (ทุกแผนก)"
                          inline={isMobile}
                        />
                      </div>

                      <div 
                        onClick={() => setEditingForm({ ...editingForm, allowPrivateTickets: !editingForm.allowPrivateTickets })}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          gap: 12, 
                          padding: '12px 14px', 
                          background: 'var(--bg-main)', 
                          borderRadius: 'var(--radius-md)', 
                          border: `1.5px solid ${editingForm.allowPrivateTickets ? 'var(--primary)' : 'var(--border-light)'}`,
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { if (!editingForm.allowPrivateTickets) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                        onMouseLeave={e => { if (!editingForm.allowPrivateTickets) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, pointerEvents: 'none' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            แจ้งเตือนรายการที่เป็น "เคสเฉพาะส่วนตัว / ส่งตรงถึงหัวหน้า"
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            ถ้าไม่เลือก ระบบจะยิงแจ้งเตือนเฉพาะเคสสาธารณะทั่วไปเข้า Discord
                          </span>
                        </div>

                        {/* Custom Switch Toggle */}
                        <div style={{
                          width: 42,
                          height: 22,
                          borderRadius: 11,
                          background: editingForm.allowPrivateTickets ? 'var(--primary)' : 'var(--border-light)',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                          padding: 3,
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transform: editingForm.allowPrivateTickets ? 'translateX(20px)' : 'translateX(0)',
                            transition: 'transform 0.2s ease'
                          }} />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-light)' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingWebhook(null)}
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                      >
                        บันทึกการแก้ไข
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Webhook form Modal */}
            {showAddForm && (
              <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddForm(false)} style={{ zIndex: 2100 }}>
                <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', overflow: isMobile ? 'hidden' : 'visible' }}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <div className="modal-icon-title">
                        <div className="modal-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--primary-pale)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                          <i className="fa-solid fa-plus"></i>
                        </div>
                        <div>
                          <h2 className="modal-title" style={{ fontSize: 16, fontWeight: 800 }}>เพิ่ม Discord Webhook</h2>
                          <p className="modal-subtitle" style={{ fontSize: 12 }}>เชื่อมต่อระบบส่งข้อมูลเข้าช่อง Discord</p>
                        </div>
                      </div>
                    </div>
                    <button className="modal-close" onClick={() => setShowAddForm(false)} aria-label="ปิด">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <form onSubmit={handleAddWebhook} style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: isMobile ? 'auto' : 'visible' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>ชื่อระบบแจ้งเตือน <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="เช่น ห้องแจ้งซ่อมหลัก, Discord แจ้งการจองห้องประชุม"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Discord Webhook URL <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                          type="url"
                          required
                          placeholder="https://discord.com/api/webhooks/..."
                          value={form.url}
                          onChange={e => setForm({ ...form, url: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label" style={{ fontWeight: 700, marginBottom: 6, display: 'block' }}>แผนกเป้าหมาย</label>
                        <CustomDropdown
                          icon="building"
                          value={form.targetDepartment}
                          onChange={val => setForm({ ...form, targetDepartment: val })}
                          options={deptOptions}
                          placeholder="ทั้งหมดในระบบ (ทุกแผนก)"
                          inline={isMobile}
                        />
                      </div>

                      <div 
                        onClick={() => setForm({ ...form, allowPrivateTickets: !form.allowPrivateTickets })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-main)',
                          border: '1.5px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          marginTop: 8,
                          userSelect: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, pointerEvents: 'none' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                             อนุญาต Private Ticket
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            อนุญาตให้แจ้งเตือน Ticket ที่ส่งหา Manager ลงกลุ่ม Discord
                          </span>
                        </div>
                        
                        {/* Custom Switch Toggle */}
                        <div style={{
                          width: 42,
                          height: 22,
                          borderRadius: 11,
                          background: form.allowPrivateTickets ? 'var(--primary)' : 'var(--border-light)',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                          padding: 3,
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transform: form.allowPrivateTickets ? 'translateX(20px)' : 'translateX(0)',
                            transition: 'transform 0.2s ease'
                          }} />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: 0, borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                      <button
                        type="button"
                        onClick={() => { setShowAddForm(false); setForm({ name: '', url: '', targetDepartment: 'all', allowPrivateTickets: false }); }}
                        className="btn btn-ghost"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        บันทึกข้อมูล
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
