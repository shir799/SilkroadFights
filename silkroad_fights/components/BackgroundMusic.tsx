import React, { useEffect, useRef } from 'react';

interface BackgroundMusicProps {
  isMuted: boolean;
  volume: number;
}

export function BackgroundMusic({ isMuted, volume }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      
      const playAudio = () => {
        if (!isMuted) {
          audioRef.current?.play().catch(() => {
            // Silently handle any autoplay restrictions
          });
        } else {
          audioRef.current?.pause();
        }
      };

      playAudio();
    }
  }, [isMuted, volume]);

  return (
    <audio
      ref={audioRef}
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Taverne%20de%20l'herbe%20japonaise-nfWLpMOPbE8YHEmGGuevpMd9kJbqGc.mp3"
      loop
    />
  );
}

