/* eslint-disable react/require-default-props */

"use client";

import React from "react";
import { motion } from "framer-motion";

export function MotionBox({
  children,
  y = 20,
  delay = 0, // Add a default value for the delay prop
}: {
  children: React.ReactNode;
  y?: number;
  delay?: number; // Define the delay prop with an optional number type
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay }} // Use the delay prop value in the transition
    >
      {children}
    </motion.div>
  );
}
