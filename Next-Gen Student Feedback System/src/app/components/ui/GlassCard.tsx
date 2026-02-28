import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className, hoverEffect = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white/90 backdrop-blur-xl border border-[#E9E6F7] rounded-3xl p-6 shadow-xl shadow-[#7A6AD8]/5",
        hoverEffect && "hover:shadow-2xl hover:shadow-[#7A6AD8]/10 hover:-translate-y-1 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
