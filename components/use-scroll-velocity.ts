"use client"

import { useVelocity, useSpring, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"

/**
 * Differentiates a MotionValue into a smoothed, direction-signed factor
 * roughly in [-1, 1].
 *
 * When passing `smoothS` (a step-based position MotionValue), velocity
 * represents steps per second rather than raw input pixels per second.
 */
export function useScrollVelocityFactor(
    source: MotionValue<number>,
    damping = 30,
    stiffness = 200
): MotionValue<number> {
    const rawVelocity = useVelocity(source)
    const smoothVelocity = useSpring(rawVelocity, { damping, stiffness })

    return useTransform(smoothVelocity, [-5, 0, 5], [-1, 0, 1], { clamp: false })
}
