import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function PullToRefresh({ children, onRefresh }) {
  const { reloadTickets, addToast } = useApp();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const pullDistanceRef = useRef(0);

  const THRESHOLD = 65;
  const MAX_PULL = 90;

  // Helper to get scroll top of current scroll container (.page-content or window)
  const getScrollTop = () => {
    const pageContent = document.querySelector('.page-content');
    if (pageContent) return pageContent.scrollTop;
    return window.scrollY || document.documentElement.scrollTop || 0;
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      const scrollTop = getScrollTop();
      if (scrollTop <= 2 && !isRefreshing) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;

      const scrollTop = getScrollTop();
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;

      // Only pull down if scroll position is at the very top AND user is pulling downwards
      if (scrollTop <= 2 && deltaY > 0) {
        const distance = Math.min(MAX_PULL, deltaY * 0.42);
        pullDistanceRef.current = distance;
        setPullDistance(distance);
      } else {
        if (pullDistanceRef.current !== 0) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        isPulling.current = false;
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      const currentDistance = pullDistanceRef.current;
      if (currentDistance >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        pullDistanceRef.current = 54;
        setPullDistance(54);

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
          }, 600);
        }
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, reloadTickets, addToast]);

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const rotation = progress * 360;

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Pull To Refresh Indicator Widget */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.max(62, pullDistance + 50)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid var(--border-light)',
            borderRadius: '999px',
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12), 0 2px 6px -1px rgba(0,0,0,0.06)',
            opacity: Math.max(0, Math.min(1, pullDistance / 25)),
            transition: isPulling.current ? 'none' : 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
              transition: isPulling.current ? 'none' : 'transform 0.2s ease',
              animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
            }}
          >
            <i className="fa-solid fa-arrow-rotate-right" style={{ fontSize: 13 }} />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}
          >
            {isRefreshing
              ? 'กำลังอัปเดตข้อมูล...'
              : progress >= 1
              ? 'ปล่อยเพื่อรีเฟรช'
              : 'ดึงลงเพื่อรีเฟรช'}
          </span>
        </div>
      )}

      {/* Main Page Content Container Shift */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.4}px)` : 'none',
          transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
