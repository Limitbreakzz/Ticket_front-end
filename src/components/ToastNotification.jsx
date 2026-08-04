import React from "react";

const VARIANT_COLORS = {
  error: "#ef4444",
  info: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
};

const VariantIcon = ({ variant, color }) => {
  const common = {
    fill: "none",
    height: 22,
    stroke: color,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2.4,
    viewBox: "0 0 24 24",
    width: 22,
  };

  if (variant === "success") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12.5l2.8 2.8L16 9.8" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg {...common}>
        <path d="M12 3l10 18H2L12 3z" />
        <path d="M12 10v5M12 18v.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v.01M12 12v5" />
    </svg>
  );
};

const FPS = 30;
const DURATION_IN_FRAMES = 90;

export const ToastNotification = ({
  title,
  message,
  variant = "success",
  background,
  cardColor = "white",
  textColor = "#171717",
  mutedColor = "#71717a",
  speed = 1,
  fps = FPS,
  durationInFrames = DURATION_IN_FRAMES,
  className,
  onClose,
}) => {
  const safeSpeed = Math.max(0.01, speed);
  const enterMs = Math.max(
    240,
    Math.min(900, ((durationInFrames / fps) * 1000 * 0.2) / safeSpeed),
  );
  const accent = VARIANT_COLORS[variant] || VARIANT_COLORS.success;

  return (
    <div
      style={
        background
          ? {
              background,
              fontFamily:
                "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
              inset: 0,
              position: "absolute",
            }
          : undefined
      }
    >
      <style>{`
        @keyframes framecn-toast-enter {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div
        className={className}
        style={{
          alignItems: "center",
          animation: `framecn-toast-enter ${enterMs}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: 20,
          boxShadow: `
            0 20px 40px -10px rgba(0, 0, 0, 0.12),
            0 8px 16px -6px rgba(0, 0, 0, 0.06),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)
          `,
          display: "flex",
          gap: 14,
          maxWidth: 420,
          minWidth: 320,
          padding: "14px 18px",
          position: "relative",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: `${accent}1f`,
            borderRadius: 999,
            display: "flex",
            flexShrink: 0,
            height: 36,
            justifyContent: "center",
            width: 36,
          }}
        >
          <VariantIcon variant={variant} color={accent} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {title && (
            <span
              style={{
                color: textColor,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </span>
          )}
          {message && (
            <span style={{ color: mutedColor, fontSize: 13, lineHeight: 1.45 }}>
              {message}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: mutedColor,
              padding: 4,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: -4,
              marginTop: -2,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ToastNotification;
