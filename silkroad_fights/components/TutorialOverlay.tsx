"use client"

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Play,
  Award,
  Sparkles,
  Check,
} from 'lucide-react'
import { TutorialStep, CHARACTER_VOICES } from './TutorialSteps'
import { theme } from '../lib/theme'

interface TutorialOverlayProps {
  step: TutorialStep;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  gameState?: any;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  gameState,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Get character info
  const character = CHARACTER_VOICES[step.voiceCharacter];

  // Find and highlight target element
  useEffect(() => {
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Add highlight class to element
        element.classList.add('tutorial-highlight');

        return () => {
          element.classList.remove('tutorial-highlight');
        };
      }
    } else {
      setTargetRect(null);
    }
  }, [step.targetElement]);

  // Check if required action is completed
  useEffect(() => {
    if (step.requiresAction && step.checkCompletion && gameState) {
      const completed = step.checkCompletion(gameState);
      setActionCompleted(completed);

      if (completed) {
        // Auto-advance after a short delay
        setTimeout(() => {
          onNext();
        }, 1500);
      }
    } else {
      setActionCompleted(false);
    }
  }, [step, gameState, step.requiresAction]);

  // Pulse animation control
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate speech bubble position
  const getSpeechBubblePosition = () => {
    if (!targetRect) {
      // Center position
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 20;
    let position: any = {};

    switch (step.position) {
      case 'top':
        position = {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'bottom':
        position = {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'left':
        position = {
          top: `${targetRect.top + targetRect.height / 2}px`,
          right: `${window.innerWidth - targetRect.left + padding}px`,
          transform: 'translateY(-50%)',
        };
        break;
      case 'right':
        position = {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)',
        };
        break;
      default:
        position = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }

    return position;
  };

  // Arrow component
  const Arrow = () => {
    if (!step.arrowDirection || !targetRect) return null;

    const arrowStyle: any = {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
    };

    switch (step.arrowDirection) {
      case 'up':
        arrowStyle.borderWidth = '0 15px 20px 15px';
        arrowStyle.borderColor = `transparent transparent ${character.color} transparent`;
        arrowStyle.bottom = '-20px';
        arrowStyle.left = '50%';
        arrowStyle.transform = 'translateX(-50%)';
        break;
      case 'down':
        arrowStyle.borderWidth = '20px 15px 0 15px';
        arrowStyle.borderColor = `${character.color} transparent transparent transparent`;
        arrowStyle.top = '-20px';
        arrowStyle.left = '50%';
        arrowStyle.transform = 'translateX(-50%)';
        break;
      case 'left':
        arrowStyle.borderWidth = '15px 0 15px 20px';
        arrowStyle.borderColor = `transparent transparent transparent ${character.color}`;
        arrowStyle.right = '-20px';
        arrowStyle.top = '50%';
        arrowStyle.transform = 'translateY(-50%)';
        break;
      case 'right':
        arrowStyle.borderWidth = '15px 20px 15px 0';
        arrowStyle.borderColor = `transparent ${character.color} transparent transparent`;
        arrowStyle.left = '-20px';
        arrowStyle.top = '50%';
        arrowStyle.transform = 'translateY(-50%)';
        break;
    }

    return (
      <motion.div
        style={arrowStyle}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay with spotlight effect */}
      <AnimatePresence>
        <motion.div
          className="absolute inset-0 bg-black pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          style={{
            maskImage: targetRect
              ? `radial-gradient(
                  circle ${Math.max(targetRect.width, targetRect.height) / 2 + 30}px at
                  ${targetRect.left + targetRect.width / 2}px
                  ${targetRect.top + targetRect.height / 2}px,
                  transparent 0%,
                  transparent 100%,
                  black 100%
                )`
              : 'none',
            WebkitMaskImage: targetRect
              ? `radial-gradient(
                  circle ${Math.max(targetRect.width, targetRect.height) / 2 + 30}px at
                  ${targetRect.left + targetRect.width / 2}px
                  ${targetRect.top + targetRect.height / 2}px,
                  transparent 0%,
                  transparent 100%,
                  black 100%
                )`
              : 'none',
          }}
          onClick={onClose}
        />
      </AnimatePresence>

      {/* Highlight border around target */}
      {targetRect && (
        <motion.div
          className="absolute pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: pulseAnimation ? 1 : 1.05,
          }}
          transition={{ duration: 0.5 }}
          style={{
            left: `${targetRect.left - 10}px`,
            top: `${targetRect.top - 10}px`,
            width: `${targetRect.width + 20}px`,
            height: `${targetRect.height + 20}px`,
            border: `3px solid ${character.color}`,
            borderRadius: '12px',
            boxShadow: `0 0 30px ${character.color}80, inset 0 0 20px ${character.color}40`,
          }}
        >
          {/* Corner decorations */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4"
              style={{
                background: character.color,
                borderRadius: '2px',
                [['top', 'top', 'bottom', 'bottom'][i]]: -8,
                [['left', 'right', 'left', 'right'][i]]: -8,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Speech Bubble */}
      <motion.div
        className="absolute pointer-events-auto"
        style={{
          ...getSpeechBubblePosition(),
          maxWidth: step.position === 'center' ? '600px' : '400px',
          zIndex: 51,
        }}
        initial={{ scale: 0, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div
          className="relative rounded-2xl p-6 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${character.color}20, rgba(26, 15, 15, 0.98))`,
            border: `3px solid ${character.color}`,
            boxShadow: `0 10px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${character.color}60`,
          }}
        >
          <Arrow />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Character avatar and name */}
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="text-4xl"
              animate={{
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {character.avatar}
            </motion.div>
            <div>
              <div className="text-lg font-bold" style={{ color: character.color }}>
                {character.name}
              </div>
              <div className="text-xs text-gray-400">
                Step {stepNumber} of {totalSteps}
              </div>
            </div>

            {/* Step icon */}
            <motion.div
              className="ml-auto text-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {step.icon}
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-2xl font-bold text-white mb-3"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {step.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-gray-200 leading-relaxed mb-4 whitespace-pre-line"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {step.detailedText}
          </motion.p>

          {/* Tip highlight */}
          {step.tipHighlight && (
            <motion.div
              className="flex items-start gap-2 p-3 rounded-lg mb-4"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.gold}20, ${theme.colors.gold}10)`,
                border: `2px solid ${theme.colors.gold}`,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <span className="font-bold">Pro Tip:</span> {step.tipHighlight}
              </div>
            </motion.div>
          )}

          {/* Action completion indicator */}
          {step.requiresAction && (
            <motion.div
              className="flex items-center gap-2 p-3 rounded-lg mb-4"
              style={{
                background: actionCompleted
                  ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(46, 125, 50, 0.3))'
                  : 'linear-gradient(135deg, rgba(255, 165, 0, 0.3), rgba(255, 140, 0, 0.3))',
                border: `2px solid ${actionCompleted ? '#4CAF50' : '#FFA500'}`,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {actionCompleted ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-300 font-semibold">
                    Action completed! Moving to next step...
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-orange-300 font-semibold">
                    Complete the action to continue
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${character.color}, ${theme.colors.gold})` }}
              initial={{ width: 0 }}
              animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            {/* Previous button */}
            <button
              onClick={onPrevious}
              disabled={stepNumber === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
              style={{
                background: stepNumber === 1 ? '#666' : 'linear-gradient(135deg, #8B4513, #654321)',
                border: '2px solid #D4AF37',
                color: 'white',
              }}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {/* Skip button */}
            <button
              onClick={onSkip}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip Tutorial
            </button>

            {/* Next button */}
            <button
              onClick={onNext}
              disabled={step.requiresAction && !actionCompleted}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              style={{
                background: step.requiresAction && !actionCompleted
                  ? '#666'
                  : `linear-gradient(135deg, ${character.color}, ${theme.colors.gold})`,
                border: '2px solid #FFD700',
                color: 'white',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              }}
            >
              {stepNumber === totalSteps ? (
                <>
                  <Award className="w-5 h-5" />
                  Complete!
                </>
              ) : (
                <>
                  {step.nextButtonText || 'Next'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sparkle effects */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: character.color,
              left: `${20 + i * 20}%`,
              top: `-${10 + i * 5}px`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Floating pointer for actions */}
      {step.requiresAction && !actionCompleted && targetRect && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `${targetRect.left + targetRect.width / 2}px`,
            top: `${targetRect.top + targetRect.height / 2}px`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="text-6xl">👆</div>
        </motion.div>
      )}
    </div>
  );
};

export default TutorialOverlay;
