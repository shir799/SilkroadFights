import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';
import { useEffect } from 'react';

interface BossAnnouncementProps {
  bossType: 'TigerGiry' | 'SkeletoKing' | 'Murucha';
  onClose: () => void;
  isDefeat?: boolean;
}

const bossDialogue = {
  TigerGiry: {
    spawn: {
      title: "TigerGiry erscheint!",
      text: "Ihr wagt es, meinen heiligen Boden zu betreten?",
      battleCry: "Mein Tiger wird eure Knochen zermalmen!",
      description: "Der schnellste Jäger der Seidenstraße - Geschwindigkeit bedeutet den Tod!"
    },
    defeat: {
      title: "TigerGiry wurde besiegt!",
      text: "Unmöglich... mein Tiger... verzeiht mir...",
      reward: "Seine Geschwindigkeit ist nun eure!"
    }
  },
  SkeletoKing: {
    spawn: {
      title: "SkeletoKing erhebt sich!",
      text: "Tausend Jahre Dunkelheit erwachen...",
      battleCry: "Eure Seelen werden meine Armee verstärken!",
      description: "Der untote Herrscher - Seine Berührung bedeutet ewige Verdammnis!"
    },
    defeat: {
      title: "SkeletoKing zerfällt zu Staub!",
      text: "Zurück in die Schatten... aber ich kehre wieder...",
      reward: "Seine dunkle Macht verstärkt eure Waffen!"
    }
  },
  Murucha: {
    spawn: {
      title: "Murucha manifestiert sich!",
      text: "Die Erde bebt unter meiner Macht!",
      battleCry: "Niemand entkommt meiner Kontrolle!",
      description: "Der uralte Koloss - Sein Territorium ist der Tod!"
    },
    defeat: {
      title: "Murucha wurde bezwungen!",
      text: "Die Erde... sie ruft mich zurück...",
      reward: "Seine Macht der Kontrolle ist nun eure!"
    }
  }
};

export function BossAnnouncement({ bossType, onClose, isDefeat = false }: BossAnnouncementProps) {
  const dialogue = bossDialogue[bossType][isDefeat ? 'defeat' : 'spawn'];

  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: isDefeat
            ? 'radial-gradient(circle, rgba(0,255,0,0.2), rgba(0,0,0,0.9))'
            : 'radial-gradient(circle, rgba(255,0,0,0.3), rgba(0,0,0,0.9))'
        }}
      >
        {/* Pulsing background effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle, rgba(255,165,0,0.1), transparent)',
              'radial-gradient(circle, rgba(255,165,0,0.3), transparent)',
              'radial-gradient(circle, rgba(255,165,0,0.1), transparent)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          className="relative max-w-4xl w-full mx-4 z-10"
          initial={{ scale: 0.5, y: 100, rotateX: 90 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.5, y: -100, rotateX: -90 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        >
          <div className="relative p-8 rounded-lg overflow-hidden" style={{
            background: isDefeat
              ? 'linear-gradient(135deg, #228B22, #32CD32, #228B22)'
              : 'linear-gradient(135deg, #8B0000, #FF4500, #8B0000)',
            border: '4px solid',
            borderImage: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700) 1',
            boxShadow: isDefeat
              ? '0 0 50px rgba(0, 255, 0, 0.7), inset 0 0 50px rgba(0, 255, 0, 0.2)'
              : '0 0 50px rgba(255, 69, 0, 0.7), inset 0 0 50px rgba(255, 0, 0, 0.2)'
          }}>
            {/* Animated corner decorations */}
            <motion.div
              className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            />
            <motion.div
              className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
            />

            {/* Boss Image with dramatic entrance */}
            <motion.div
              className="absolute top-0 right-0 w-[250px] h-[250px] opacity-90"
              initial={{ x: 200, opacity: 0, rotate: -45, scale: 2 }}
              animate={{ x: 0, opacity: 0.9, rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            >
              <motion.img
                src={theme.images[bossType.toLowerCase()]}
                alt={bossType}
                className="w-full h-full object-contain drop-shadow-2xl"
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(255,215,0,0.8))',
                    'drop-shadow(0 0 40px rgba(255,165,0,1))',
                    'drop-shadow(0 0 20px rgba(255,215,0,0.8))'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Content */}
            <div className="max-w-2xl relative z-10">
              <motion.h2
                className="text-5xl sm:text-6xl font-bold mb-4"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                style={{
                  color: isDefeat ? '#00FF00' : '#FFD700',
                  textShadow: isDefeat
                    ? '0 0 20px rgba(0,255,0,1), 0 0 40px rgba(0,255,0,0.5), 3px 3px 0 #000'
                    : '0 0 20px rgba(255,215,0,1), 0 0 40px rgba(255,165,0,0.8), 3px 3px 0 #000'
                }}
              >
                {dialogue.title}
              </motion.h2>

              <motion.div
                className="text-2xl font-semibold text-yellow-100 mb-3"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                "{dialogue.text}"
              </motion.div>

              <motion.div
                className="text-xl font-bold mb-3"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  color: isDefeat ? '#FFFF00' : '#FF6347',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {isDefeat ? dialogue.reward : dialogue.battleCry}
              </motion.div>

              <motion.div
                className="text-lg text-yellow-200"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                }}
              >
                {!isDefeat && dialogue.description}
              </motion.div>
            </div>

            {/* Warning stripes animation */}
            {!isDefeat && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-2"
                style={{
                  background: 'repeating-linear-gradient(45deg, #FFD700, #FFD700 10px, #000 10px, #000 20px)'
                }}
                animate={{ x: [0, 20] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

