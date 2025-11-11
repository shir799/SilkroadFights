/**
 * TactileFeedback.tsx - UI Responsiveness Components
 * Provides interactive, responsive UI elements with smooth animations
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// INTERACTIVE BUTTON
// ============================================================================

export interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples(prev => [...(prev || []), { x, y, id: Date.now() }]);

    setTimeout(() => {
      setRipples(prev => prev?.slice(1));
    }, 600);

    onClick?.(e);
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/50',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/50',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/50',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/50',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/50',
    info: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        relative overflow-hidden rounded-lg font-semibold
        transition-all duration-150 ease-out
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${className}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple Effect */}
      {ripples?.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon ? (
          icon
        ) : null}
        {children}
      </span>
    </button>
  );
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

export interface AnimatedProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max = 100,
  color = '#3b82f6',
  backgroundColor = '#1f2937',
  height = 20,
  showLabel = false,
  animated = true,
  striped = false,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const duration = 500;
      const steps = 30;
      const stepValue = (value - displayValue) / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue(prev => {
          const newValue = prev + stepValue;
          if (currentStep >= steps) {
            clearInterval(interval);
            return value;
          }
          return newValue;
        });
      }, stepDuration);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const percentage = Math.min(100, (displayValue / max) * 100);

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ height, backgroundColor }}>
      <div
        className={`h-full transition-all duration-300 ease-out ${striped ? 'bg-striped' : ''}`}
        style={{
          width: `${percentage}%`,
          background: striped
            ? `repeating-linear-gradient(45deg, ${color}, ${color} 10px, ${color}dd 10px, ${color}dd 20px)`
            : color,
        }}
      />
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
          {Math.round(percentage)}%
        </div>
      )}
      {animated && striped && (
        <style jsx>{`
          @keyframes slide {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 40px 0;
            }
          }
          .bg-striped {
            animation: slide 1s linear infinite;
          }
        `}</style>
      )}
    </div>
  );
};

// ============================================================================
// NUMBER COUNT-UP
// ============================================================================

export interface CountUpNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  onComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setDisplayValue(prev => {
        const newValue = prev + stepValue;
        if (currentStep >= steps) {
          clearInterval(interval);
          onComplete?.();
          return value;
        }
        return newValue;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, duration, onComplete]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = '#3b82f6',
  className = '',
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const dimension = sizeMap[size];

  return (
    <svg
      className={`animate-spin ${className}`}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// ============================================================================
// PULSE INDICATOR
// ============================================================================

export interface PulseIndicatorProps {
  color?: string;
  size?: number;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  color = '#3b82f6',
  size = 12,
  speed = 'normal',
  className = '',
}) => {
  const speedMap = {
    slow: 'animate-pulse-slow',
    normal: 'animate-pulse',
    fast: 'animate-pulse-fast',
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`rounded-full ${speedMap[speed]}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
      <div
        className={`absolute top-0 left-0 rounded-full ${speedMap[speed]} opacity-75`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          animation: `${speedMap[speed]} 1.5s ease-in-out infinite`,
        }}
      />
    </div>
  );
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  circle = false,
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${
        circle ? 'rounded-full' : 'rounded'
      } ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-pulse {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// HOVER CARD
// ============================================================================

export interface HoverCardProps {
  children: React.ReactNode;
  elevation?: number;
  glowColor?: string;
  className?: string;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  elevation = 2,
  glowColor = '#3b82f6',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        rounded-lg transition-all duration-300 ease-out
        ${isHovered ? `scale-105` : 'scale-100'}
        ${className}
      `}
      style={{
        boxShadow: isHovered
          ? `0 ${elevation * 4}px ${elevation * 8}px rgba(0, 0, 0, 0.3), 0 0 ${elevation * 10}px ${glowColor}40`
          : `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.2)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// ============================================================================
// BADGE
// ============================================================================

export interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'primary',
  pulse = false,
  glow = false,
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-cyan-500 text-white',
  };

  const glowColors = {
    primary: '#3b82f6',
    secondary: '#4b5563',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#eab308',
    info: '#06b6d4',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center px-3 py-1 rounded-full
        font-semibold text-sm
        ${variantStyles[variant]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        boxShadow: glow ? `0 0 20px ${glowColors[variant]}80` : undefined,
      }}
    >
      {children}
    </span>
  );
};

// ============================================================================
// TOOLTIP
// ============================================================================

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            whitespace-nowrap pointer-events-none
            animate-fade-in
            ${positionStyles[position]}
            ${className}
          `}
        >
          {content}
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GLOBAL ANIMATIONS
// ============================================================================

export const TactileFeedbackStyles = () => (
  <style jsx global>{`
    @keyframes ripple {
      0% {
        width: 0;
        height: 0;
        opacity: 0.5;
      }
      100% {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }

    .animate-ripple {
      animation: ripple 0.6s ease-out;
    }

    @keyframes pulse-slow {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-pulse-slow {
      animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse-fast {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-pulse-fast {
      animation: pulse-fast 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `}</style>
);
