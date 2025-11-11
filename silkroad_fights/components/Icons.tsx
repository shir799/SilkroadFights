import React from 'react';

export const SwordIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2l6.5 6.5-8 8-6.5-6.5 8-8z"/>
    <path d="M5 15l-3 3 3 3 3-3"/>
    <path d="M21 3l-3 3"/>
  </svg>
);

export const TargetIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const StarIcon = ({ className = "w-6 h-6", filled = true, color = "#FFD700" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export const CoinIcon = ({ className = "w-6 h-6", color = "#FFD700" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color} stroke="#8B4513" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="7" fill="#FFA500"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#8B4513" fontWeight="bold">G</text>
  </svg>
);

export const ControllerIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 12h.01M18 12h.01M12 6h.01M12 18h.01"/>
    <rect x="2" y="7" width="20" height="10" rx="2"/>
    <path d="M6 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
    <path d="M18 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
  </svg>
);

export const HourglassIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14"/>
    <path d="M5 2h14"/>
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
  </svg>
);

export const LightBulbIcon = ({ className = "w-6 h-6", color = "#FFD700" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color} stroke="#8B4513" strokeWidth="1.5">
    <path d="M9 21h6"/>
    <path d="M12 3a6 6 0 0 0-6 6c0 3.5 2 5 3 7h6c1-2 3-3.5 3-7a6 6 0 0 0-6-6z"/>
    <circle cx="12" cy="9" r="1" fill="#FFF"/>
  </svg>
);

export const ShieldIcon = ({ className = "w-6 h-6", color = "#4169E1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color} stroke="#000" strokeWidth="1.5">
    <path d="M12 2L4 6v6c0 5.5 3.84 10.74 8 12 4.16-1.26 8-6.5 8-12V6l-8-4z"/>
    <path d="M12 8v8M8 12h8" stroke="#FFD700" strokeWidth="2"/>
  </svg>
);

export const DaggerIcon = ({ className = "w-6 h-6", color = "#8B0000" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20"/>
    <path d="M9 2h6"/>
    <path d="M8 22h8"/>
    <path d="M10 2L8 4l4 4 4-4-2-2"/>
    <path d="M10 18l-2 2 4 2 4-2-2-2"/>
  </svg>
);

export const SkullIcon = ({ className = "w-6 h-6", color = "#8B0000" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color} stroke="#000" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6"/>
    <path d="M16 14c0 2-2 4-4 4s-4-2-4-4"/>
    <circle cx="9" cy="8" r="1.5" fill="#FFF"/>
    <circle cx="15" cy="8" r="1.5" fill="#FFF"/>
    <path d="M9 18h6v3H9z" fill={color}/>
  </svg>
);

export const GemIcon = ({ className = "w-6 h-6", color = "#9370DB" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 3h12l4 6-10 12L2 9z" fill={color} opacity="0.8"/>
    <path d="M6 3l6 6-6 6M18 3l-6 6 6 6"/>
    <path d="M12 9L2 9"/>
    <path d="M12 9l10 0"/>
  </svg>
);

export const ArrowRightIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export const CrownIcon = ({ className = "w-6 h-6", color = "#FFD700" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color} stroke="#8B4513" strokeWidth="1.5">
    <path d="M2 18l2-7 5 3 3-8 3 8 5-3 2 7z"/>
    <circle cx="7" cy="4" r="2" fill={color}/>
    <circle cx="12" cy="2" r="2" fill={color}/>
    <circle cx="17" cy="4" r="2" fill={color}/>
  </svg>
);

// Icon wrapper component for consistent sizing and styling
export const IconWrapper = ({
  children,
  className = "",
  glow = false,
  glowColor = "rgba(255,215,0,0.6)"
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: string;
}) => (
  <div
    className={`inline-flex items-center justify-center ${className}`}
    style={glow ? {
      filter: `drop-shadow(0 0 4px ${glowColor})`,
      animation: 'pulse 2s infinite'
    } : {}}
  >
    {children}
  </div>
);
