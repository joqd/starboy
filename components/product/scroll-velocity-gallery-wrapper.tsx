"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { ScrollVelocityGalleryProps } from "@/types/gallery"

const ScrollVelocityGallery = dynamic(
    () => import("@/components/product/scroll-velocity-gallery"),
    { ssr: false }
)

export function ScrollVelocityGalleryWrapper(
    props: ScrollVelocityGalleryProps & { className?: string }
) {
    const [isDesktop, setIsDesktop] = useState(false)
    useEffect(() => {
        const mql = window.matchMedia("(min-width: 1024px)")
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDesktop(mql.matches)
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
        mql.addEventListener("change", handler)
        return () => mql.removeEventListener("change", handler)
    }, [])
    if (!isDesktop) return null
    return <ScrollVelocityGallery {...props} />
}
