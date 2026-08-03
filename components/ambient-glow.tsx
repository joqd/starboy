"use client"

import { motion } from "motion/react"

export function AmbientGlow() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {/* Top Left Glow */}
            <motion.div
                className="absolute -top-48 -left-48 h-180 w-180 rounded-full bg-fuchsia-500/30 blur-[180px]"
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
                className="absolute -right-48 -bottom-48 h-180 w-180 rounded-full bg-fuchsia-500/30 blur-[180px]"
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

            {/* Bottom Center Glow */}
            {/* <motion.div
                className="absolute -bottom-150 left-1/2 h-220 w-220 -translate-x-1/2 rounded-full bg-violet-500/30 blur-[220px]"
                animate={{
                    y: [0, -25, 0],
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 26,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            /> */}
        </div>
    )
}
