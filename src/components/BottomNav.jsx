import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';

export default function BottomNav() {
  const { role, activeNav, setActiveNav } = useApp();

  const getNavItems = () => {
    switch (role) {
      case ROLES.USER:
      case ROLES.EMPLOYEE:
        return [
          { id: 'dashboard', icon: 'house', label: 'หน้าแรก' },
          { id: 'my-tickets', icon: 'list', label: 'งานของฉัน' },
          { id: 'create-ticket', icon: 'plus', label: 'แจ้งเรื่อง', isPrimary: true },
          { id: 'track', icon: 'magnifying-glass', label: 'ติดตาม' },
          { id: 'profile', icon: 'user', label: 'โปรไฟล์' }
        ];
      case ROLES.MANAGER:
        return [
          { id: 'dashboard', icon: 'house', label: 'หน้าแรก' },
          { id: 'dept-tickets', icon: 'layer-group', label: 'กระดานคิว' },
          { id: 'create-ticket', icon: 'plus', label: 'แจ้งเรื่อง', isPrimary: true },
          { id: 'approval', icon: 'clipboard-check', label: 'อนุมัติ', badge: 3 },
          { id: 'profile', icon: 'user', label: 'โปรไฟล์' }
        ];
      case ROLES.ADMIN:
        return [
          { id: 'dashboard', icon: 'house', label: 'หน้าแรก' },
          { id: 'all-tickets', icon: 'layer-group', label: 'กระดานคิว' },
          { id: 'create-ticket', icon: 'plus', label: 'แจ้งเรื่อง', isPrimary: true },
          { id: 'settings', icon: 'gear', label: 'จัดการ' },
          { id: 'profile', icon: 'user', label: 'โปรไฟล์' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activeNav === item.id ? 'active' : ''} ${item.isPrimary ? 'primary' : ''}`}
          onClick={() => setActiveNav(item.id)}
        >
          <div className="icon-wrapper">
            <i className={`fa-solid fa-${item.icon}`}></i>
            {item.badge && <span className="bottom-nav-badge">{item.badge}</span>}
          </div>
          <span className="label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
