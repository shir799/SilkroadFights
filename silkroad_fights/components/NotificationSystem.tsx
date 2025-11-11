/**
 * NotificationSystem.tsx - In-Game Notifications and Toasts
 * Provides beautiful notifications for achievements, events, and important moments
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, Trophy, Star, Zap, Crown, Swords, Gift, AlertCircle, CheckCircle, Info } from 'lucide-react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type NotificationType =
  | 'achievement'
  | 'level_up'
  | 'ability_unlock'
  | 'challenge_complete'
  | 'boss_spawn'
  | 'boss_defeat'
  | 'critical_moment'
  | 'victory'
  | 'defeat'
  | 'info'
  | 'warning'
  | 'success'
  | 'error';

export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  duration?: number; // milliseconds, 0 = persistent
  position?: NotificationPosition;
  showProgress?: boolean;
  dismissible?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
  badge?: string | number;
  color?: string;
  animate?: boolean;
}

interface NotificationSystemContextType {
  showNotification: (config: Omit<NotificationConfig, 'id'>) => string;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
  showAchievement: (title: string, message?: string, badge?: string) => void;
  showLevelUp: (level: number) => void;
  showAbilityUnlock: (abilityName: string, description?: string) => void;
  showChallengeComplete: (challengeName: string, reward?: string) => void;
  showBossSpawn: (bossName: string) => void;
  showBossDefeat: (bossName: string, reward?: string) => void;
  showCriticalMoment: (message: string) => void;
  showVictory: (message?: string) => void;
  showDefeat: (message?: string) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationSystemContext = createContext<NotificationSystemContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationSystemContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationSystemProvider');
  }
  return context;
};

// ============================================================================
// NOTIFICATION COMPONENT
// ============================================================================

const Notification: React.FC<{
  config: NotificationConfig;
  onDismiss: (id: string) => void;
}> = ({ config, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (config.duration && config.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (config.duration! / 50));
          return Math.max(0, newProgress);
        });
      }, 50);

      const timeout = setTimeout(() => {
        handleDismiss();
      }, config.duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [config.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(config.id);
      config.onDismiss?.();
    }, 300);
  };

  const getTypeStyles = () => {
    switch (config.type) {
      case 'achievement':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          border: 'border-yellow-400',
          icon: <Trophy className="w-6 h-6" />,
        };
      case 'level_up':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
          border: 'border-blue-400',
          icon: <Star className="w-6 h-6" />,
        };
      case 'ability_unlock':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          border: 'border-purple-400',
          icon: <Zap className="w-6 h-6" />,
        };
      case 'challenge_complete':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-teal-500',
          border: 'border-green-400',
          icon: <CheckCircle className="w-6 h-6" />,
        };
      case 'boss_spawn':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-red-800',
          border: 'border-red-500',
          icon: <Crown className="w-6 h-6" />,
        };
      case 'boss_defeat':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
          border: 'border-amber-400',
          icon: <Swords className="w-6 h-6" />,
        };
      case 'critical_moment':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-orange-500',
          border: 'border-red-400',
          icon: <AlertCircle className="w-6 h-6" />,
        };
      case 'victory':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          border: 'border-green-400',
          icon: <Trophy className="w-6 h-6" />,
        };
      case 'defeat':
        return {
          bg: 'bg-gradient-to-r from-gray-600 to-gray-800',
          border: 'border-gray-500',
          icon: <X className="w-6 h-6" />,
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          border: 'border-blue-400',
          icon: <Info className="w-6 h-6" />,
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          border: 'border-yellow-400',
          icon: <AlertCircle className="w-6 h-6" />,
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          border: 'border-green-400',
          icon: <CheckCircle className="w-6 h-6" />,
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          border: 'border-red-400',
          icon: <AlertCircle className="w-6 h-6" />,
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-700 to-gray-800',
          border: 'border-gray-600',
          icon: <Gift className="w-6 h-6" />,
        };
    }
  };

  const styles = getTypeStyles();
  const displayIcon = config.icon || styles.icon;

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 ${styles.border}
        shadow-2xl backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 scale-90 translate-x-full' : 'opacity-100 scale-100'}
        ${config.animate !== false ? 'animate-slide-in' : ''}
        cursor-pointer hover:scale-105
        min-w-[300px] max-w-[400px]
      `}
      onClick={() => config.onClick?.()}
      style={{
        background: config.color || undefined,
      }}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${styles.bg} opacity-90`} />

      {/* Content */}
      <div className="relative z-10 p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-white">
          {displayIcon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg leading-tight mb-1">
                {config.title}
              </h4>
              {config.message && (
                <p className="text-white/90 text-sm leading-snug">
                  {config.message}
                </p>
              )}
            </div>

            {/* Badge */}
            {config.badge !== undefined && (
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white font-bold text-sm">
                  {config.badge}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {config.dismissible !== false && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {config.showProgress !== false && config.duration && config.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className="h-full bg-white/50 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shine pointer-events-none" />
    </div>
  );
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const NotificationSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const nextId = React.useRef(0);

  // ============================================================================
  // CORE METHODS
  // ============================================================================

  const showNotification = useCallback((config: Omit<NotificationConfig, 'id'>): string => {
    const id = `notification_${nextId.current++}`;
    const notification: NotificationConfig = {
      id,
      position: 'top-right',
      duration: 4000,
      dismissible: true,
      showProgress: true,
      animate: true,
      ...config,
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  const showAchievement = useCallback((title: string, message?: string, badge?: string) => {
    showNotification({
      type: 'achievement',
      title,
      message,
      badge,
      duration: 6000,
    });
  }, [showNotification]);

  const showLevelUp = useCallback((level: number) => {
    showNotification({
      type: 'level_up',
      title: 'Level Up!',
      message: `You reached level ${level}`,
      badge: level.toString(),
      duration: 5000,
    });
  }, [showNotification]);

  const showAbilityUnlock = useCallback((abilityName: string, description?: string) => {
    showNotification({
      type: 'ability_unlock',
      title: 'New Ability Unlocked!',
      message: description || `You unlocked ${abilityName}`,
      badge: 'NEW',
      duration: 6000,
    });
  }, [showNotification]);

  const showChallengeComplete = useCallback((challengeName: string, reward?: string) => {
    showNotification({
      type: 'challenge_complete',
      title: 'Challenge Complete!',
      message: reward ? `${challengeName} - Reward: ${reward}` : challengeName,
      duration: 5000,
    });
  }, [showNotification]);

  const showBossSpawn = useCallback((bossName: string) => {
    showNotification({
      type: 'boss_spawn',
      title: 'Boss Approaching!',
      message: `${bossName} has entered the battlefield!`,
      duration: 5000,
      dismissible: false,
    });
  }, [showNotification]);

  const showBossDefeat = useCallback((bossName: string, reward?: string) => {
    showNotification({
      type: 'boss_defeat',
      title: 'Boss Defeated!',
      message: reward ? `${bossName} defeated! Reward: ${reward}` : `${bossName} has been defeated!`,
      duration: 6000,
    });
  }, [showNotification]);

  const showCriticalMoment = useCallback((message: string) => {
    showNotification({
      type: 'critical_moment',
      title: 'Critical!',
      message,
      duration: 3000,
    });
  }, [showNotification]);

  const showVictory = useCallback((message?: string) => {
    showNotification({
      type: 'victory',
      title: 'Victory!',
      message: message || 'You have won the battle!',
      duration: 8000,
      dismissible: false,
    });
  }, [showNotification]);

  const showDefeat = useCallback((message?: string) => {
    showNotification({
      type: 'defeat',
      title: 'Defeat',
      message: message || 'You have been defeated.',
      duration: 6000,
      dismissible: false,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration: number = 3000) => {
    showNotification({
      type: 'info',
      title: 'Info',
      message,
      duration,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, duration: number = 4000) => {
    showNotification({
      type: 'warning',
      title: 'Warning',
      message,
      duration,
    });
  }, [showNotification]);

  const showSuccess = useCallback((message: string, duration: number = 3000) => {
    showNotification({
      type: 'success',
      title: 'Success',
      message,
      duration,
    });
  }, [showNotification]);

  const showError = useCallback((message: string, duration: number = 5000) => {
    showNotification({
      type: 'error',
      title: 'Error',
      message,
      duration,
    });
  }, [showNotification]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: NotificationSystemContextType = {
    showNotification,
    dismissNotification,
    dismissAll,
    showAchievement,
    showLevelUp,
    showAbilityUnlock,
    showChallengeComplete,
    showBossSpawn,
    showBossDefeat,
    showCriticalMoment,
    showVictory,
    showDefeat,
    showInfo,
    showWarning,
    showSuccess,
    showError,
  };

  // ============================================================================
  // GROUP NOTIFICATIONS BY POSITION
  // ============================================================================

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {} as Record<NotificationPosition, NotificationConfig[]>);

  const getPositionStyles = (position: NotificationPosition): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 0, left: 0 };
      case 'top-center':
        return { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...base, top: 0, right: 0 };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0, flexDirection: 'column-reverse' };
      case 'bottom-center':
        return { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)', flexDirection: 'column-reverse' };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0, flexDirection: 'column-reverse' };
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <NotificationSystemContext.Provider value={value}>
      {children}

      {/* Notification Containers */}
      {Object.entries(groupedNotifications).map(([position, notifs]) => (
        <div
          key={position}
          style={getPositionStyles(position as NotificationPosition)}
        >
          {notifs.map(notification => (
            <div key={notification.id} style={{ pointerEvents: 'auto' }}>
              <Notification
                config={notification}
                onDismiss={dismissNotification}
              />
            </div>
          ))}
        </div>
      ))}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </NotificationSystemContext.Provider>
  );
};
