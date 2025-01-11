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

  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="relative max-w-4xl w-full mx-4"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="relative p-8 rounded-lg overflow-hidden" style={{
            background: 'linear-gradient(45deg, #8B4513, #D4AF37)',
            border: '3px solid #FFD700',
            boxShadow: '0 0 30px rgba(255, 165, 0, 0.5)'
          }}>
            {/* Boss Image */}
            <motion.div
              className="absolute top-0 right-0 w-[200px] h-[200px]"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src={theme.images[bossType.toLowerCase()]}
                alt={bossType}
                className="w-full h-full object-contain"
              />
            </motion.div>

            <motion.div
              className="mt-4 text-lg text-yellow-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {isDefeat ? dialogue.text : dialogue.battleCry}
            </motion.div>

            {/* Content */}
            <div className="max-w-2xl">
              <motion.h2
                className="text-5xl font-bold text-yellow-300 mb-6"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)'
                }}
              >
                {dialogue.title}
              </motion.h2>

              <motion.div
                className="text-lg text-yellow-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {isDefeat ? dialogue.reward : dialogue.description}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

