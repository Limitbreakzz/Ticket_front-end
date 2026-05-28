import React, { useState, useEffect, useRef } from 'react';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  
  // Animation states
  const [isMounting, setIsMounting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsMounting(true), 10);
    
    if (inputRef.current) inputRef.current.focus();
    
    try {
      const saved = localStorage.getItem('helpdesk_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    
    // Add escape key listener
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsMounting(false);
    setTimeout(onClose, 200); // match transition duration
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('helpdesk_recent_searches', JSON.stringify(updated));
    alert(`คุณกำลังค้นหา: ${query}`);
    handleClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('helpdesk_recent_searches');
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      style={{
        background: isMounting ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        backdropFilter: isMounting ? 'blur(8px)' : 'blur(0px)',
        transition: 'all 0.2s ease-out'
      }}
    >
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: 640, 
          width: '90%',
          padding: 0, 
          overflow: 'hidden', 
          alignSelf: 'flex-start', 
          marginTop: isMounting ? '12vh' : '8vh',
          opacity: isMounting ? 1 : 0,
          transform: isMounting ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-lg)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--primary)', fontSize: 20, marginRight: 16 }}></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="ค้นหาข้อมูล, รหัส Ticket, ชื่อพนักงาน..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 18,
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          />
          <button type="button" onClick={handleClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)', 
            borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: 12,
            fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 16,
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            ESC
          </button>
        </form>

        {/* Search Results Area */}
        <div style={{ padding: '16px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
            {!query ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            ประวัติการค้นหา
                        </span>
                        {recentSearches.length > 0 && (
                            <span onClick={clearRecent} style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                            ล้างทั้งหมด
                            </span>
                        )}
                    </div>
                    
                    {recentSearches.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
                        <i className="fa-solid fa-wind" style={{ fontSize: 32, marginBottom: 16, opacity: 0.5 }}></i>
                        <div>ยังไม่มีประวัติการค้นหา</div>
                    </div>
                    ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {recentSearches.map((s, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setQuery(s)}
                            style={{
                            display: 'flex', alignItems: 'center', padding: '12px 16px',
                            borderRadius: 'var(--radius-md)', cursor: 'pointer',
                            background: 'transparent',
                            transition: 'all 0.2s ease',
                            border: '1px solid transparent'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = 'var(--bg-card)';
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0px)';
                            }}
                        >
                            <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-muted)', width: 24, fontSize: 14 }}></i>
                            <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 500 }}>{s}</span>
                            <i className="fa-solid fa-arrow-turn-down fa-rotate-90" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12, opacity: 0.5 }}></i>
                        </div>
                        ))}
                    </div>
                    )}
                </>
            ) : (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
                        กด Enter เพื่อค้นหา
                    </div>
                    <div style={{ fontSize: 18, color: 'var(--primary)', fontWeight: 600 }}>
                        "{query}"
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
