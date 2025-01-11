import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../lib/theme';

interface ModeSelectScreenProps {
  onStartGame: (mode: string, difficulty: string) => void;
}

const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({ onStartGame }) => {
  const [selectedSide, setSelectedSide] = useState<'trader' | 'thief' | null>(null);
  const [difficulty, setDifficulty] = useState('normal');

  const handleDragStart = (side: 'trader' | 'thief') => {
    setSelectedSide(side);
  };

  const handleDragEnd = () => {
    // You can add any logic here if needed when dragging ends
  };

  const handleStartGame = () => {
    if (selectedSide) {
      onStartGame(
        selectedSide === 'trader' ? 'human_vs_ai_trader' : 'human_vs_ai_thief',
        difficulty
      );
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wu%CC%88ste.png-jROVC0W501XiwIuImGamlbQ5r3KKNZ.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <img src={theme.images.logo} alt="Silkroad Fights" className="h-32" />
        </div>

        <div className="flex justify-center gap-8 mb-12">
          {/* Trader Side */}
          <motion.div 
            className={`w-1/3 p-4 rounded-lg cursor-grab bg-black bg-opacity-50 backdrop-blur-sm ${
              selectedSide === 'trader' ? 'ring-4 ring-yellow-400' : ''
            }`}
            
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragStart={() => handleDragStart('trader')}
            onDragEnd={handleDragEnd}
            onClick={() => setSelectedSide('trader')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-xl font-bold text-center text-yellow-400 mb-4">Silk Traders</h3>
            <div className="flex justify-center gap-4 mb-4">
              <img src={theme.images.trader} alt="Trader" className="w-16 h-16 object-contain" />
              <img src={theme.images.hunter} alt="Hunter" className="w-16 h-16 object-contain" />
            </div>
            <p className="text-white text-center text-sm">
              Transport precious silk and gold while defending against thieves
            </p>
          </motion.div>

          {/* Thief Side */}
          <motion.div 
            className={`w-1/3 p-4 rounded-lg cursor-grab bg-black bg-opacity-50 backdrop-blur-sm ${
              selectedSide === 'thief' ? 'ring-4 ring-yellow-400' : ''
            }`}
            
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragStart={() => handleDragStart('thief')}
            onDragEnd={handleDragEnd}
            onClick={() => setSelectedSide('thief')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-xl font-bold text-center text-yellow-400 mb-4">Shadow Thieves</h3>
            <div className="flex justify-center gap-4 mb-4">
              <img src={theme.images.thief} alt="Thief" className="w-16 h-16 object-contain" />
              <img src={theme.images.kingThief} alt="King Thief" className="w-16 h-16 object-contain" />
            </div>
            <p className="text-white text-center text-sm">
              Ambush traders and steal their precious cargo
            </p>
          </motion.div>
        </div>

        {/* Difficulty Selection */}
        <div className="w-full max-w-md mx-auto p-6 rounded-lg bg-black bg-opacity-50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-center text-yellow-400 mb-4">Select Difficulty</h3>
          <div className="flex justify-between gap-4">
            {['noob', 'normal', 'silkroad'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-lg transform transition-all ${
                  difficulty === diff 
                    ? 'ring-2 ring-yellow-400 scale-105' 
                    : 'hover:scale-105'
                }`}
                style={{
                  background: difficulty === diff ? theme.gradients.button : 'rgba(139, 69, 19, 0.5)',
                  border: '1px solid #D4AF37'
                }}
              >
                <span className="text-white capitalize">{diff}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          onClick={handleStartGame}
          disabled={!selectedSide}
          className={`w-full max-w-md mx-auto mt-8 p-4 text-xl font-bold text-white rounded transform transition-all ${
            !selectedSide ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          style={{
            background: theme.gradients.button,
            border: '2px solid #8B4513',
            display: 'block'
          }}
          whileHover={{ scale: selectedSide ? 1.05 : 1 }}
          whileTap={{ scale: selectedSide ? 0.95 : 1 }}
        >
          {selectedSide ? 'Start Battle' : 'Select Your Side'}
        </motion.button>
      </div>
    </div>
  );
};

export default ModeSelectScreen;

