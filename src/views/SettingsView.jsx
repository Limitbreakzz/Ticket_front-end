import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';

export default function SettingsView() {
  const { addToast } = useApp();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    url: '',
  });

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const data = await api.fetchWebhooks();
      setWebhooks(data);
    } catch (err) {
      console.error(err);
      addToast('โหลดข้อมูล Webhook ล้มเหลว: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

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
      });
      addToast('เพิ่ม Discord Webhook สำเร็จ', 'success');
      setForm({ name: '', url: '' });
      setShowAddForm(false);
      loadWebhooks();
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    }
  };

  const handleToggleWebhook = async (webhook) => {
    try {
      await api.updateWebhook(webhook.id, { isActive: !webhook.isActive });
      addToast(`เปลี่ยนสถานะการใช้งานสำเร็จ`, 'success');
      loadWebhooks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (window.confirm('คุณต้องการลบ Webhook นี้ใช่หรือไม่? ระบบจะหยุดส่งแจ้งเตือนออกช่องทางนี้')) {
      try {
        await api.deleteWebhook(id);
        addToast('ลบ Webhook เรียบร้อยแล้ว', 'success');
        loadWebhooks();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  return (
    <div className="view-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            ตั้งค่าการแจ้งเตือน Webhook
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            ตั้งค่าและเชื่อมโยงการแจ้งเตือนงานไปยังแพลตฟอร์มภายนอก (เช่น Discord)
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showAddForm ? '1.5fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Webhooks list Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-brands fa-discord" style={{ color: '#5865F2', fontSize: 18 }}></i>
              การแจ้งเตือนผ่าน Discord ({webhooks.length} รายการ)
            </span>
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)} 
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <i className="fa-solid fa-plus"></i> เพิ่ม Webhook
              </button>
            )}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {webhooks.map(wh => (
                <div key={wh.id} style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  background: wh.isActive ? 'var(--bg-card)' : 'rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: 'var(--shadow-sm)',
                  opacity: wh.isActive ? 1 : 0.75,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{wh.name}</span>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontWeight: 700,
                        background: wh.isActive ? 'var(--success-pale)' : 'rgba(0,0,0,0.08)',
                        color: wh.isActive ? 'var(--success)' : 'var(--text-muted)'
                      }}>
                        {wh.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {wh.url}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => handleToggleWebhook(wh)}
                      className="btn btn-outline btn-xs"
                      style={{
                        color: wh.isActive ? 'var(--danger)' : 'var(--success)',
                        borderColor: wh.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <i className={`fa-solid fa-${wh.isActive ? 'toggle-on' : 'toggle-off'}`} style={{ fontSize: 14 }}></i>
                      {wh.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
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
              ))}
            </div>
          )}
        </div>

        {/* Add Webhook form Card */}
        {showAddForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i>
              เพิ่มการเชื่อมต่อใหม่
            </h3>

            <form onSubmit={handleAddWebhook} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>ชื่อระบบแจ้งเตือน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ห้องแจ้งซ่อมหลัก, Discord แจ้งการจองห้องประชุม"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Discord Webhook URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://discord.com/api/webhooks/..."
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setForm({ name: '', url: '' }); }}
                  className="btn btn-outline btn-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
