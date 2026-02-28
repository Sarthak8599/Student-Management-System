import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-gradient-to-r from-[#C7B8EA] to-[#A78EC4] hover:from-[#B9A7D9] hover:to-[#9C8ADE] text-white shadow-lg shadow-[#C7B8EA]/25 rounded-full",
      secondary: "bg-gradient-to-r from-[#E9D8F7] to-[#D7C9F5] text-[#A78EC4] hover:from-[#E3D2F4] hover:to-[#C9BCE5] rounded-full",
      outline: "bg-transparent border-2 border-[#C7B8EA] text-[#C7B8EA] hover:bg-[#F7F5FA] rounded-full",
      ghost: "bg-transparent text-[#A78EC4] hover:text-[#A78EC4] hover:bg-[#F7F5FA]/50 rounded-full"
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6",
      lg: "h-13 px-8 text-lg"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7B8EA]/50 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
