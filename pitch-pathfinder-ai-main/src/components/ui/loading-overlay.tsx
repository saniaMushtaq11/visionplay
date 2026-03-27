import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  text?: string;
  spinnerVariant?: 'primary' | 'accent' | 'secondary';
  spinnerSize?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingOverlay = ({
  isLoading,
  text = 'Loading...',
  spinnerVariant = 'accent',
  spinnerSize = 'md',
  fullScreen = false,
  className,
  ...props
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-fade-in',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
      {...props}
    >
      <Spinner variant={spinnerVariant} size={spinnerSize} />
      {text && (
        <p className="mt-4 text-foreground/80 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

export { LoadingOverlay };