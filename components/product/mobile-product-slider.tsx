"use client"

import Image from "next/image"
import { Link } from "next-view-transitions"
import { memo, useMemo, useState } from "react"
import type { WheelEvent } from "react"
import StarboyLogo from "../common/starboy-logo"
import {
    motion,
    useTransform,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    animate,
} from "motion/react"
import { Lock, Menu } from "lucide-react"
import type { MotionValue, PanInfo } from "motion/react"
import { useScrollVelocityFactor } from "@/lib/use-scroll-velocity"
import type { ScrollVelocityGalleryProps } from "@/types/gallery"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

// Mobile variant of ScrollVelocityGallery: same underdamped-spring
// "plucked string" physics as the desktop version, but with no
// perspective/rotateY/z. Cards sit in a single vertical column and the
// only axis that ever moves is Y — group position + per-card ripple.
const CARD_W = 280
const CARD_H = 340
const STEP_Y = CARD_H + 34
const BASE_Y = 0

// Fixed-size render window, same trick as desktop: only ever mount
// (2*LOOPS+1)*n cards no matter how far the user scrolls.
const LOOPS = 1

const PX_PER_STEP = STEP_Y
const SCROLL_SPEED_MULTIPLIER = 1.15

const POSITION_STIFFNESS = 60
const POSITION_DAMPING = 20

// Per-card ripple, vertical only.
const WAVE_PHASE_STEP = (2 * Math.PI) / 5
const WAVE_MAX_Y_PX = 20

// How many index-steps of distance from the current scroll position still
// count as "in focus". A card at distance 0 is fully elevated (front,
// slightly larger, strongest shadow); past ELEVATION_RANGE it settles flat
// behind its neighbors. This is what makes overlapping cards read as a
// deliberate stack instead of two flat images clipping into each other.
const ELEVATION_RANGE = 1.35

