"use client";

import { motion } from "motion/react";
import type { JSX, ReactNode } from "react";

interface TemplateMotionProps {
  readonly children: ReactNode;
}

export function TemplateMotion({ children }: TemplateMotionProps): JSX.Element {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
