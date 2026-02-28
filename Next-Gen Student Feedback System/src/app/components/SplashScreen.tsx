import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, BookOpen, School, Brain, Sparkles, Award, Users, Target, Lightbulb } from 'lucide-react';

export type LogoOption = 'graduation' | 'book' | 'school' | 'brain' | 'sparkles' | 'award' | 'users' | 'target' | 'lightbulb';

interface SplashScreenProps {
  onComplete: () => void;
  selectedLogo?: LogoOption;
  duration?: number;
}

const logoComponents: Record<LogoOption, React.ComponentType<{ className?: string }>> = {
  graduation: GraduationCap,
  book: BookOpen,
  school: School,
  brain: Brain,
  sparkles: Sparkles,
  award: Award,
  users: Users,
  target: Target,
  lightbulb: Lightbulb,
};

const logoNames: Record<LogoOption, string> = {
  graduation: 'Graduation Cap',
  book: 'Open Book',
  school: 'School Building',
  brain: 'AI Brain',
  sparkles: 'Sparkles',
  award: 'Award Trophy',
  users: 'Community',
  target: 'Target Goal',
  lightbulb: 'Bright Idea',
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  selectedLogo = 'graduation',
  duration = 2500 
}) => {
  const [progress, setProgress] = useState(0);
  const LogoComponent = logoComponents[selectedLogo];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (duration / 30));
      });
    }, 30);

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute w-40 h-40 rounded-full border-2 border-violet-500/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.5, 1.8],
                opacity: [0.5, 0.3, 0],
              }}
              transition={{ 
                duration: 2,
                delay: ring * 0.4,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Main Logo */}
        <motion.div
          className="w-28 h-28 bg-gradient-to-br from-violet-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/40 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 1
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <LogoComponent className="w-14 h-14 text-white" />
          </motion.div>

          {/* Shine effect */}
          <motion.div 
            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.5,
              delay: 0.5,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* App Name */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-1">
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              EduPulse
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Next-Gen Student Feedback System</p>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          className="mt-8 w-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            Loading... {Math.round(progress)}%
          </p>
        </motion.div>

        {/* Tagline animation */}
        <motion.div
          className="mt-6 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {['Empower', '•', 'Connect', '•', 'Grow'].map((word, index) => (
            <motion.span
              key={word}
              className={`text-sm font-medium ${
                word === '•' ? 'text-violet-500' : 'text-slate-400'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.15 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Logo Selector Component for Admin/Settings
export const LogoSelector: React.FC<{
  selected: LogoOption;
  onSelect: (logo: LogoOption) => void;
}> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {(Object.keys(logoComponents) as LogoOption[]).map((logoKey) => {
        const LogoComp = logoComponents[logoKey];
        const isSelected = selected === logoKey;
        
        return (
          <motion.button
            key={logoKey}
            onClick={() => onSelect(logoKey)}
            className={`flex flex-col items-center p-4 rounded-xl transition-all ${
              isSelected 
                ? 'bg-gradient-to-br from-violet-600/20 to-blue-600/20 border-2 border-violet-500' 
                : 'bg-slate-900/50 border border-slate-700 hover:border-slate-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
              isSelected 
                ? 'bg-gradient-to-br from-violet-600 to-blue-600' 
                : 'bg-slate-800'
            }`}>
              <LogoComp className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <span className={`text-xs font-medium ${
              isSelected ? 'text-violet-400' : 'text-slate-400'
            }`}>
              {logoNames[logoKey]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SplashScreen;
