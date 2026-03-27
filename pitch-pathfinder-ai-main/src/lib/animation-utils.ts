import { cn } from './utils';

/**
 * Animation variants for different components
 */
export const ANIMATION_VARIANTS = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  pulseGlow: 'animate-pulse-glow',
};

/**
 * Animation durations
 */
export const ANIMATION_DURATIONS = {
  fast: 'duration-150',
  default: 'duration-300',
  slow: 'duration-500',
  slower: 'duration-700',
  slowest: 'duration-1000',
};

/**
 * Animation delays
 */
export const ANIMATION_DELAYS = {
  none: 'delay-0',
  short: 'delay-100',
  default: 'delay-300',
  long: 'delay-500',
  longer: 'delay-700',
  longest: 'delay-1000',
};

/**
 * Transition properties
 */
export const TRANSITION_PROPERTIES = {
  all: 'transition-all',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  shadow: 'transition-shadow',
  transform: 'transition-transform',
};

/**
 * Combines animation classes based on provided options
 * 
 * @param options - Animation options
 * @returns Combined class string
 */
export function getAnimationClasses(options: {
  variant?: keyof typeof ANIMATION_VARIANTS;
  duration?: keyof typeof ANIMATION_DURATIONS;
  delay?: keyof typeof ANIMATION_DELAYS;
  transition?: keyof typeof TRANSITION_PROPERTIES;
  className?: string;
}) {
  const {
    variant,
    duration = 'default',
    delay,
    transition = 'all',
    className,
  } = options;

  return cn(
    variant && ANIMATION_VARIANTS[variant],
    ANIMATION_DURATIONS[duration],
    delay && ANIMATION_DELAYS[delay],
    TRANSITION_PROPERTIES[transition],
    className
  );
}