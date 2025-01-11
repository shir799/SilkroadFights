"use client"

import { useState, useEffect } from 'react'
import LoginScreen from '../components/LoginScreen'
import ModeSelectScreen from '../components/ModeSelectScreen'
import GameScreen from '../components/GameScreen'
import { motion, AnimatePresence } from 'framer-motion';
import IntroAnimation from '../components/IntroAnimation'
import { BackgroundMusic } from '../components/BackgroundMusic'
import SoundControl from '../components/SoundControl'

export default function SilkroadChess() {
  const [currentScreen, setCurrentScreen] = useState('intro')
  const [gameMode, setGameMode] = useState('')
  const [aiDifficulty, setAiDifficulty] = useState('normal')
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)

  const handleLogin = () => {
    setCurrentScreen('modeSelect')
  }

  const handleStartGame = (mode: string, difficulty: string) => {
    setGameMode(mode)
    setAiDifficulty(difficulty)
    setCurrentScreen('game')
  }

  const handleIntroComplete = () => {
    setCurrentScreen('login')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
         style={{
           background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wu%CC%88ste.png-jROVC0W501XiwIuImGamlbQ5r3KKNZ.webp)`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <BackgroundMusic isMuted={isMuted} volume={volume} />
      <div className="absolute top-4 right-4 z-50">
        <SoundControl
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          volume={volume}
          setVolume={setVolume}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {currentScreen === 'intro' && <IntroAnimation onComplete={handleIntroComplete} />}
          {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
          {currentScreen === 'modeSelect' && <ModeSelectScreen onStartGame={handleStartGame} />}
          {currentScreen === 'game' && (
            <GameScreen 
              gameMode={gameMode} 
              aiDifficulty={aiDifficulty} 
              key={`${gameMode}-${aiDifficulty}`}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              volume={volume}
              setVolume={setVolume}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

