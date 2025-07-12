// Animation utility functions for enhanced UI interactions

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export const slideInFromRight = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

export const slideInFromLeft = {
  initial: { x: -300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

export const slideInFromTop = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

export const slideInFromBottom = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const listItemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 }
}

// CSS classes for Tailwind animations
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  scaleIn: 'animate-scale-in',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
}

// Easing functions
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

// Duration constants
export const durations = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  enteringScreen: 225,
  leavingScreen: 195
}

// Animation helper functions
export const createTransition = (property, duration = durations.standard, easing = easings.easeInOut) => ({
  property,
  duration: `${duration}ms`,
  timingFunction: easing
})

export const createKeyframes = (name, keyframes) => ({
  [`@keyframes ${name}`]: keyframes
})

// Common animation combinations
export const cardHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: createTransition('all', durations.short)
}

export const buttonHover = {
  transform: 'translateY(-1px)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: createTransition('all', durations.shorter)
}

export const inputFocus = {
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  transition: createTransition('all', durations.shorter)
}

// Loading animations
export const loadingSpinner = createKeyframes('spin', {
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
})

export const loadingPulse = createKeyframes('pulse', {
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 }
})

export const loadingBounce = createKeyframes('bounce', {
  '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
  '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
  '70%': { transform: 'translate3d(0, -15px, 0)' },
  '90%': { transform: 'translate3d(0, -4px, 0)' }
})

// Page transition animations
export const pageTransitions = {
  fadeInOut: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideLeftRight: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { type: 'tween', ease: 'anticipate', duration: 0.5 }
  }
}

// Notification animations
export const notificationAnimations = {
  slideInFromTop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  },
  slideInFromRight: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 },
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  }
}
