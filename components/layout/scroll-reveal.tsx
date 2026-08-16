"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Reveal — the one motion primitive the desktop home page uses. A section
// (or a single card inside a stagger loop) fades and lifts into place the
// first time it crosses into view, then never re-triggers. `motion-safe:`
// keeps this a no-op for prefers-reduced-motion, and the IntersectionObserver
// disconnects itself after firing so idle scroll costs nothing.
// ---------------------------------------------------------------------------
export function Reveal({
    children,
    className,
    delay = 0,
    as: Tag = "div",
}: {
    children: React.ReactNode
    className?: string
    delay?: number
    as?: "div" | "li"
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const Comp = Tag as "div"

    return (
        <Comp
            ref={ref}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
            className={cn(
                "motion-safe:translate-y-8 motion-safe:opacity-0 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
                visible && "motion-safe:translate-y-0 motion-safe:opacity-100",
                className
            )}
        >
            {children}
        </Comp>
    )
}
