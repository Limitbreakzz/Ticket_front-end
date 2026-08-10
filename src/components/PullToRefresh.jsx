import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function PullToRefresh({ children, onRefresh }) {
  const { 
    reloadTickets, 
    addToast, 
    setShowCreateModal, 
    activeTicketId, 
    closeTicketDetail 
  } = useApp();

  const [pullDistance, setPullDistance] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(1); // 0 = Left (Create), 1 = Center (Reload), 2 = Right (Close)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isPulling = useRef(false);
  const pullDistanceRef = useRef(0);
  const dragXRef = useRef(0);

  const THRESHOLD = 65;
  const MAX_PULL = 110;

  // Helper to get scroll top of current scroll container (.full-screen-detail-view, .page-content or window)
  const getScrollTop = () => {
    const detailView = document.querySelector('.full-screen-detail-view');
    if (detailView) return detailView.scrollTop;

    const pageContent = document.querySelector('.page-content');
    if (pageContent) return pageContent.scrollTop;
    return window.scrollY || document.documentElement.scrollTop || 0;
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      const scrollTop = getScrollTop();
      if (scrollTop <= 2 && !isRefreshing) {
        touchStartY.current = e.touches[0].clientY;
        touchStartX.current = e.touches[0].clientX;
        isPulling.current = true;
        setSelectedIndex(1); // Default to center (Reload)
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;

      const scrollTop = getScrollTop();
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartY.current;
      const deltaX = currentX - touchStartX.current;

      // Only pull down if scroll position is at the very top AND user is pulling downwards
      if (scrollTop <= 2 && deltaY > 0) {
        // Prevent default scrolling on mobile device when pulling down to avoid double scroll
        if (e.cancelable) e.preventDefault();

        const distance = Math.min(MAX_PULL, deltaY * 0.45);
        pullDistanceRef.current = distance;
        dragXRef.current = deltaX;
        setPullDistance(distance);
        setDragX(deltaX);

        // Determine highlighted option based on horizontal drag offset
        if (distance > 35) {
          if (deltaX < -50) {
            setSelectedIndex(0); // Left
          } else if (deltaX > 50) {
            setSelectedIndex(2); // Right
          } else {
            setSelectedIndex(1); // Center
          }
        } else {
          setSelectedIndex(1);
        }
      } else {
        if (pullDistanceRef.current !== 0) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
          setDragX(0);
        }
        isPulling.current = false;
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      const currentDistance = pullDistanceRef.current;
      const finalIndex = selectedIndex;

      if (currentDistance >= THRESHOLD && !isRefreshing) {
        if (finalIndex === 1) {
          // Center: Refresh Action
          setIsRefreshing(true);
          pullDistanceRef.current = 80;
          setPullDistance(80);

          try {
            if (onRefresh) {
              await onRefresh();
            } else if (reloadTickets) {
              await reloadTickets(true, true);
            }
            addToast?.('อัปเดตข้อมูลล่าสุดเรียบร้อยแล้ว', 'success', 'รีเฟรชข้อมูล');
          } catch (err) {
            console.error('Pull to refresh failed:', err);
          } finally {
            setTimeout(() => {
              setIsRefreshing(false);
              pullDistanceRef.current = 0;
              setPullDistance(0);
              setDragX(0);
            }, 600);
          }
        } else if (finalIndex === 0) {
          // Left: Open Create Ticket modal
          setShowCreateModal?.(true);
          pullDistanceRef.current = 0;
          setPullDistance(0);
          setDragX(0);
        } else if (finalIndex === 2) {
          // Right: Close details if active
          if (activeTicketId && closeTicketDetail) {
            closeTicketDetail();
          } else {
            addToast?.('ไม่มีหน้าต่างรายละเอียดให้ปิดในขณะนี้', 'info', 'การแจ้งเตือน');
          }
          pullDistanceRef.current = 0;
          setPullDistance(0);
          setDragX(0);
        }
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        setDragX(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, reloadTickets, addToast, setShowCreateModal, activeTicketId, closeTicketDetail, selectedIndex]);

  const options = [
    { id: 'create', icon: 'fa-plus', label: 'เปิดตั๋วใหม่' },
    { id: 'reload', icon: 'fa-arrow-rotate-right', label: 'โหลดใหม่' },
    { id: 'close', icon: 'fa-xmark', label: activeTicketId ? 'ปิดหน้าต่าง' : 'ย้อนกลับ' }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* iOS/Chrome Style Pull-Down Banner */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: `${Math.max(85, pullDistance + 20)}px`,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, var(--bg-main) 0%, rgba(241, 245, 249, 0.8) 100%)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderBottom: '1px solid var(--border-light)',
            opacity: Math.max(0, Math.min(1, pullDistance / 25)),
            transition: isPulling.current ? 'none' : 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            overflow: 'hidden',
            pointerEvents: 'none',
            userSelect: 'none',
            gap: 10
          }}
        >
          {/* Options Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            marginTop: 8
          }}>
            {options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={opt.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: isSelected 
                      ? 'var(--primary, #3b82f6)' 
                      : 'var(--border-strong, rgba(15, 23, 42, 0.08))',
                    color: isSelected ? '#ffffff' : 'var(--text-muted, #64748b)',
                    boxShadow: isSelected ? '0 8px 24px rgba(59,130,246,0.35)' : 'none',
                    transform: isSelected ? 'scale(1.22)' : 'scale(0.95)',
                    transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <i className={`fa-solid ${opt.icon} ${(isRefreshing && idx === 1) ? 'fa-spin' : ''}`} style={{ 
                    fontSize: 16
                  }} />
                </div>
              );
            })}
          </div>

          {/* Action Description Label */}
          <div style={{
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--text-primary)',
                opacity: pullDistance > 30 ? 1 : 0,
                transform: pullDistance > 30 ? 'translateY(0)' : 'translateY(4px)',
                transition: 'all 0.18s ease',
              }}
            >
              {isRefreshing ? 'กำลังอัปเดตข้อมูล...' : options[selectedIndex].label}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Shift */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : 'none',
          transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
