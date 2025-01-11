import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { theme } from '../lib/theme';

interface SoundControlProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SoundControl: React.FC<SoundControlProps> = ({ isMuted, setIsMuted, volume, setVolume }) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    console.log('Volume changed:', newVolume);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    console.log('Mute toggled. New state:', !isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ background: 'rgba(139, 69, 19, 0.3)', border: '2px solid #D4AF37' }}>
      <button
        onClick={toggleMute}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        style={{ background: theme.gradients.button }}
      >
        {isMuted ? <VolumeX className="text-white" /> : <Volume2 className="text-white" />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${theme.colors.primary} 0%, ${theme.colors.primary} ${volume * 100}%, ${theme.colors.secondary} ${volume * 100}%, ${theme.colors.secondary} 100%)`,
        }}
      />
    </div>
  );
};

export default SoundControl;

