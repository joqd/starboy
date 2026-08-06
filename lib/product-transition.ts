"use client"

// Plain module-level state (not React state/Context) on purpose: Next.js
// App Router navigations are client-side, so this module stays loaded and
// keeps its value across a Home -> Product -> back-to-Home round trip
// without needing a Provider anywhere.

let lastTransitionSlug: string | null = null

/** Call this right before navigating forward into a product, from Home. */
export function setLastTransitionSlug(slug: string | null) {
    lastTransitionSlug = slug
}

/**
 * Read on Home's initial render after a back-navigation, to figure out
 * which mounted card (if any) should carry the shared image name so it
 * morphs back into place instead of just cross-fading in.
 */
export function getLastTransitionSlug() {
    return lastTransitionSlug
}

export function productImageTransitionName(slug: string) {
    return `product-image-${slug}`
}

// Duration (ms) used whenever we don't have a click-measured card size to
// derive a proportional duration from — e.g. the explicit "back to home"
// link, where nothing was just clicked in the gallery to measure.
export const VT_BASE_DURATION_MS = 450
export const VT_MIN_DURATION_MS = 380
export const VT_MAX_DURATION_MS = 700

/**
 * Sets the CSS variable the shared image group's animation-duration reads
 * from (see view-transitions.css). Called synchronously, right before the
 * navigating Link's own click handler fires document.startViewTransition,
 * so the value is committed in time for that transition.
 */
export function setTransitionDuration(ms: number) {
    if (typeof document === "undefined") return
    const clamped = Math.min(VT_MAX_DURATION_MS, Math.max(VT_MIN_DURATION_MS, ms))
    document.documentElement.style.setProperty("--vt-duration", `${Math.round(clamped)}ms`)
}
