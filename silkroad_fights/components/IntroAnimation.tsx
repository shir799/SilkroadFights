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
    <div className="w-full h-screen relative overflow-hidden">
      <video
        autoPlay
        muted
        className="absolute inset-0 w-full h-full object-cover"
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7044859_Cave_Dark_1280x720-WS9jQgIQGGvxt090sMx3Ktmiaik1aA.mp4"
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              src={theme.images.logo}
              alt="Silkroad Fights Logo"
              className="w-64 h-64 object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroAnimation;

