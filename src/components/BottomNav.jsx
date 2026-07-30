import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';

export default function BottomNav() {
  const { role, activeNav, setActiveNav, tickets, setShowCreateModal, currentUser } = useApp();

  const getNavItems = () => {
    switch (role) {
      case ROLES.USER:
      case ROLES.EMPLOYEE:
        return [
          { id: 'dashboard', icon: 'house', label: 'หน้าแรก' },
          { id: 'my-own-tickets', icon: 'list', label: 'งานของฉัน' },
          { id: 'create-ticket', icon: 'plus', label: 'สร้าง', isPrimary: true, isModal: true },
          { id: 'track', icon: 'ticket', label: 'Ticket ของฉัน' },
          { id: 'profile', icon: 'user', label: 'โปรไฟล์' }
        ];
      case ROLES.MANAGER:
        return [
          { id: 'dashboard', icon: 'house', label: 'หน้าแรก' },
          { id: 'dept-tickets', icon: 'layer-group', label: 'Ticket แผนก' },
          { id: 'create-ticket', icon: 'plus', label: 'สร้าง', isPrimary: true, isModal: true },
          { id: 'reports', icon: 'chart-line', label: 'การจัดการแผนก' },
          { id: 'profile', icon: 'user', label: 'โปรไฟล์' }
        ];
      case ROLES.ADMIN:
        return [
          { id: 'dashboard', icon: 'house', label: 'หน้าแรก' },
          { id: 'all-tickets', icon: 'layer-group', label: 'Ticket ทั้งหมด' },
          { id: 'create-ticket', icon: 'plus', label: 'สร้าง', isPrimary: true, isModal: true },
          { id: 'settings', icon: 'gear', label: 'ระบบ' },
          { id: 'profile', icon: 'user', label: 'โปรไฟล์' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Check if nav item is active — settings/reports nav also active for sub-pages
  const isActive = (item) => {
    if (item.id === 'settings') {
      return ['settings', 'reports', 'sla'].includes(activeNav);
    }
    if (item.id === 'reports' && role === ROLES.MANAGER) {
      return ['reports', 'approval', 'sla'].includes(activeNav);
    }
    return activeNav === item.id;
  };

  const handleNavClick = (item) => {
    if (item.isModal) {
      setShowCreateModal(true);
    } else {
      setActiveNav(item.id);
    }
  };

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`bottom-nav-item ${isActive(item) ? 'active' : ''} ${item.isPrimary ? 'primary' : ''}`}
          onClick={() => handleNavClick(item)}
          aria-label={item.label}
        >
          <div className="icon-wrapper">
            <i className={`fa-solid fa-${item.icon}`}></i>
            {item.badge > 0 && (
              <span 
                className="bottom-nav-badge"
                style={item.isYellow ? { background: '#eab308', color: '#1e3a5f', fontWeight: '800' } : {}}
              >
                {item.badge}
              </span>
            )}
          </div>
          <span className="label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
