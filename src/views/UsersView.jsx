import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';

export default function UsersView() {
  const { addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' or 'departments'

  // Users states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    departmentId: '',
  });

  // Departments states
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    isActive: true,
  });

  // Load all data
  const loadUsersData = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.adminFetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      addToast('โหลดข้อมูลผู้ใช้ล้มเหลว: ' + err.message, 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDeptsData = async () => {
    setLoadingDepts(true);
    try {
      const data = await api.adminFetchDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
      addToast('โหลดข้อมูลแผนกล้มเหลว: ' + err.message, 'error');
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    loadUsersData();
    loadDeptsData();
  }, []);

  // Handle User Submit
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    // Normalization: email trim and lowercase
    const normalizedEmail = userForm.email.trim().toLowerCase();
    
    if (!userForm.name || !normalizedEmail || (!editingUser && !userForm.password) || !userForm.departmentId) {
      addToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    try {
      const payload = {
        name: userForm.name,
        email: normalizedEmail,
        role: userForm.role,
        departmentId: userForm.departmentId,
      };
      
      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (editingUser) {
        await api.adminUpdateUser(editingUser.id, payload);
        addToast('แก้ไขข้อมูลผู้ใช้สำเร็จ', 'success');
      } else {
        await api.adminCreateUser(payload);
        addToast('สร้างผู้ใช้งานใหม่สำเร็จ', 'success');
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'USER', departmentId: '' });
      loadUsersData();
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบออกด้วย')) {
      try {
        await api.adminDeleteUser(id);
        addToast('ลบผู้ใช้งานเรียบร้อยแล้ว', 'success');
        loadUsersData();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  // Handle Department Submit
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      addToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    try {
      const payload = {
        name: deptForm.name.trim(),
        code: deptForm.code.trim().toUpperCase().replace(/\s+/g, '_'),
        isActive: deptForm.isActive,
      };

      if (editingDept) {
        await api.adminUpdateDepartment(editingDept.id, payload);
        addToast('แก้ไขข้อมูลแผนกสำเร็จ', 'success');
      } else {
        await api.adminCreateDepartment(payload);
        addToast('สร้างแผนกใหม่สำเร็จ', 'success');
      }

      setShowDeptModal(false);
      setEditingDept(null);
      setDeptForm({ name: '', code: '', isActive: true });
      loadDeptsData();
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    }
  };

  // Handle Toggle Dept Active State
  const handleToggleDeptActive = async (dept) => {
    try {
      await api.adminUpdateDepartment(dept.id, { isActive: !dept.isActive });
      addToast(`เปลี่ยนสถานะแผนก ${dept.name} เรียบร้อย`, 'success');
      loadDeptsData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handle Delete Department
  const handleDeleteDept = async (id) => {
    if (window.confirm('คุณต้องการลบแผนกนี้ใช่หรือไม่? ข้อมูลพนักงานในแผนกจะสูญเสียการระบุแผนก')) {
      try {
        await api.adminDeleteDepartment(id);
        addToast('ลบแผนกเรียบร้อยแล้ว', 'success');
        loadDeptsData();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  return (
    <div className="view-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            การจัดการข้อมูลระบบ
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            จัดการข้อมูลผู้ใช้งานและแผนกทั้งหมดของบริษัท
          </p>
        </div>

        {/* Tab switch buttons */}
        <div style={{ display: 'flex', background: 'var(--primary-bg)', padding: 4, borderRadius: 10, border: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setActiveSubTab('users')}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeSubTab === 'users' ? 'var(--bg-card)' : 'transparent',
              color: activeSubTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeSubTab === 'users' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s',
            }}
          >
            <i className="fa-solid fa-users" style={{ marginRight: 6 }}></i>
            ผู้ใช้งาน
          </button>
          <button
            onClick={() => setActiveSubTab('departments')}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeSubTab === 'departments' ? 'var(--bg-card)' : 'transparent',
              color: activeSubTab === 'departments' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeSubTab === 'departments' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.18s',
            }}
          >
            <i className="fa-solid fa-sitemap" style={{ marginRight: 6 }}></i>
            แผนกงาน
          </button>
        </div>
      </div>

      {activeSubTab === 'users' ? (
        // ================= USERS TAB =================
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="section-title">👥 รายการผู้ใช้งาน ({users.length} คน)</span>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserForm({ name: '', email: '', password: '', role: 'USER', departmentId: departments[0]?.id || '' });
                setShowUserModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <i className="fa-solid fa-user-plus"></i> เพิ่มผู้ใช้งาน
            </button>
          </div>

          <div className="table-card">
            {loadingUsers ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 8 }}></i>
                <div>กำลังโหลดข้อมูล...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-users-slash" style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.5, display: 'block', marginBottom: 8 }}></i>
                <div className="empty-state-title">ไม่พบรายชื่อผู้ใช้</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ชื่อพนักงาน</th>
                      <th>อีเมล</th>
                      <th>บทบาท</th>
                      <th>แผนก</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: u.role === 'ADMIN' ? '#7c3aed' : u.role === 'MANAGER' ? '#10b981' : '#2563eb',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: 12
                            }}>
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="status-tag" style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: u.role === 'ADMIN' ? 'var(--critical-pale)' : u.role === 'MANAGER' ? 'var(--success-pale)' : 'var(--primary-pale)',
                            color: u.role === 'ADMIN' ? 'var(--critical)' : u.role === 'MANAGER' ? '#065f46' : 'var(--primary)',
                            border: u.role === 'ADMIN' ? '1px solid rgba(124,58,237,0.2)' : u.role === 'MANAGER' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(37,99,235,0.2)',
                            display: 'inline-block'
                          }}>
                            {u.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : u.role === 'MANAGER' ? 'หัวหน้าแผนก' : 'พนักงานทั่วไป'}
                          </span>
                        </td>
                        <td>{u.department ? u.department.name : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserForm({
                                  name: u.name,
                                  email: u.email,
                                  password: '',
                                  role: u.role,
                                  departmentId: u.departmentId || '',
                                });
                                setShowUserModal(true);
                              }}
                              className="btn btn-outline btn-xs"
                              disabled={u.role === 'ADMIN'}
                              title={u.role === 'ADMIN' ? 'ไม่สามารถแก้ไข Admin บัญชีหลักได้' : 'แก้ไข'}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-outline btn-xs"
                              style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                              disabled={u.role === 'ADMIN'}
                              title={u.role === 'ADMIN' ? 'ไม่สามารถลบ Admin ได้' : 'ลบ'}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ================= DEPARTMENTS TAB =================
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="section-title">📂 รายการแผนกในระบบ ({departments.length} แผนก)</span>
            <button
              onClick={() => {
                setEditingDept(null);
                setDeptForm({ name: '', code: '', isActive: true });
                setShowDeptModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <i className="fa-solid fa-folder-plus"></i> เพิ่มแผนกใหม่
            </button>
          </div>

          <div className="table-card">
            {loadingDepts ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 8 }}></i>
                <div>กำลังโหลดข้อมูล...</div>
              </div>
            ) : departments.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-folder-minus" style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.5, display: 'block', marginBottom: 8 }}></i>
                <div className="empty-state-title">ไม่พบรายการแผนก</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ชื่อแผนกงาน</th>
                      <th>รหัสแผนก</th>
                      <th>จำนวนบุคลากร</th>
                      <th>สถานะ</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</span>
                        </td>
                        <td>
                          <code style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{d.code}</code>
                        </td>
                        <td>{d._count?.users || 0} คน</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: d.isActive ? 'var(--success)' : 'var(--danger)',
                              display: 'inline-block'
                            }} />
                            <span style={{ fontSize: 13, color: d.isActive ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {d.isActive ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              onClick={() => handleToggleDeptActive(d)}
                              className="btn btn-outline btn-xs"
                              style={{
                                color: d.isActive ? 'var(--danger)' : 'var(--success)',
                                borderColor: d.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'
                              }}
                              title={d.isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                            >
                              <i className={`fa-solid fa-${d.isActive ? 'toggle-on' : 'toggle-off'}`} style={{ fontSize: 14 }}></i>
                            </button>
                            <button
                              onClick={() => {
                                setEditingDept(d);
                                setDeptForm({
                                  name: d.name,
                                  code: d.code,
                                  isActive: d.isActive,
                                });
                                setShowDeptModal(true);
                              }}
                              className="btn btn-outline btn-xs"
                              title="แก้ไข"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteDept(d.id)}
                              className="btn btn-outline btn-xs"
                              style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                              title="ลบ"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= USER FORM MODAL ================= */}
      {showUserModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            width: '100%', maxWidth: 480, padding: 24,
            boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)',
            margin: 16
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-user-gear" style={{ color: 'var(--primary)' }}></i>
              {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </h3>

            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย มีสุข"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>อีเมล</label>
                <input
                  type="email"
                  required
                  placeholder="เช่น somchai.m@company.com"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  รหัสผ่าน {editingUser && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(เว้นว่างหากไม่เปลี่ยน)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="รหัสผ่านสำหรับล็อกอิน"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>ระดับผู้ใช้งาน (Role)</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="USER">พนักงานทั่วไป (USER)</option>
                    <option value="MANAGER">หัวหน้าแผนก (MANAGER)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>สังกัดแผนกงาน</label>
                  <select
                    value={userForm.departmentId}
                    required
                    onChange={e => setUserForm({ ...userForm, departmentId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                  className="btn btn-outline"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: 13 }}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DEPARTMENT FORM MODAL ================= */}
      {showDeptModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16,
            width: '100%', maxWidth: 440, padding: 24,
            boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)',
            margin: 16
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-folder-plus" style={{ color: 'var(--primary)' }}></i>
              {editingDept ? 'แก้ไขข้อมูลแผนก' : 'เพิ่มแผนกงานใหม่'}
            </h3>

            <form onSubmit={handleDeptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>ชื่อแผนกงาน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แผนก QA, ฝ่ายบรรจุภัณฑ์"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>รหัสแผนก (ภาษาอังกฤษตัวพิมพ์ใหญ่)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น QA_DEPT, PACKAGING"
                  value={deptForm.code}
                  onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 13.5, background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="dept-active"
                  checked={deptForm.isActive}
                  onChange={e => setDeptForm({ ...deptForm, isActive: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="dept-active" style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                  เปิดใช้งานแผนกนี้ทันที
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowDeptModal(false); setEditingDept(null); }}
                  className="btn btn-outline"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: 13 }}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
