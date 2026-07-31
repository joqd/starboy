"use client"

import { useVelocity, useSpring, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"

/**
 * Differentiates a MotionValue into a smoothed, direction-signed factor
 * roughly in [-1, 1].
 *
 * This intentionally does NOT read window/page scroll. On a fixed,
 * viewport-sized page there is nothing to differentiate — `scrollY` never
 * changes, so `useVelocity(scrollY)` is always exactly 0. That's why the
 * previous version always produced 0 no matter how fast you scrolled.
 *
 * Feed this whatever MotionValue actually carries your input signal
 * instead — e.g. the wheel/drag pixel accumulator in
 * ScrollVelocityGallery. It works identically regardless of whether the
 * page itself ever scrolls.
 */
export function useScrollVelocityFactor(
    source: MotionValue<number>,
    damping = 50,
    stiffness = 400
): MotionValue<number> {
    const rawVelocity = useVelocity(source)
    const smoothVelocity = useSpring(rawVelocity, { damping, stiffness })
    return useTransform(smoothVelocity, [-1200, 0, 1200], [-1, 0, 1], { clamp: false })
}
