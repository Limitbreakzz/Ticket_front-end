import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';

export default function ReportsView() {
  const { addToast } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Error loading analytics:", err);
      addToast("โหลดข้อมูลสถิติล้มเหลว: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 36, color: 'var(--primary)' }}></i>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>กำลังวิเคราะห์ข้อมูลระบบ...</span>
      </div>
    );
  }

  const summary = analytics?.summary || { total: 0, active: 0, resolved: 0, cancelled: 0 };
  const statusData = analytics?.statusData || [];
  const priorityData = analytics?.priorityData || [];
  const categoryData = analytics?.categoryData || [];
  const departmentData = analytics?.departmentData || [];

  // Calculate resolution rate
  const resolutionRate = summary.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0;

  // Render priority label & color helper
  const getPriorityInfo = (pri) => {
    switch (pri) {
      case 'CRITICAL': return { label: 'วิกฤต', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' };
      case 'HIGH': return { label: 'สูง', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      case 'MEDIUM': return { label: 'ปานกลาง', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
      case 'LOW': return { label: 'ต่ำ', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
      default: return { label: pri, color: 'var(--text-secondary)', bg: 'var(--bg-main)' };
    }
  };

  // Render status label & color helper
  const getStatusInfo = (st) => {
    switch (st) {
      case 'NEW': return { label: 'รอดำเนินการ', color: '#2563eb' };
      case 'IN_PROGRESS': return { label: 'กำลังแก้ไข', color: '#38bdf8' };
      case 'PENDING_APPROVAL': return { label: 'รออนุมัติ', color: '#8b5cf6' };
      case 'APPROVED': return { label: 'อนุมัติแล้ว', color: '#10b981' };
      case 'REJECTED': return { label: 'ปฏิเสธ', color: '#ef4444' };
      case 'FORWARDED': return { label: 'ส่งต่อแผนก', color: '#a855f7' };
      case 'WAITING_PARTS': return { label: 'รออะไหล่/อุปกรณ์', color: '#f59e0b' };
      case 'RESOLVED': return { label: 'แก้ไขเสร็จสิ้น', color: '#10b981' };
      case 'CLOSED': return { label: 'ปิดเคส', color: '#64748b' };
      case 'CANCELLED': return { label: 'ยกเลิก', color: '#94a3b8' };
      default: return { label: st, color: 'var(--text-muted)' };
    }
  };

  return (
    <div className="view-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            รายงาน & สถิติวิเคราะห์
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            ภาพรวมผลการดำเนินงานและสถิติปัญหาภายในระบบ
          </p>
        </div>
        <button 
          onClick={loadAnalytics} 
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <i className="fa-solid fa-arrows-rotate"></i> อัปเดตสถิติ
        </button>
      </div>

      {/* Grid Cards summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
          <div className="stat-icon" style={{ background: 'var(--primary)', color: '#fff' }}>
            <i className="fa-solid fa-ticket"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{summary.total}</div>
            <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>เคสแจ้งปัญหาทั้งหมด</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a' }}>
          <div className="stat-icon" style={{ background: '#f59e0b', color: '#fff' }}>
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#b45309' }}>{summary.active}</div>
            <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>กำลังดำเนินการอยู่</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0' }}>
          <div className="stat-icon" style={{ background: '#10b981', color: '#fff' }}>
            <i className="fa-solid fa-check-double"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#047857' }}>{summary.resolved}</div>
            <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>เคสที่แก้ไขเสร็จสิ้น</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', border: '1px solid #fbcfe8' }}>
          <div className="stat-icon" style={{ background: '#db2777', color: '#fff' }}>
            <i className="fa-solid fa-percent"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#be185d' }}>{resolutionRate}%</div>
            <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>อัตราความสำเร็จ</div>
          </div>
        </div>
      </div>

      {/* Grid Charts visualization */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }} className="reports-grid">
        
        {/* Card: Status distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)' }}></i>
            สัดส่วนตามสถานะเคส (Ticket Status)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {statusData.map(st => {
              const inf = getStatusInfo(st.status);
              const percentage = summary.total > 0 ? Math.round((st.count / summary.total) * 100) : 0;
              return (
                <div key={st.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{inf.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{st.count} เคส ({percentage}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: inf.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
            {statusData.length === 0 && (
              <div style={{ padding: '24px 0', textTransform: 'center', color: 'var(--text-muted)', fontSize: 13 }}>ไม่มีข้อมูลสถานะ</div>
            )}
          </div>
        </div>

        {/* Card: Urgency distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <i className="fa-solid fa-arrow-up-wide-short" style={{ color: 'var(--primary)' }}></i>
            ระดับความเร่งด่วน (Priority)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {priorityData.map(pr => {
              const inf = getPriorityInfo(pr.priority);
              const percentage = summary.total > 0 ? Math.round((pr.count / summary.total) * 100) : 0;
              return (
                <div key={pr.priority}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                    <span style={{ color: inf.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: inf.color }} />
                      {inf.label}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{pr.count} เคส ({percentage}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: inf.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
            {priorityData.length === 0 && (
              <div style={{ padding: '24px 0', textTransform: 'center', color: 'var(--text-muted)', fontSize: 13 }}>ไม่มีข้อมูลความเร่งด่วน</div>
            )}
          </div>
        </div>

        {/* Card: Categories */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)', gridColumn: 'span 2' }} className="full-width-report-card">
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <i className="fa-solid fa-list-check" style={{ color: 'var(--primary)' }}></i>
            แยกตามแผนกเป้าหมายหลัก (Target Departments)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="target-dept-grid">
            {departmentData.map(dept => {
              const percentage = summary.total > 0 ? Math.round((dept.count / summary.total) * 100) : 0;
              return (
                <div key={dept.departmentId || 'default'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{dept.departmentName}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{dept.count} เคส ({percentage}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
            {departmentData.length === 0 && (
              <div style={{ padding: '24px 0', textTransform: 'center', color: 'var(--text-muted)', fontSize: 13, gridColumn: 'span 2' }}>ไม่มีข้อมูลแผนกเป้าหมาย</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
