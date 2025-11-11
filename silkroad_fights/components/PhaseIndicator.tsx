"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Swords, ShoppingBag, Crown, Skull } from 'lucide-react'
import { useEffect, useState } from 'react'

export type GamePhase = 'planning' | 'combat' | 'boss' | 'victory' | 'defeat'

interface PhaseIndicatorProps {
  phase: GamePhase
  timeRemaining?: number
  onPhaseEnd?: () => void
  showTransition?: boolean
}

export default function PhaseIndicator({
  phase,
  timeRemaining,
  onPhaseEnd,
  showTransition = true
}: PhaseIndicatorProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prevPhase, setPrevPhase] = useState<GamePhase>(phase)

  useEffect(() => {
    if (prevPhase !== phase && showTransition) {
      setIsTransitioning(true)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 2000)
    }
    setPrevPhase(phase)
  }, [phase, prevPhase, showTransition])

  useEffect(() => {
    if (timeRemaining !== undefined && timeRemaining <= 0 && onPhaseEnd) {
      onPhaseEnd()
    }
  }, [timeRemaining, onPhaseEnd])

  const getPhaseConfig = (currentPhase: GamePhase) => {
    const configs = {
      planning: {
        title: 'Planning Phase',
        subtitle: 'Buy units and prepare your strategy',
        icon: ShoppingBag,
        color: '#3B82F6',
        bgGradient: 'from-blue-600 to-blue-800',
        textColor: 'text-blue-300',
        borderColor: 'border-blue-400'
      },
      combat: {
        title: 'Combat Phase',
        subtitle: 'Watch your units battle!',
        icon: Swords,
        color: '#EF4444',
        bgGradient: 'from-red-600 to-red-800',
        textColor: 'text-red-300',
        borderColor: 'border-red-400'
      },
      boss: {
        title: 'Boss Round',
        subtitle: 'Defeat the boss for rewards!',
        icon: Crown,
        color: '#8B5CF6',
        bgGradient: 'from-purple-600 to-purple-900',
        textColor: 'text-purple-300',
        borderColor: 'border-purple-400'
      },
      victory: {
        title: 'Victory',
        subtitle: 'Your forces have triumphed!',
        icon: Crown,
        color: '#10B981',
        bgGradient: 'from-green-600 to-emerald-800',
        textColor: 'text-green-300',
        borderColor: 'border-green-400'
      },
      defeat: {
        title: 'Defeat',
        subtitle: 'Your forces have fallen...',
        icon: Skull,
        color: '#DC2626',
        bgGradient: 'from-red-800 to-rose-900',
        textColor: 'text-red-300',
        borderColor: 'border-red-500'
      }
    }
    return configs[currentPhase]
  }

  const config = getPhaseConfig(phase)
  const Icon = config.icon

  const isUrgent = timeRemaining !== undefined && timeRemaining <= 5

  return (
    <>
      {/* Full Screen Phase Transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)'
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1, repeat: 1 }}
                className={`mb-6 inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${config.bgGradient} border-4 ${config.borderColor}`}
                style={{ boxShadow: `0 0 60px ${config.color}` }}
              >
                <Icon className="w-20 h-20 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-bold text-white mb-4"
                style={{ textShadow: `0 0 30px ${config.color}, 0 4px 8px rgba(0,0,0,0.8)` }}
              >
                {config.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-2xl ${config.textColor} font-semibold`}
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                {config.subtitle}
              </motion.p>

              {/* Animated Ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4"
                style={{ borderColor: config.color }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Phase Indicator (Top Center) */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-40"
      >
        <motion.div
          animate={{
            scale: isUrgent ? [1, 1.1, 1] : 1,
            boxShadow: isUrgent
              ? [
                  `0 0 20px ${config.color}`,
                  `0 0 40px ${config.color}`,
                  `0 0 20px ${config.color}`
                ]
              : `0 4px 20px ${config.color}88`
          }}
          transition={{
            duration: 0.5,
            repeat: isUrgent ? Infinity : 0
          }}
          className={`px-6 py-3 rounded-full bg-gradient-to-r ${config.bgGradient} border-2 ${config.borderColor} backdrop-blur-sm`}
          style={{
            background: `linear-gradient(135deg, ${config.color}DD 0%, ${config.color}AA 100%)`,
          }}
        >
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 text-white ${phase === 'combat' ? 'animate-pulse' : ''}`} />

            <div className="text-center">
              <h3 className="text-white font-bold text-lg leading-none mb-1">
                {config.title}
              </h3>
              {timeRemaining !== undefined && (
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-300' : 'text-white/80'}`} />
                  <motion.span
                    key={timeRemaining}
                    initial={{ scale: 1.5, color: '#FFD700' }}
                    animate={{ scale: 1, color: '#FFFFFF' }}
                    className={`font-bold text-sm ${isUrgent ? 'text-red-300' : 'text-white/90'}`}
                  >
                    {timeRemaining}s
                  </motion.span>
                </div>
              )}
            </div>

            {phase === 'planning' && (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ShoppingBag className="w-6 h-6 text-white" />
              </motion.div>
            )}

            {phase === 'combat' && (
              <motion.div
                animate={{ x: [0, 5, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Swords className="w-6 h-6 text-white" />
              </motion.div>
            )}

            {phase === 'boss' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Crown className="w-6 h-6 text-amber-300" />
              </motion.div>
            )}
          </div>

          {/* Timer Bar */}
          {timeRemaining !== undefined && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <motion.div
                animate={{
                  width: timeRemaining > 0 ? '100%' : '0%'
                }}
                transition={{ duration: 1, ease: "linear" }}
                className="h-full"
                style={{
                  background: isUrgent
                    ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                    : 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
