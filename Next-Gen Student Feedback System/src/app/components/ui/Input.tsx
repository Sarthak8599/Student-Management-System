import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-[#E9E6F7] bg-white px-4 py-3 text-sm text-[#2E2E4D] placeholder:text-[#9C8ADE]/60 focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
