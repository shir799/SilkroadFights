"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../lib/theme'
import { HealthBar } from './HealthBar'

interface DiceRollProps {
  attackRoll: number
  defenseRoll: number
  attacker: string
  defender: string
  attackerHp: number
  defenderHp: number
  onComplete: () => void
}

export function DiceRoll({ 
  attackRoll, 
  defenseRoll, 
  attacker, 
  defender, 
  attackerHp,
  defenderHp,
  onComplete 
}: DiceRollProps) {
  const [showRoll, setShowRoll] = useState(true)
  const [currentRoll, setCurrentRoll] = useState({ attack: 1, defense: 1 })
  const [showResult, setShowResult] = useState(false)
  const [currentHp, setCurrentHp] = useState({ attacker: attackerHp, defender: defenderHp })

  useEffect(() => {
    let rollInterval: NodeJS.Timeout;
    const animationDuration = 2000;
    const rollSpeed = 50;
    let elapsed = 0;

    rollInterval = setInterval(() => {
      elapsed += rollSpeed;
      
      // Random rolls during animation
      setCurrentRoll({
        attack: Math.floor(Math.random() * 6) + 1,
        defense: Math.floor(Math.random() * 6) + 1
      });

      // Final values at the end
      if (elapsed >= animationDuration - rollSpeed) {
        clearInterval(rollInterval);
        setCurrentRoll({
          attack: attackRoll,
          defense: defenseRoll
        });
        
        setTimeout(() => {
          setShowRoll(false);
          setShowResult(true);
          // Animate HP change
          if (attackRoll > defenseRoll) {
            setCurrentHp(prev => ({
              ...prev,
              defender: defenderHp
            }));
          }
        }, 1000);

        setTimeout(() => {
          setShowResult(false);
          onComplete();
        }, 3000);
      }
    }, rollSpeed);

    return () => clearInterval(rollInterval);
  }, [attackRoll, defenseRoll, attackerHp, defenderHp, onComplete]);

  const getUnitImage = (unitType: string) => {
    if (unitType.includes('TR')) return theme.images.trader;
    if (unitType.includes('H')) return theme.images.hunter;
    if (unitType.includes('KT')) return theme.images.kingThief;
    if (unitType.includes('TH')) return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thief1-wpmmHjM54IwWBN6dq200wh0oCXravK.png'; // Updated thief image
    return '';
  };

  const getMaxHp = (unitType: string) => {
    if (unitType.includes('H') || unitType.includes('KT')) return 3;
    return 2;
  };

  return (
    <AnimatePresence>
      {(showRoll || showResult) && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-8">
            <motion.img 
              src={theme.images.logo}
              alt="Silkroad Fights Logo"
              className="w-64 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            />
            {showRoll && (
              <div className="flex gap-16 items-center">
                <motion.div
                  className="relative"
                  animate={{ 
                    x: [0, -5, 5, -5, 0],
                    y: [0, -5, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-4xl font-bold rounded-lg shadow-lg border-2 border-red-300">
                    {currentRoll.attack}
                  </div>
                  <motion.div
                    className="absolute -bottom-8 left-0 right-0 text-center text-red-400 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Attack
                  </motion.div>
                </motion.div>

                <motion.div
                  className="text-4xl font-bold text-yellow-500"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  VS
                </motion.div>

                <motion.div
                  className="relative"
                  animate={{ 
                    x: [0, 5, -5, 5, 0],
                    y: [0, 5, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-4xl font-bold rounded-lg shadow-lg border-2 border-blue-300">
                    {currentRoll.defense}
                  </div>
                  <motion.div
                    className="absolute -bottom-8 left-0 right-0 text-center text-blue-400 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Defense
                  </motion.div>
                </motion.div>
              </div>
            )}
            {showResult && (
              <div className="flex items-center justify-center gap-16">
                <motion.div className="flex flex-col items-center gap-2">
                  <motion.img
                    src={getUnitImage(attacker)}
                    alt="Attacker"
                    className="w-24 h-24"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 100,
                      scale: { duration: 0.5 }
                    }}
                  />
                  <motion.div 
                    className="w-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <HealthBar 
                      currentHp={currentHp.attacker} 
                      maxHp={getMaxHp(attacker)}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="text-6xl font-bold text-yellow-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  VS
                </motion.div>

                <motion.div className="flex flex-col items-center gap-2">
                  <motion.img
                    src={getUnitImage(defender)}
                    alt="Defender"
                    className="w-24 h-24"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 100,
                      scale: { duration: 0.5 }
                    }}
                  />
                  <motion.div 
                    className="w-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <HealthBar 
                      currentHp={currentHp.defender} 
                      maxHp={getMaxHp(defender)}
                    />
                  </motion.div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

