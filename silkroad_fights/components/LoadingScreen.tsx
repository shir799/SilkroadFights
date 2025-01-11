import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../lib/theme';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center" style={{ background: theme.colors.background }}>
      <motion.img 
        src={theme.images.logo} 
        alt="Silkroad Fights" 
        className="h-40 mb-8"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <motion.div 
        className="w-64 h-2 bg-green-200 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div 
          className="h-full bg-green-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

