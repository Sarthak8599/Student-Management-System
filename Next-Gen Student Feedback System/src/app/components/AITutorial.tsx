import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { X, Bot, Mic, BarChart2, AlertTriangle, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../../types';

interface AITutorialProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export const AITutorial = ({ isOpen, onClose, defaultRole = 'student' }: AITutorialProps) => {
  const [activeTab, setActiveTab] = useState<Role>(defaultRole);

  if (!isOpen) return null;

  const content = {
    student: {
      title: "Student AI Features",
      icon: <Sparkles className="w-6 h-6 text-violet-400" />,
      features: [
        {
          title: "Smart Survey Summaries",
          icon: <BrainCircuit className="w-5 h-5 text-blue-400" />,
          desc: "Before you even start, AI analyzes your past feedback to show you a personalized summary of your engagement style."
        },
        {
          title: "Voice-to-Text Feedback",
          icon: <Mic className="w-5 h-5 text-green-400" />,
          desc: "Don't like typing? Click the 'Voice Input' button in the feedback form to speak your mind. Our AI transcribes it instantly."
        }
      ]
    },
    faculty: {
      title: "Faculty AI Features",
      icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
      features: [
        {
          title: "Sentiment Dashboard",
          icon: <Bot className="w-5 h-5 text-violet-400" />,
          desc: "AI reads through student comments to determine the overall 'mood' (Positive, Neutral, Negative) so you can gauge satisfaction instantly."
        },
        {
          title: "Improvement Suggestions",
          icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
          desc: "Click on any course bar in the chart! AI analyzes the lowest-rated aspect (e.g., Clarity) and suggests specific teaching techniques to improve it."
        }
      ]
    },
    admin: {
      title: "Admin AI Features",
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      features: [
        {
          title: "Predictive Alerts",
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
          desc: "The system automatically flags courses with falling ratings (< 3.5) as 'At Risk' before they become critical issues."
        },
        {
          title: "Bulk Intelligence",
          icon: <BrainCircuit className="w-5 h-5 text-blue-400" />,
          desc: "AI monitors data across all departments to visualize trends in real-time, helping you allocate resources where they are needed most."
        }
      ]
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="relative overflow-hidden border-violet-500/30">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex flex-col md:flex-row h-[500px]">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 bg-slate-900/50 border-r border-white/5 p-4 flex flex-col gap-2">
              <div className="mb-6 flex items-center gap-2 px-2">
                 <Bot className="w-6 h-6 text-violet-500" />
                 <span className="font-bold text-white">How AI Works</span>
              </div>
              
              {(['student', 'faculty', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveTab(r)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === r 
                      ? 'bg-violet-600/20 border border-violet-500/50 text-white' 
                      : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <span className="capitalize">{r}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="w-full md:w-2/3 p-8 bg-gradient-to-br from-slate-900/50 to-slate-950/50">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-6"
               >
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        {content[activeTab].icon}
                     </div>
                     <h2 className="text-xl font-bold text-white">{content[activeTab].title}</h2>
                  </div>

                  <div className="space-y-6">
                    {content[activeTab].features.map((feature, i) => (
                      <div key={i} className="bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                           {feature.icon}
                           <h3 className="font-bold text-slate-200">{feature.title}</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                     <Button className="w-full" onClick={onClose}>
                       Got it, let's go!
                     </Button>
                  </div>
               </motion.div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
