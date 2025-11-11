/**
 * THEME CUSTOMIZATION COMPONENT
 *
 * Complete theme system with:
 * - Classic Desert theme (default Silkroad aesthetic)
 * - Night mode (dark with moon and stars)
 * - Winter theme (snow and ice)
 * - Cherry blossom theme (Japanese aesthetic)
 * - Ocean theme (sea and waves)
 * - Colorblind modes (Deuteranopia, Protanopia, Tritanopia)
 * - Player preference persistence (localStorage)
 * - Smooth theme transitions
 * - Dynamic color schemes
 * - Accessibility compliant
 */

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ThemeName =
  | 'classic-desert'
  | 'night-mode'
  | 'winter'
  | 'cherry-blossom'
  | 'ocean'

export type ColorblindMode =
  | 'none'
  | 'deuteranopia'
  | 'protanopia'
  | 'tritanopia'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  backgroundGradient: string
  boardBackground: string
  cellBackground: string
  text: {
    primary: string
    secondary: string
    accent: string
  }
  health: {
    good: string
    medium: string
    low: string
  }
  teams: {
    player: string
    enemy: string
  }
  effects: {
    glow: string
    shadow: string
    highlight: string
  }
}

export interface Theme {
  name: ThemeName
  displayName: string
  description: string
  icon: string
  colors: ThemeColors
  particleColor: string
  ambientEffect?: string
}

interface ThemeContextType {
  currentTheme: Theme
  themeName: ThemeName
  colorblindMode: ColorblindMode
  setTheme: (theme: ThemeName) => void
  setColorblindMode: (mode: ColorblindMode) => void
  themes: Record<ThemeName, Theme>
}

// ============================================================================
// THEME DEFINITIONS
// ============================================================================

const THEMES: Record<ThemeName, Theme> = {
  'classic-desert': {
    name: 'classic-desert',
    displayName: 'Classic Desert',
    description: 'Traditional Silk Road aesthetic with warm sand tones',
    icon: '🏜️',
    colors: {
      primary: '#FFA500',
      secondary: '#8B4513',
      accent: '#FFD700',
      background: '#1A0F0F',
      backgroundGradient: 'linear-gradient(135deg, #1A0F0F 0%, #3D2210 100%)',
      boardBackground: 'rgba(26, 15, 15, 0.85)',
      cellBackground: 'rgba(237, 201, 175, 0.4)',
      text: {
        primary: '#FFFFFF',
        secondary: '#D4AF37',
        accent: '#FFA500',
      },
      health: {
        good: '#4CAF50',
        medium: '#FFC107',
        low: '#F44336',
      },
      teams: {
        player: '#4169E1',
        enemy: '#DC143C',
      },
      effects: {
        glow: 'rgba(255, 215, 0, 0.5)',
        shadow: 'rgba(0, 0, 0, 0.5)',
        highlight: 'rgba(255, 165, 0, 0.3)',
      },
    },
    particleColor: '#EDC9AF',
    ambientEffect: 'sandstorm',
  },
  'night-mode': {
    name: 'night-mode',
    displayName: 'Desert Night',
    description: 'Moonlit desert with stars and cool blue tones',
    icon: '🌙',
    colors: {
      primary: '#4169E1',
      secondary: '#1E3A8A',
      accent: '#60A5FA',
      background: '#0A0E1A',
      backgroundGradient: 'linear-gradient(135deg, #0A0E1A 0%, #1E1B4B 100%)',
      boardBackground: 'rgba(10, 14, 26, 0.9)',
      cellBackground: 'rgba(30, 58, 138, 0.3)',
      text: {
        primary: '#E0E7FF',
        secondary: '#93C5FD',
        accent: '#60A5FA',
      },
      health: {
        good: '#10B981',
        medium: '#F59E0B',
        low: '#EF4444',
      },
      teams: {
        player: '#60A5FA',
        enemy: '#F87171',
      },
      effects: {
        glow: 'rgba(96, 165, 250, 0.6)',
        shadow: 'rgba(0, 0, 0, 0.7)',
        highlight: 'rgba(147, 197, 253, 0.3)',
      },
    },
    particleColor: '#93C5FD',
    ambientEffect: 'stars',
  },
  'winter': {
    name: 'winter',
    displayName: 'Winter Frost',
    description: 'Snowy landscape with icy blues and whites',
    icon: '❄️',
    colors: {
      primary: '#00BCD4',
      secondary: '#0097A7',
      accent: '#B2EBF2',
      background: '#E0F7FA',
      backgroundGradient: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
      boardBackground: 'rgba(224, 247, 250, 0.9)',
      cellBackground: 'rgba(178, 235, 242, 0.5)',
      text: {
        primary: '#006064',
        secondary: '#00838F',
        accent: '#00ACC1',
      },
      health: {
        good: '#00897B',
        medium: '#FF6F00',
        low: '#C62828',
      },
      teams: {
        player: '#1976D2',
        enemy: '#D32F2F',
      },
      effects: {
        glow: 'rgba(178, 235, 242, 0.7)',
        shadow: 'rgba(0, 96, 100, 0.3)',
        highlight: 'rgba(224, 247, 250, 0.5)',
      },
    },
    particleColor: '#FFFFFF',
    ambientEffect: 'snow',
  },
  'cherry-blossom': {
    name: 'cherry-blossom',
    displayName: 'Cherry Blossom',
    description: 'Japanese aesthetic with pink petals and soft colors',
    icon: '🌸',
    colors: {
      primary: '#EC4899',
      secondary: '#BE185D',
      accent: '#FBCFE8',
      background: '#FFF1F2',
      backgroundGradient: 'linear-gradient(135deg, #FFF1F2 0%, #FCE7F3 100%)',
      boardBackground: 'rgba(255, 241, 242, 0.9)',
      cellBackground: 'rgba(251, 207, 232, 0.4)',
      text: {
        primary: '#881337',
        secondary: '#BE185D',
        accent: '#EC4899',
      },
      health: {
        good: '#059669',
        medium: '#D97706',
        low: '#DC2626',
      },
      teams: {
        player: '#8B5CF6',
        enemy: '#EF4444',
      },
      effects: {
        glow: 'rgba(236, 72, 153, 0.5)',
        shadow: 'rgba(136, 19, 55, 0.3)',
        highlight: 'rgba(251, 207, 232, 0.5)',
      },
    },
    particleColor: '#FBCFE8',
    ambientEffect: 'petals',
  },
  'ocean': {
    name: 'ocean',
    displayName: 'Ocean Depths',
    description: 'Deep sea theme with turquoise and aqua tones',
    icon: '🌊',
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      accent: '#22D3EE',
      background: '#083344',
      backgroundGradient: 'linear-gradient(135deg, #083344 0%, #164E63 100%)',
      boardBackground: 'rgba(8, 51, 68, 0.9)',
      cellBackground: 'rgba(34, 211, 238, 0.2)',
      text: {
        primary: '#ECFEFF',
        secondary: '#67E8F9',
        accent: '#22D3EE',
      },
      health: {
        good: '#14B8A6',
        medium: '#F59E0B',
        low: '#F43F5E',
      },
      teams: {
        player: '#3B82F6',
        enemy: '#EF4444',
      },
      effects: {
        glow: 'rgba(34, 211, 238, 0.6)',
        shadow: 'rgba(8, 51, 68, 0.7)',
        highlight: 'rgba(103, 232, 249, 0.3)',
      },
    },
    particleColor: '#67E8F9',
    ambientEffect: 'bubbles',
  },
}

