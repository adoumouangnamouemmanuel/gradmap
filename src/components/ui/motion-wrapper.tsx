"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SPRING = [0.32, 0.72, 0, 1] as const;

export function FadeIn({
  children, delay = 0, className, y = 12,
}: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: SPRING }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children, delay = 0, className,
}: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: SPRING }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children, delay = 0, className,
}: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: SPRING }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children, className, delay = 0,
}: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { delayChildren: delay, staggerChildren: 0.04 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children, className, interactive = true,
}: { children: ReactNode; className?: string; interactive?: boolean }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: SPRING } },
      }}
      whileHover={interactive ? { y: -1, transition: { duration: 0.15, ease: SPRING } } : undefined}
      whileTap={interactive ? { scale: 0.98, transition: { duration: 0.08, ease: SPRING } } : undefined}
      className={cn("cursor-default", className)}
    >
      {children}
    </motion.div>
  );
}
