"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Apple spring curve: [0.2, 0.8, 0.2, 1]
const APPLE_SPRING = [0.2, 0.8, 0.2, 1] as const;

export function FadeIn({ 
  children, 
  delay = 0, 
  className,
  y = 16,
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: APPLE_SPRING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ 
  children, 
  delay = 0, 
  className,
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: APPLE_SPRING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  className,
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: APPLE_SPRING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ 
  children, 
  className, 
  delay = 0,
}: { 
  children: ReactNode; 
  className?: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.06,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children, 
  className,
  interactive = true,
}: { 
  children: ReactNode; 
  className?: string;
  interactive?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: 12, 
          scale: 0.97,
        },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          transition: { 
            duration: 0.4, 
            ease: APPLE_SPRING,
          } 
        },
      }}
      whileHover={interactive ? { 
        y: -2, 
        transition: { duration: 0.2, ease: APPLE_SPRING } 
      } : undefined}
      whileTap={interactive ? { 
        scale: 0.98,
        transition: { duration: 0.1, ease: APPLE_SPRING }
      } : undefined}
      className={cn("cursor-default", className)}
    >
      {children}
    </motion.div>
  );
}

export function PressScale({
  children,
  className,
  scale = 0.97,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ duration: 0.1, ease: APPLE_SPRING }}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
}