// ============================================================================
// COLORBLIND FILTERS
// ============================================================================

const COLORBLIND_FILTERS: Record<ColorblindMode, string | null> = {
  none: null,
  deuteranopia: 'url(#deuteranopia-filter)',
  protanopia: 'url(#protanopia-filter)',
  tritanopia: 'url(#tritanopia-filter)',
}

// ============================================================================
// THEME CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | null>(null)

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// ============================================================================
// THEME PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
  defaultColorblindMode?: ColorblindMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'classic-desert',
  defaultColorblindMode = 'none',
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)
  const [colorblindMode, setColorblindModeState] = useState<ColorblindMode>(defaultColorblindMode)

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('silkroad-theme') as ThemeName | null
    const savedColorblindMode = localStorage.getItem('silkroad-colorblind-mode') as ColorblindMode | null

    if (savedTheme && THEMES[savedTheme]) {
      setThemeName(savedTheme)
    }
    if (savedColorblindMode && COLORBLIND_FILTERS[savedColorblindMode] !== undefined) {
      setColorblindModeState(savedColorblindMode)
    }
  }, [])

  const setTheme = useCallback((theme: ThemeName) => {
    setThemeName(theme)
    localStorage.setItem('silkroad-theme', theme)
  }, [])

  const setColorblindMode = useCallback((mode: ColorblindMode) => {
    setColorblindModeState(mode)
    localStorage.setItem('silkroad-colorblind-mode', mode)
  }, [])

  const currentTheme = THEMES[themeName]

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement
    const colors = currentTheme.colors

    root.style.setProperty('--theme-primary', colors.primary)
    root.style.setProperty('--theme-secondary', colors.secondary)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-background', colors.background)
    root.style.setProperty('--theme-text-primary', colors.text.primary)
    root.style.setProperty('--theme-text-secondary', colors.text.secondary)
    root.style.setProperty('--theme-text-accent', colors.text.accent)
  }, [currentTheme])

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        colorblindMode,
        setTheme,
        setColorblindMode,
        themes: THEMES,
      }}
    >
      {/* SVG Filters for Colorblind Modes */}
      <svg className="hidden">
        <defs>
          {/* Deuteranopia (Red-Green) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0   0 0
                      0.7   0.3   0   0 0
                      0     0.3   0.7 0 0
                      0     0     0   1 0"
            />
          </filter>

          {/* Protanopia (Red-Green) */}
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0     0 0
                      0.558 0.442 0     0 0
                      0     0.242 0.758 0 0
                      0     0     0     1 0"
            />
          </filter>

          {/* Tritanopia (Blue-Yellow) */}
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95  0.05  0     0 0
                      0     0.433 0.567 0 0
                      0     0.475 0.525 0 0
                      0     0     0     1 0"
            />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          filter: COLORBLIND_FILTERS[colorblindMode] || 'none',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// ============================================================================
