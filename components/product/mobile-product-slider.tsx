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

// Fixed render window: this many cards are mounted AT ALL TIMES, no matter
// how large the catalog is. The previous approach mounted (2*LOOPS+1)*n —
// three full copies of the whole product list — which was fine for a
// handful of items but meant a 40-product catalog kept 120 <Image>s and
// 120 sets of motion transforms alive and recalculating every frame, even
// far off-screen. WINDOW_RADIUS=5 (11 cards) covers what's visible plus
// enough buffer for the spring/wave overshoot, and costs the same whether
// the catalog has 8 products or 800.
const WINDOW_RADIUS = 5

const PX_PER_STEP = STEP_Y
const SCROLL_SPEED_MULTIPLIER = 1.6

const POSITION_STIFFNESS = 80
const POSITION_DAMPING = 30

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
    // Wheel and touch-drag are opposite conventions, not the same gesture
    // with a different name: scrolling a wheel down moves content up, but
    // dragging a finger down should move content down WITH the finger —
    // that's what every native mobile scroll view does. The desktop
    // version only ever deals with wheel/mouse-drag, so it never hit this;
    // on touch it has to be inverted relative to raw pan delta or the
    // whole gallery feels like it's fighting the user's thumb.
    const handlePan = (_: unknown, info: PanInfo) => {
        inputPx.set(inputPx.get() - info.delta.y * SCROLL_SPEED_MULTIPLIER)
    }

    const sTarget = useTransform(inputPx, (px) => px / PX_PER_STEP)
    const smoothS = useSpring(sTarget, {
        stiffness: POSITION_STIFFNESS,
        damping: POSITION_DAMPING,
        mass: 1,
    })

    // Tracks the nearest whole card index to the current scroll position.
    // The window of mounted cards is recentered around this — it updates
    // roughly once per card scrolled, not every frame.
    const [centerIndex, setCenterIndex] = useState(0)
    useMotionValueEvent(smoothS, "change", (latest) => {
        const nearest = Math.round(latest)
        if (nearest !== centerIndex) setCenterIndex(nearest)
    })

    const velocityFactor = useScrollVelocityFactor(smoothS)
    const targetEnvelope = useTransform(velocityFactor, (v) => Math.min(Math.abs(v), 1))
    const waveEnvelope = useSpring(targetEnvelope, {
        stiffness: 80,
        damping: 25,
        mass: 0.8,
    })

    const groupY = useTransform(smoothS, (v) => -v * STEP_Y + BASE_Y)

    // Always exactly 2*WINDOW_RADIUS+1 slots. Each slot's globalIndex only
    // determines its Y position; the actual product shown is globalIndex
    // wrapped (mod n) into the real list — that wrap is the entire "infinite"
    // effect, and it costs nothing extra.
    const slots = useMemo(() => {
        if (n === 0) return []
        const out: { item: ProductListItem; globalIndex: number }[] = []
        for (let offset = -WINDOW_RADIUS; offset <= WINDOW_RADIUS; offset++) {
            const globalIndex = centerIndex + offset
            const itemIndex = ((globalIndex % n) + n) % n
            out.push({ item: items[itemIndex], globalIndex })
        }
        return out
    }, [items, n, centerIndex])

    if (n === 0) return null

    return (
        <section
            className={`relative h-screen w-full overflow-hidden ${className}`}
            onWheel={handleWheel}
        >
            <TopBar />

            <div className="relative flex h-full w-full items-center justify-center">
                <motion.div
                    className="relative flex cursor-grab flex-col items-center justify-center will-change-transform"
                    style={{ y: groupY, touchAction: "none" }}
                    onPan={handlePan}
                    role="list"
                >
                    {slots.map(({ item, globalIndex }) => (
                        <Card
                            key={globalIndex}
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

// Fixed header: logo top-left, menu top-right. Uses the same frosted-glass
// treatment as iOS system bars — a strong blur + saturation boost over a
// translucent fill, rather than a flat gradient scrim — so it reads clearly
// whether the card behind it is a bright product photo or a dark one, with
// a hairline bottom border to separate it from the content instead of
// relying on shadow alone.
function TopBar() {
    return (
        <div
            dir="ltr"
            className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-background/60 shadow-sm backdrop-blur-2xl backdrop-saturate-150"
        >
            <div className="flex items-center justify-between px-4 py-3">
                <div className="select-none">
                    <StarboyLogo className="w-20 text-primary" />
                </div>
                <button
                    type="button"
                    aria-label="منو"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-primary"
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
    // scale, zIndex, and opacity are all compositor-only properties — the
    // browser can animate them on the GPU without ever repainting the
    // card's pixels. This is what gives the "lift to front" look: no
    // per-frame boxShadow (that property forces a real repaint on every
    // change, and was the other big source of jank alongside the mount
    // count). A plain static shadow class below still sells the depth.
    const scale = useTransform(elevation, (e) => 1 + e * 0.06)
    const zIndex = useTransform(elevation, (e) => Math.round(e * 100))
    const opacity = useTransform(elevation, (e) => 0.75 + e * 0.25)

    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <motion.div
            role="listitem"
            className="absolute"
            style={{ width: CARD_W, height: CARD_H, y: finalY, scale, zIndex, opacity }}
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
            <div
                className="relative h-full w-full overflow-hidden rounded-3xl shadow-xl shadow-black/25"
                style={{ transform: "translateZ(0)" }}
            >
                <Link href={`p/${item.slug}`} className="relative block h-full w-full">
                    <Image
                        src={item.images[0]?.image}
                        alt={item.title}
                        fill
                        sizes="280px"
                        quality={75}
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
            </div>
        </motion.div>
    )
})
