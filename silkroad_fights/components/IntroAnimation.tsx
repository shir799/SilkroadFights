import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const videoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 3000);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(videoTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7044859_Cave_Dark_1280x720-WS9jQgIQGGvxt090sMx3Ktmiaik1aA.mp4"
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="flex flex-col items-center gap-4">
              <motion.img
                src={theme.images.logo}
                alt="Silkroad Fights Logo"
                className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
                initial={{ scale: 0.5, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                SILKROAD FIGHTS
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroAnimation;

