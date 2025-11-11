"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

interface TutorialOverlayProps {
  onComplete: () => void;
  isTraderPlayer: boolean;
}

const tutorialSteps = {
  trader: [
    {
      title: "Willkommen Seidenstraßen-Händler!",
      description: "Dein Ziel: Liefere 2 Gold-Einheiten zu den grün markierten GOAL-Zonen am oberen Rand des Spielfelds!",
      icon: "⭐",
      highlight: "Die grünen Zonen sind deine Zielzonen - bringe das Gold dorthin!"
    },
    {
      title: "Gold sammeln",
      description: "Bewege deine Trader (TR) zu den rot markierten GOLD-Zonen am unteren Rand, um Gold aufzunehmen.",
      icon: "💰",
      highlight: "Nur Trader können Gold tragen! Hunter (H) können nur kämpfen und beschützen."
    },
    {
      title: "Kämpfen",
      description: "Bewege deine Einheiten auf gegnerische Einheiten, um sie anzugreifen! Jeder Kampf wird durch 3 Würfelwürfe entschieden.",
      icon: "⚔️",
      highlight: "Best-of-3 Würfelwürfe entscheiden den Kampf. Nutze Abilities für Vorteile!"
    },
    {
      title: "Silk & Abilities",
      description: "Sammle Silk (SI) auf dem Spielfeld und nutze sie für mächtige Abilities wie 'Rush' (2 Felder bewegen) oder 'Shield Wall' (Schadensreduktion).",
      icon: "🎯",
      highlight: "Jede Ability kostet Silk - sammle genug, um im richtigen Moment zuschlagen zu können!"
    },
    {
      title: "Boss Monster",
      description: "Alle 10 Runden spawnt ein Boss Monster! Besiege ihn für Belohnungen oder weiche ihm aus.",
      icon: "👹",
      highlight: "Bosse sind gefährlich aber lukrativ - plane deine Strategie!"
    }
  ],
  thief: [
    {
      title: "Willkommen Schatten-Dieb!",
      description: "Dein Ziel: Eliminiere BEIDE Trader bevor sie das Gold liefern können!",
      icon: "🗡️",
      highlight: "Die Trader versuchen Gold zu den grünen Zonen zu bringen - verhindere das!"
    },
    {
      title: "Kämpfen",
      description: "Bewege deine Thieves (TH) und deinen Kingthief (KT) auf die Trader, um sie anzugreifen!",
      icon: "⚔️",
      highlight: "Der Kingthief ist stärker - nutze ihn strategisch!"
    },
    {
      title: "Abilities",
      description: "Nutze 'Shadow Step' um durch Hindernisse zu gehen, 'Set Trap' um Feinde zu immobilisieren oder 'Steal Silk' um Ressourcen zu klauen!",
      icon: "🎯",
      highlight: "Thieves sind agil und trickreich - spiele schlau!"
    },
    {
      title: "Silk sammeln",
      description: "Sammle Silk (SI) Symbole auf dem Spielfeld um Abilities nutzen zu können.",
      icon: "💎",
      highlight: "Mehr Silk = mehr Abilities = mehr Macht!"
    },
    {
      title: "Boss Monster",
      description: "Alle 10 Runden spawnt ein Boss Monster! Nutze ihn zu deinem Vorteil oder besiege ihn für Belohnungen.",
      icon: "👹",
      highlight: "Bosse greifen beide Seiten an - nutze das Chaos!"
    }
  ]
};

export default function TutorialOverlay({ onComplete, isTraderPlayer }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = isTraderPlayer ? tutorialSteps.trader : tutorialSteps.thief;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={currentStep}
          className="relative max-w-2xl w-full"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div
            className="relative p-8 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #8B4513, #D4AF37, #8B4513)',
              border: '4px solid #FFD700',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), inset 0 0 40px rgba(255, 165, 0, 0.2)'
            }}
          >
            {/* Progress indicator */}
            <div className="absolute top-4 right-4 flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep
                      ? 'bg-yellow-300 scale-125'
                      : index < currentStep
                      ? 'bg-green-400'
                      : 'bg-gray-500'
                  }`}
                  style={{
                    transition: 'all 0.3s',
                    boxShadow: index === currentStep ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none'
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <motion.div
              className="text-8xl text-center mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl font-bold text-center mb-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                color: '#FFD700',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {step.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-xl text-yellow-100 text-center mb-4 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
              }}
            >
              {step.description}
            </motion.p>

            {/* Highlight box */}
            <motion.div
              className="bg-gradient-to-r from-orange-600 to-red-600 p-4 rounded-lg mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                border: '2px solid #FFD700',
                boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.3)'
              }}
            >
              <p className="text-lg text-yellow-50 font-semibold text-center">
                💡 {step.highlight}
              </p>
            </motion.div>

            {/* Buttons */}
            <div className="flex gap-4 justify-center">
              <motion.button
                className="px-6 py-3 rounded-lg font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #DC143C, #8B0000)',
                  border: '2px solid #FFD700',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
                onClick={handleSkip}
                whileHover={{ scale: 1.05, boxShadow: '0 6px 15px rgba(255, 0, 0, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Tutorial überspringen
              </motion.button>

              <motion.button
                className="px-8 py-3 rounded-lg font-bold text-black"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: '2px solid #8B4513',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
                onClick={handleNext}
                whileHover={{ scale: 1.05, boxShadow: '0 6px 15px rgba(255, 215, 0, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {currentStep < steps.length - 1 ? 'Weiter →' : 'Los gehts! 🎮'}
              </motion.button>
            </div>

            {/* Step counter */}
            <motion.div
              className="text-center mt-4 text-yellow-200 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Schritt {currentStep + 1} von {steps.length}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
