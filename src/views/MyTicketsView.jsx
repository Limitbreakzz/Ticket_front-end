import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_INFO, ROLES } from '../data/mockData';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';

export default function MyTicketsView({ filterOverride }) {
  const { tickets, role } = useApp();
  const [showForm, setShowForm] = useState(false);
  const info = ROLE_INFO[role];

  // filterOverride lets admin routes (escalated, assign) pass a pre-filtered list
  const myTickets = filterOverride ?? (
    role === ROLES.EMPLOYEE
      ? tickets.filter(t => t.createdBy === info.name)
      : tickets
  );

  const getHeaderTitle = () => {
    if (role === ROLES.EMPLOYEE) return 'Ticket ของฉัน';
    if (role === ROLES.MANAGER) return 'Ticket ของแผนก';
    return 'Ticket ทั้งหมด';
  };

  return (
    <div className="view-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {filterOverride ? `รายการที่กรองแล้ว` : getHeaderTitle()}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {myTickets.length} รายการ
          </p>
        </div>
        {role === ROLES.EMPLOYEE && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} id="create-ticket-btn">
            <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i> แจ้งเรื่องใหม่
          </button>
        )}
      </div>

      <TicketTable tickets={myTickets} title="รายการทั้งหมด" />
      {showForm && <TicketFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
