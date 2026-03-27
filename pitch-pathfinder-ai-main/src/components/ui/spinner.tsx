import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'accent' | 'secondary';
}

const Spinner = ({
  size = 'md',
  variant = 'primary',
  className,
  ...props
}: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const variantClasses = {
    primary: 'border-primary/30 border-t-primary',
    accent: 'border-accent/30 border-t-accent',
    secondary: 'border-secondary/30 border-t-secondary',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

export { Spinner };