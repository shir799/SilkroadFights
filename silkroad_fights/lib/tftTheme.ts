/**
 * TFT-Style Theme Configuration for Silkroad Fights
 * Professional game UI theme with Silkroad aesthetic
 */

export const tftTheme = {
  // Color Palette - Silkroad Inspired
  colors: {
    // Primary Colors
    primary: {
      amber: '#F59E0B',
      gold: '#FFD700',
      bronze: '#CD7F32',
      darkBrown: '#3A1E0A',
      lightBrown: '#8B4513'
    },

    // Background Colors
    background: {
      dark: '#0A0502',
      medium: '#1C0F05',
      light: '#2C1808',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },

    // Player Colors
    player: {
      ally: '#3B82F6',
      enemy: '#EF4444',
      neutral: '#9CA3AF'
    },

    // Tier/Rarity Colors
    tier: {
      1: { color: '#9CA3AF', name: 'Common' },
      2: { color: '#22C55E', name: 'Uncommon' },
      3: { color: '#3B82F6', name: 'Rare' },
      4: { color: '#A855F7', name: 'Epic' },
      5: { color: '#F59E0B', name: 'Legendary' }
    },

    // Status Colors
    status: {
      health: {
        high: '#10B981',
        medium: '#F59E0B',
        low: '#EF4444'
      },
      positive: '#10B981',
      negative: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },

    // UI Element Colors
    ui: {
      border: '#D97706',
      borderLight: '#FCD34D',
      hover: 'rgba(251, 191, 36, 0.2)',
      selected: '#FFD700',
      disabled: '#6B7280'
    }
  },

  // Gradients
  gradients: {
    // Background Gradients
    background: {
      main: 'radial-gradient(ellipse at top, rgba(139, 69, 19, 0.3) 0%, rgba(10, 5, 2, 1) 100%)',
      panel: 'linear-gradient(180deg, rgba(44, 24, 8, 0.95) 0%, rgba(28, 15, 5, 0.95) 100%)',
      header: 'linear-gradient(180deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 52, 14, 0.95) 100%)'
    },

    // Button Gradients
    button: {
      primary: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      secondary: 'linear-gradient(135deg, #8B4513 0%, #654208 100%)',
      success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      info: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },

    // Tier Gradients
    tier: {
      1: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
      2: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      3: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      4: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
      5: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    },

    // Special Effects
    glow: {
      gold: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
      blue: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
      red: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
      purple: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)'
    }
  },

  // Shadows
  shadows: {
    // Box Shadows
    small: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 15px rgba(0, 0, 0, 0.4)',
    large: '0 8px 30px rgba(0, 0, 0, 0.5)',

    // Glow Shadows
    glow: {
      gold: '0 0 20px rgba(255, 215, 0, 0.5)',
      blue: '0 0 20px rgba(59, 130, 246, 0.5)',
      red: '0 0 20px rgba(239, 68, 68, 0.5)',
      purple: '0 0 20px rgba(168, 85, 247, 0.5)',
      green: '0 0 20px rgba(16, 185, 129, 0.5)'
    },

    // Inner Shadows
    inset: {
      light: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      medium: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
      heavy: 'inset 0 4px 20px rgba(0, 0, 0, 0.8)'
    }
  },

  // Border Styles
  borders: {
    width: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
      extraThick: '4px'
    },
    radius: {
      small: '0.375rem',
      medium: '0.5rem',
      large: '0.75rem',
      xl: '1rem',
      full: '9999px'
    }
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'system-ui, -apple-system, sans-serif',
      display: 'system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, monospace'
    },
    textShadow: {
      default: '0 2px 4px rgba(0, 0, 0, 0.8)',
      glow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0,0,0,0.8)',
      strong: '0 4px 8px rgba(0, 0, 0, 0.9)'
    }
  },

  // Spacing
  spacing: {
    unit: 8, // Base unit in pixels
    scale: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    }
  },

  // Z-Index Layers
  zIndex: {
    background: 0,
    content: 10,
    panel: 20,
    dropdown: 30,
    modal: 40,
    notification: 50,
    tooltip: 60,
    overlay: 100
  },

  // Transitions
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Breakpoints
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    wide: '1920px'
  }
}

// Helper Functions
export const getTierColor = (tier: number) => {
  return tftTheme.colors.tier[tier as keyof typeof tftTheme.colors.tier] || tftTheme.colors.tier[1]
}

export const getHealthColor = (percentage: number) => {
  if (percentage > 60) return tftTheme.colors.status.health.high
  if (percentage > 30) return tftTheme.colors.status.health.medium
  return tftTheme.colors.status.health.low
}

export const getRarityGlow = (rarity: string) => {
  const glows = {
    common: tftTheme.shadows.glow.blue,
    rare: tftTheme.shadows.glow.blue,
    epic: tftTheme.shadows.glow.purple,
    legendary: tftTheme.shadows.glow.gold
  }
  return glows[rarity as keyof typeof glows] || glows.common
}

export default tftTheme
