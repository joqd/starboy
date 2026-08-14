"use client"

import { motion } from "motion/react"

export function AmbientGlow() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden dark:hidden">
            {/* Top Left Glow */}
            <motion.div
                className="absolute -top-48 -left-48 h-180 w-180 rounded-full bg-primary/10 blur-[180px] lg:bg-primary/25"
                animate={{
                    x: [0, 40, -20, 0],
                    y: [0, 30, -10, 0],
                    opacity: [0.35, 0.6, 0.35],
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Bottom Right Glow */}
            <motion.div
                className="absolute -right-48 -bottom-48 h-180 w-180 rounded-full bg-primary/20 blur-[180px] lg:bg-primary/40"
                animate={{
                    x: [0, -35, 20, 0],
                    y: [0, -25, 15, 0],
                    opacity: [0.35, 0.55, 0.35],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    )
}
