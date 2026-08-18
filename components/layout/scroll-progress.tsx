"use client"

import { useEffect, useState } from "react"

// ---------------------------------------------------------------------------
// ScrollProgress — a 2px bar fixed to the top of the viewport whose width
// tracks how far down the page the visitor has scrolled. Meant to replace
// the native scrollbar as the page's only scroll indicator (see the CSS
// note in home-icons.tsx's neighbour, or the project's global stylesheet,
// for hiding the native one).
//
// Placement: this belongs once, near the root of the tree — ideally
// app/layout.tsx — not inside individual page components, since it's
// chrome for the whole site rather than page content. It's wired into
// mobile-home.tsx / desktop-home.tsx here only because those are the files
// in scope; if this project's layout file is reachable, move the single
// <ScrollProgress /> call there instead and drop it from both home files.
// ---------------------------------------------------------------------------
export function ScrollProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY
            const scrollable = document.documentElement.scrollHeight - window.innerHeight
            setProgress(scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0)
        }

        updateProgress()
        window.addEventListener("scroll", updateProgress, { passive: true })
        window.addEventListener("resize", updateProgress)
        return () => {
            window.removeEventListener("scroll", updateProgress)
            window.removeEventListener("resize", updateProgress)
        }
    }, [])

    return (
        <div className="inset-x-0 top-0 z-50 h-0.5 bg-border/60" aria-hidden>
            <div
                className="h-full bg-primary motion-safe:transition-[width] motion-safe:duration-150 motion-safe:ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
