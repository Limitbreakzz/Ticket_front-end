import { motion, useReducedMotion } from 'framer-motion';

export default function PageTransition({ children }) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.995 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1] // Custom smooth easeOutExpo
      }
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.995,
      transition: {
        duration: 0.12,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
}
