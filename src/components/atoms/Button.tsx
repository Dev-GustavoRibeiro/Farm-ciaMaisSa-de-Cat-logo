'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-black text-white hover:bg-[#00cc66] hover:text-black border border-black',
      secondary: 'bg-gray-100 text-black hover:bg-gray-200 border border-transparent',
      outline: 'border border-black bg-transparent hover:bg-black hover:text-white text-black',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-black',
      danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
    };

    const sizes = {
      sm: 'h-8 px-4 text-xs font-bold uppercase tracking-wider',
      md: 'h-12 px-6 py-2 font-bold uppercase tracking-tight text-sm',
      lg: 'h-16 px-10 text-xl font-black uppercase tracking-tighter',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 active:translate-y-[2px]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