export default function ScrollVelocityGalleryMobile({
    items,
    className = "",
    waveIntensity = 2.5,
}: ScrollVelocityGalleryProps) {
    const n = items.length

    const inputPx = useMotionValue(0)

    const handleWheel = (e: WheelEvent) => {
        inputPx.set(inputPx.get() + e.deltaY * SCROLL_SPEED_MULTIPLIER)
    }
    const handlePan = (_: unknown, info: PanInfo) => {
        inputPx.set(inputPx.get() + info.delta.y * SCROLL_SPEED_MULTIPLIER)
    }

    const sTarget = useTransform(inputPx, (px) => px / PX_PER_STEP)
    const smoothS = useSpring(sTarget, {
        stiffness: POSITION_STIFFNESS,
        damping: POSITION_DAMPING,
        mass: 1,
    })

    const [centerLoop, setCenterLoop] = useState(0)
    useMotionValueEvent(smoothS, "change", (latest) => {
        if (n === 0) return
        const nearest = Math.round(latest / n)
        if (nearest !== centerLoop) setCenterLoop(nearest)
    })

    const velocityFactor = useScrollVelocityFactor(smoothS)
    const targetEnvelope = useTransform(velocityFactor, (v) => Math.min(Math.abs(v), 1))
    const waveEnvelope = useSpring(targetEnvelope, {
        stiffness: 80,
        damping: 25,
        mass: 0.8,
    })

    const groupY = useTransform(smoothS, (v) => -v * STEP_Y + BASE_Y)

    const slots = useMemo(() => {
        const out: { item: ProductListItem; globalIndex: number }[] = []
        for (let loop = centerLoop - LOOPS; loop <= centerLoop + LOOPS; loop++) {
            for (let i = 0; i < n; i++) {
                out.push({ item: items[i], globalIndex: loop * n + i })
            }
        }
        return out
    }, [items, n, centerLoop])

    if (n === 0) return null

    return (
        <section
            className={`relative h-screen w-full overflow-hidden ${className}`}
            onWheel={handleWheel}
        >
            {/* <TopBar /> */}

            <div className="relative flex h-full w-full items-center justify-center">
                <motion.div
                    className="relative flex cursor-grab flex-col items-center justify-center will-change-transform"
                    style={{ y: groupY, touchAction: "none" }}
                    onPan={handlePan}
                    role="list"
                >
                    {slots.map(({ item, globalIndex }, key) => (
                        <Card
                            key={`${item.id}-${key}`}
                            item={item}
                            globalIndex={globalIndex}
                            scrollPos={smoothS}
                            waveEnvelope={waveEnvelope}
                            waveIntensity={waveIntensity}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

// Fixed header: logo top-left, menu top-right, sitting on a blurred
// gradient scrim so both stay legible over whatever card is passing
// underneath.
function TopBar() {
    return (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/85 via-background/35 to-transparent backdrop-blur-md" />
            <div className="relative flex items-center justify-between px-4 pt-4">
                <div dir="ltr" className="pointer-events-auto select-none">
                    <StarboyLogo className="w-20 text-primary" />
                </div>
                <button
                    type="button"
                    aria-label="منو"
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full text-primary"
                >
                    <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
            </div>
        </div>
    )
}

interface CardProps {
    item: ProductListItem
    globalIndex: number
    scrollPos: MotionValue<number>
    waveEnvelope: MotionValue<number>
    waveIntensity: number
}

const Card = memo(function Card({
    item,
    globalIndex,
    scrollPos,
    waveEnvelope,
    waveIntensity,
}: CardProps) {
    const [pressed, setPressed] = useState(false)
    const pressY = useMotionValue(0)

    // How "in focus" this card is right now — 1 at the current scroll
    // position, fading to 0 by ELEVATION_RANGE steps away. Drives scale,
    // shadow, and stacking order together so a card that overlaps its
    // neighbor visibly lifts in front of it instead of just clipping.
    const elevation = useTransform(scrollPos, (pos) =>
        Math.max(0, 1 - Math.abs(globalIndex - pos) / ELEVATION_RANGE)
    )

    const finalY = useTransform(
        [scrollPos, waveEnvelope, pressY],
        ([pos, envelope, pressOffset]: number[]) =>
            globalIndex * STEP_Y +
            Math.sin(pos - globalIndex * WAVE_PHASE_STEP) *
                envelope *
                WAVE_MAX_Y_PX *
                waveIntensity +
            pressOffset
    )
    const scale = useTransform(elevation, (e) => 1 + e * 0.06)
    const zIndex = useTransform(elevation, (e) => Math.round(e * 100))
    const boxShadow = useTransform(
        elevation,
        (e) => `0 ${8 + e * 18}px ${24 + e * 28}px rgba(0,0,0,${0.12 + e * 0.28})`
    )

    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <motion.div
            role="listitem"
            className="absolute"
            style={{ width: CARD_W, height: CARD_H, y: finalY, scale, zIndex }}
            onTapStart={() => {
                animate(pressY, 6, { type: "spring", stiffness: 450, damping: 22 })
                setPressed(true)
            }}
            onTap={() => {
                animate(pressY, 0, { type: "spring", stiffness: 450, damping: 22 })
                setPressed(false)
            }}
            onTapCancel={() => {
                animate(pressY, 0, { type: "spring", stiffness: 450, damping: 22 })
                setPressed(false)
            }}
        >
            <motion.div
                className="relative h-full w-full overflow-hidden rounded-3xl"
                style={{ boxShadow, transform: "translateZ(0)" }}
            >
                <Link href={`p/${item.slug}`} className="relative block h-full w-full">
                    <Image
                        src={item.images[0]?.image}
                        alt={item.title}
                        fill
                        sizes="280px"
                        draggable={false}
                        className={cn(
                            "border border-neutral-400/30 object-cover transition duration-150 select-none",
                            !hasStock && "grayscale",
                            pressed ? "brightness-90" : "brightness-100"
                        )}
                        loading="lazy"
                    />
                </Link>

                {!hasStock && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />}

                {!hasStock ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-neutral-50">
                            <Lock className="h-9 w-9" strokeWidth={1.8} />
                            <p className="text-sm font-medium tracking-wide">ناموجود</p>
                        </div>
                    </div>
                ) : (
                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 rounded-b-3xl bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pt-10 pb-3 text-neutral-50">
                        <p className="overflow-wrap-anywhere text-sm font-bold wrap-break-word whitespace-normal">
                            {item.title}
                        </p>
                        {item.variants?.[0] && (
                            <p className="mt-0.5 text-xs">
                                <span>{formatPrice(item.variants[0].price)}</span> تومان
                            </p>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
})