// THEME SELECTOR COMPONENT
// ============================================================================

interface ThemeSelectorProps {
  onClose?: () => void
  className?: string
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose, className = '' }) => {
  const { currentTheme, themeName, colorblindMode, setTheme, setColorblindMode, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeSelect = useCallback(
    (theme: ThemeName) => {
      setTheme(theme)
      if (onClose) onClose()
    },
    [setTheme, onClose]
  )

  return (
    <div className={`relative ${className}`}>
      {/* Theme Toggle Button */}
      <motion.button
        className="px-4 py-2 rounded-lg font-bold text-white shadow-lg"
        style={{
          background: currentTheme.colors.primary,
          border: `2px solid ${currentTheme.colors.accent}`,
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentTheme.icon} Theme
      </motion.button>

      {/* Theme Selection Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full mt-2 right-0 p-4 rounded-xl shadow-2xl z-50"
            style={{
              background: currentTheme.colors.boardBackground,
              border: `2px solid ${currentTheme.colors.accent}`,
              backdropFilter: 'blur(10px)',
              minWidth: '400px',
            }}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Choose Your Theme
            </h3>

            {/* Theme Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.values(themes).map((theme) => (
                <motion.button
                  key={theme.name}
                  className="p-3 rounded-lg text-left relative overflow-hidden"
                  style={{
                    background: theme.colors.boardBackground,
                    border: `2px solid ${
                      themeName === theme.name ? theme.colors.accent : 'transparent'
                    }`,
                  }}
                  onClick={() => handleThemeSelect(theme.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Theme Preview Background */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ background: theme.colors.backgroundGradient }}
                  />

                  <div className="relative z-10">
                    <div className="text-2xl mb-1">{theme.icon}</div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {theme.displayName}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: theme.colors.text.secondary, opacity: 0.8 }}
                    >
                      {theme.description}
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {themeName === theme.name && (
                    <motion.div
                      className="absolute top-2 right-2 w-4 h-4 rounded-full"
                      style={{ background: theme.colors.accent }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Colorblind Mode Selector */}
            <div className="pt-4 border-t" style={{ borderColor: currentTheme.colors.accent }}>
              <h4
                className="text-sm font-bold mb-2"
                style={{ color: currentTheme.colors.text.primary }}
              >
                Accessibility
              </h4>
              <div className="space-y-2">
                {(Object.keys(COLORBLIND_FILTERS) as ColorblindMode[]).map((mode) => (
                  <motion.button
                    key={mode}
                    className="w-full px-3 py-2 rounded text-left text-sm"
                    style={{
                      background:
                        colorblindMode === mode
                          ? currentTheme.colors.primary
                          : currentTheme.colors.cellBackground,
                      color: currentTheme.colors.text.primary,
                    }}
                    onClick={() => setColorblindMode(mode)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {mode === 'none' && 'Normal Vision'}
                    {mode === 'deuteranopia' && 'Deuteranopia (Red-Green)'}
                    {mode === 'protanopia' && 'Protanopia (Red-Green)'}
                    {mode === 'tritanopia' && 'Tritanopia (Blue-Yellow)'}
                    {colorblindMode === mode && ' ✓'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <motion.button
              className="w-full mt-4 py-2 rounded-lg font-bold"
              style={{
                background: currentTheme.colors.secondary,
                color: currentTheme.colors.text.primary,
              }}
              onClick={() => setIsOpen(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// THEMED CONTAINER COMPONENT
// ============================================================================

interface ThemedContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const ThemedContainer: React.FC<ThemedContainerProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme()

  return (
    <motion.div
      className={className}
      style={{
        background: currentTheme.colors.backgroundGradient,
        color: currentTheme.colors.text.primary,
        ...style,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeProvider
export { THEMES, COLORBLIND_FILTERS }
