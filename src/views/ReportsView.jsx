import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';
import { ReportsSkeleton } from '../components/PageSkeletons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export default function ReportsView() {
  const { tickets, role, currentUser, addToast, setActiveNav } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detection for mobile layout
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAnalytics = useCallback(async (active = true, force = false) => {
    const cachedData = sessionStorage.getItem('cached_analytics');
    const cachedTime = sessionStorage.getItem('cached_analytics_time');
    const now = Date.now();

    if (!force && cachedData && cachedTime && (now - Number(cachedTime) < 15000)) {
      if (active) {
        setAnalytics(JSON.parse(cachedData));
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    setRefreshing(true);
    const startTime = Date.now();
    try {
      const data = await api.fetchAnalytics();
      if (!active) return;

      if (force) {
        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
        }
      }

      setAnalytics(data);
      sessionStorage.setItem('cached_analytics', JSON.stringify(data));
      sessionStorage.setItem('cached_analytics_time', String(Date.now()));
    } catch (err) {
      console.error("Error loading analytics:", err);
      if (active) {
        if (cachedData) {
          setAnalytics(JSON.parse(cachedData));
        }
        addToast("โหลดข้อมูลสถิติล้มเหลว: " + err.message, "error");
      }
    } finally {
      if (active) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    let active = true;
    loadAnalytics(active, false);
    return () => {
      active = false;
    };
  }, [loadAnalytics]);

  if ((loading && !analytics) || refreshing) {
    return <ReportsSkeleton />;
  }

  const summary = analytics?.summary || { total: 0, active: 0, resolved: 0, cancelled: 0 };
  const statusDataRaw = analytics?.statusData || [];
  const priorityDataRaw = analytics?.priorityData || [];
  const categoryDataRaw = analytics?.categoryData || [];
  const departmentDataRaw = analytics?.departmentData || [];

  // Calculate resolution rate
  const resolutionRate = summary.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0;

  // Helpers to get priority meta
  const getPriorityInfo = (pri) => {
    switch (pri) {
      case 'CRITICAL': return { label: 'วิกฤต', color: '#8b5cf6' };
      case 'HIGH': return { label: 'สูง', color: '#ef4444' };
      case 'MEDIUM': return { label: 'ปานกลาง', color: '#f59e0b' };
      case 'LOW': return { label: 'ต่ำ', color: '#10b981' };
      default: return { label: pri, color: '#94a3b8' };
    }
  };

  // Helpers to get category meta
  const getCategoryInfo = (cat) => {
    const key = cat ? cat.toLowerCase() : '';
    switch (key) {
      case 'hardware': return { label: 'ฮาร์ดแวร์ / อุปกรณ์', color: '#e67e22' };
      case 'software': return { label: 'ซอฟต์แวร์ / โปรแกรม', color: '#3498db' };
      case 'network':  return { label: 'อินเทอร์เน็ต / Wi-Fi', color: '#eab308' };
      case 'access':   return { label: 'สิทธิ์เข้าใช้งาน', color: '#9b59b6' };
      case 'other':    return { label: 'ทั่วไป / บริการอื่นๆ', color: '#95a5a6' };
      default:         return { label: cat, color: '#64748b' };
    }
  };

  // Helpers to get status meta
  const getStatusInfo = (st) => {
    switch (st) {
      case 'NEW': return { label: 'รอดำเนินการ', color: '#2563eb' };
      case 'IN_PROGRESS': return { label: 'กำลังแก้ไข', color: '#38bdf8' };
      case 'PENDING_APPROVAL': return { label: 'รออนุมัติ', color: '#8b5cf6' };
      case 'APPROVED': return { label: 'อนุมัติแล้ว', color: '#10b981' };
      case 'REJECTED': return { label: 'ปฏิเสธ', color: '#ef4444' };
      case 'FORWARDED': return { label: 'ส่งต่อแผนก', color: '#a855f7' };
      case 'WAITING_PARTS': return { label: 'รออุปกรณ์', color: '#f59e0b' };
      case 'RESOLVED': return { label: 'เสร็จสิ้น', color: '#10b981' };
      case 'CLOSED': return { label: 'ปิดเคส', color: '#64748b' };
      case 'CANCELLED': return { label: 'ยกเลิก', color: '#94a3b8' };
      default: return { label: st, color: '#94a3b8' };
    }
  };

  // Format Recharts friendly data arrays
  const formattedStatusData = statusDataRaw.map(st => {
    const info = getStatusInfo(st.status);
    return { name: info.label, value: st.count, color: info.color };
  });

  const formattedPriorityData = priorityDataRaw.map(pr => {
    const info = getPriorityInfo(pr.priority);
    return { name: info.label, value: pr.count, color: info.color };
  });

  const formattedCategoryData = categoryDataRaw.map(cat => {
    const info = getCategoryInfo(cat.category || cat.categoryName);
    return { name: info.label, value: cat.count, color: info.color };
  });

  const formattedDepartmentData = departmentDataRaw.map(dept => ({
    name: dept.departmentName || 'ไม่ระบุ',
    value: dept.count || 0
  }));

  // Top agents workload calculation (For Manager view - strictly staff assigned to cases targeted to manager's department)
  const myDeptName = currentUser?.department?.name || currentUser?.departmentName || (typeof currentUser?.department === 'string' ? currentUser.department : null);
  const agentMap = {};
  (tickets || []).forEach(t => {
    if (t.assignedTo && t.assignedTo !== 'รอมอบหมาย') {
      const inMyTargetDept = myDeptName && (t.targetDepartment === myDeptName);
      if (inMyTargetDept || role === 'admin') {
        agentMap[t.assignedTo] = (agentMap[t.assignedTo] || 0) + 1;
      }
    }
  });

  const formattedAgentData = Object.keys(agentMap)
    .map(name => ({ name, value: agentMap[name] }))
    .sort((a, b) => b.value - a.value);



  return (
    <div style={{ position: 'relative', minHeight: '450px', paddingBottom: '24px', paddingLeft: isMobile ? '8px' : 0, paddingRight: isMobile ? '8px' : 0 }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary)', fontSize: isMobile ? 18 : 22 }} aria-hidden="true" />
            {role === 'manager' ? 'รายงานสถิติผลงานประจำแผนก' : 'รายงาน & สถิติวิเคราะห์'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>ภาพรวมผลการดำเนินงานและสถิติวิเคราะห์ระบบสารสนเทศ</span>
            {role === 'manager' && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--primary-pale)', color: 'var(--primary)', fontWeight: 700, border: '1px solid rgba(37,99,235,0.2)' }}>
                <i className="fa-solid fa-building" style={{ marginRight: 4 }} />
                เฉพาะแผนก {currentUser?.department?.name || currentUser?.departmentName || 'ของท่าน'}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <button 
            onClick={() => loadAnalytics(true, true)} 
            disabled={loading || refreshing}
            className="btn btn-primary btn-sm"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              fontWeight: 700,
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <i className={`fa-solid ${refreshing ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`}></i> 
            {refreshing ? 'กำลังอัปเดต...' : 'อัปเดตสถิติ'}
          </button>
        </div>
      </div>

      {/* Premium KPI grid cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: isMobile ? '12px' : '20px', 
        marginBottom: '24px' 
      }}>
        {/* Card 1: ทั้งหมด */}
        <div className="kpi-card" style={{ 
          padding: isMobile ? '14px 16px' : '20px 24px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(37,99,235,0.03) 100%)', 
          border: '1.5px solid #474d55ff',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? '100px' : '120px',
          position: 'relative',
          transition: 'var(--transition)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>แจ้งปัญหาทั้งหมด</span>
            <div className="kpi-icon-box" style={{ 
              width: isMobile ? 32 : 38, 
              height: isMobile ? 32 : 38, 
              borderRadius: 10, 
              background: '#E2E8F0', 
              color: '#676e78ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: isMobile ? 15 : 18 
            }}>
              <i className="fa-solid fa-ticket"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{summary.total}</div>
        </div>

        {/* Card 2: กำลังดำเนินการ */}
        <div className="kpi-card" style={{ 
          padding: isMobile ? '14px 16px' : '20px 24px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(245,158,11,0.03) 100%)', 
          border: '1.5px solid #F59E0B',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? '100px' : '120px',
          position: 'relative',
          transition: 'var(--transition)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>กำลังดำเนินการ</span>
            <div className="kpi-icon-box" style={{ 
              width: isMobile ? 32 : 38, 
              height: isMobile ? 32 : 38, 
              borderRadius: 10, 
              background: '#FEF3C7', 
              color: '#D97706', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: isMobile ? 15 : 18 
            }}>
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{summary.active}</div>
        </div>

        {/* Card 3: แก้ไขเสร็จสิ้น */}
        <div className="kpi-card" style={{ 
          padding: isMobile ? '14px 16px' : '20px 24px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34,197,94,0.03) 100%)', 
          border: '1.5px solid #10b981',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? '100px' : '120px',
          position: 'relative',
          transition: 'var(--transition)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>แก้ไขเสร็จสิ้น</span>
            <div className="kpi-icon-box" style={{ 
              width: isMobile ? 32 : 38, 
              height: isMobile ? 32 : 38, 
              borderRadius: 10, 
              background: '#D1FAE5', 
              color: '#059669', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: isMobile ? 15 : 18 
            }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{summary.resolved}</div>
        </div>

        {/* Card 4: อัตราความสำเร็จ */}
        <div className="kpi-card" style={{ 
          padding: isMobile ? '14px 16px' : '20px 24px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(139,92,246,0.03) 100%)', 
          border: '1.5px solid #8b5cf6',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? '100px' : '120px',
          position: 'relative',
          transition: 'var(--transition)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="kpi-label" style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>อัตราความสำเร็จ</span>
            <div className="kpi-icon-box" style={{ 
              width: isMobile ? 32 : 38, 
              height: isMobile ? 32 : 38, 
              borderRadius: 10, 
              background: '#F5F3FF', 
              color: '#7c3aed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: isMobile ? 15 : 18 
            }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{resolutionRate}%</div>
        </div>
      </div>

      {/* Grid Charts visualization with Recharts Interactive Widgets */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Card 1: Interactive Bar Chart (Status Distribution) */}
        <div className="premium-chart-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 12, margin: 0 }}>
            <i className="fa-solid fa-chart-bar" style={{ color: '#818cf8' }}></i>
            สัดส่วนตามสถานะเคส
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {formattedStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedStatusData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} interval={0} style={{ fontSize: '11px' }} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {formattedStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>ไม่มีข้อมูลสถานะ</div>
            )}
          </div>
        </div>

        {/* Card 2: Interactive Bar Chart (Urgency Distribution) */}
        <div className="premium-chart-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 12, margin: 0 }}>
            <i className="fa-solid fa-chart-bar" style={{ color: '#f59e0b' }}></i>
            ระดับความเร่งด่วน
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {formattedPriorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedPriorityData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} interval={0} style={{ fontSize: '11px' }} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {formattedPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>ไม่มีข้อมูลความเร่งด่วน</div>
            )}
          </div>
        </div>

        {/* Card 3: Interactive Bar Chart (Category Distribution) */}
        <div className="premium-chart-card" style={{ height: isMobile ? '460px' : '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 12, margin: 0 }}>
            <i className="fa-solid fa-tags" style={{ color: '#10b981' }}></i>
            สัดส่วนแยกตามหมวดหมู่
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {formattedCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedCategoryData}
                    cx={isMobile ? "50%" : "40%"}
                    cy={isMobile ? "35%" : "50%"}
                    innerRadius={isMobile ? 45 : 75}
                    outerRadius={isMobile ? 70 : 110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {formattedCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value) => [`${value} เคส`, 'จำนวน']}
                  />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"} 
                    align={isMobile ? "center" : "right"} 
                    verticalAlign={isMobile ? "bottom" : "middle"} 
                    iconType="circle"
                    iconSize={10}
                    formatter={(value, entry) => {
                      const count = entry?.payload?.value || 0;
                      return (
                        <span style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: 600, 
                          fontSize: '12px',
                          display: 'inline-block',
                          verticalAlign: 'middle',
                          marginLeft: '4px'
                        }}>
                          {value}
                          <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', marginLeft: '6px' }}>
                            ({count} เคส)
                          </span>
                        </span>
                      );
                    }}
                    wrapperStyle={{ 
                      maxHeight: isMobile ? '160px' : 'none',
                      overflowY: 'auto',
                      paddingLeft: isMobile ? '0px' : '30px',
                      paddingBottom: isMobile ? '8px' : '0px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>ไม่มีข้อมูลหมวดหมู่</div>
            )}
          </div>
        </div>

        {/* Card 4: Target Departments / Top Agents Interactive Grid & Chart */}
        <div className="premium-chart-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 4px 0' }}>
              <i className={`fa-solid fa-${role === 'manager' ? 'user-gear' : 'building-user'}`} style={{ color: '#38bdf8' }}></i>
              {role === 'manager' ? 'ภาระงานเจ้าหน้าที่ผู้รับงานประจำแผนก' : 'สถิติ Ticket แยกตามแผนกผู้รับงาน'}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 26 }}>
              {role === 'manager' ? 'เปรียบเทียบสถิติจำนวนเคสที่พนักงานแต่ละคนในแผนกรับผิดชอบดูแล' : 'จำนวนเคสแจ้งซ่อมที่ถูกส่งเข้าแผนกผู้ให้บริการ'}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, paddingRight: 4 }}>
            {role === 'manager' ? (
              formattedAgentData.length > 0 ? (
                <div style={{ height: '100%', overflowY: 'auto', paddingRight: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, alignContent: 'start' }}>
                  {formattedAgentData.map((agent, index) => {
                    const maxVal = Math.max(...formattedAgentData.map(a => a.value), 1);
                    const pct = Math.round((agent.value / maxVal) * 100);
                    const colors = [
                      { bg: 'rgba(37,99,235,0.1)', text: '#2563eb', bar: 'linear-gradient(90deg, #2563eb, #60a5fa)' },
                      { bg: 'rgba(16,185,129,0.1)', text: '#10b981', bar: 'linear-gradient(90deg, #10b981, #34d399)' },
                      { bg: 'rgba(245,158,11,0.1)', text: '#d97706', bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
                      { bg: 'rgba(139,92,246,0.1)', text: '#7c3aed', bar: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
                      { bg: 'rgba(236,72,153,0.1)', text: '#db2777', bar: 'linear-gradient(90deg, #ec4899, #f472b6)' }
                    ];
                    const theme = colors[index % colors.length];

                    return (
                      <div 
                        key={index} 
                        style={{ 
                          padding: '12px 14px', 
                          borderRadius: 12, 
                          background: 'var(--bg-main)', 
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: '50%', 
                              background: theme.bg, 
                              color: theme.text, 
                              fontWeight: 800, 
                              fontSize: 13, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>เจ้าหน้าที่ปฏิบัติงาน</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>
                            {agent.value} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>เคส</span>
                          </div>
                        </div>

                        <div style={{ height: 6, width: '100%', background: 'var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: theme.bar, borderRadius: 10 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  ไม่มีข้อมูลเจ้าหน้าที่ผู้รับงานในแผนก
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }}>
                {formattedDepartmentData.length > 0 ? (
                  formattedDepartmentData.map((dept, index) => {
                    const maxVal = Math.max(...formattedDepartmentData.map(d => d.value), 1);
                    const pct = Math.round((dept.value / maxVal) * 100);
                    const gradients = [
                      { from: '#3b82f6', to: '#60a5fa', shadow: 'rgba(59, 130, 246, 0.2)' },
                      { from: '#10b981', to: '#34d399', shadow: 'rgba(16, 185, 129, 0.2)' },
                      { from: '#f59e0b', to: '#fbbf24', shadow: 'rgba(245, 158, 11, 0.2)' },
                      { from: '#8b5cf6', to: '#a78bfa', shadow: 'rgba(139, 92, 246, 0.2)' },
                      { from: '#ec4899', to: '#f472b6', shadow: 'rgba(236, 72, 153, 0.2)' },
                      { from: '#06b6d4', to: '#22d3ee', shadow: 'rgba(6, 182, 212, 0.2)' },
                      { from: '#f97316', to: '#fb923c', shadow: 'rgba(249, 115, 22, 0.2)' }
                    ];
                    const grad = gradients[index % gradients.length];
                    return (
                      <div key={index} style={{ padding: '2px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-primary)' }}>{dept.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{dept.value} เคส</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                          <div 
                            style={{ 
                              width: `${pct}%`, 
                              height: '100%', 
                              background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`, 
                              borderRadius: 10,
                              boxShadow: `0 0 8px ${grad.shadow}` 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>ไม่มีข้อมูลแผนกเป้าหมาย</div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
