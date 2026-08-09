"use client"

import Image from "next/image"
import { Link } from "next-view-transitions"
import { useMemo, useState } from "react"
import type { WheelEvent } from "react"
import StarboyLogo from "../common/starboy-logo"
import {
    motion,
    AnimatePresence,
    useTransform,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    animate,
} from "motion/react"
import { Lock } from "lucide-react"
import type { MotionValue, PanInfo } from "motion/react"
import { useScrollVelocityFactor } from "@/lib/use-scroll-velocity"
import type { ScrollVelocityGalleryProps } from "@/types/gallery"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

// Card size and per-step 3D translation: a card sits this many px away in
// x/y/z from its neighbor. rotateY is fixed and identical on every card —
// the "receding line" look comes purely from the translate step, not from
// per-card rotation. x, z, and rotateY stay completely static per card (see
// Plane below); only y carries the shared sine-wave ripple.
const PLANE_W = 320
const PLANE_H = 384
const STEP = { x: 260, y: -90, z: -288 }
const ROTATE_Y = -50
const BASE_Y = 100

// How many extra copies of the product list to render on each side of the
// "real" one. This is a fixed-size RENDER WINDOW, not a travel limit: as the
// user keeps scrolling past a full cycle, the window recenters (see
// `centerLoop` below) instead of clamping, so scrolling is unbounded while
// the number of mounted <Plane> nodes stays constant at (2*LOOPS+1)*n
// forever, however long the user scrolls.
const LOOPS = 1

// How many px of wheel/drag input correspond to one product-index step.
// Using STEP.x keeps a roughly 1:1 feel between physical input and the
// resulting on-screen travel.
const PX_PER_STEP = STEP.x

// Small multiplier applied to raw wheel/drag input before it reaches the
// spring. The wave's depth is driven by input velocity (see waveEnvelope
// below), so nudging this up makes the same physical scroll/swipe register
// as slightly faster, more forceful input — which reads as a deeper wave —
// without touching the wave math itself. Kept close to 1 on purpose; this
// is a feel adjustment, not a redesign.
const SCROLL_SPEED_MULTIPLIER = 1.15

// Underdamped springs — deliberately below critical damping (critical here
// is ~2*sqrt(stiffness*mass)), so the group doesn't just ease toward its
// target, it overshoots and settles in a decaying sinusoidal wave, like a
// plucked string. A fast, forceful scroll/drag gives the spring a big
// velocity kick -> a pronounced wave that calms down over the next moment;
// a slow one barely disturbs it -> a small, proportionally gentler wave.
// That proportionality falls out of the physics for free.
const POSITION_STIFFNESS = 60
const POSITION_DAMPING = 20

// Per-card ripple: each card's own Y position gets a small extra offset of
// sin(phase - globalIndex * WAVE_PHASE_STEP) * envelope. Because every card
// samples the *same* phase/envelope but at a different point in the sine
// cycle (offset by its own index), adjacent cards land on different parts
// of the wave at any given instant — some up, some down — so the row reads
// as one continuous sine curve, not a rigid block and not per-card jitter.
// Only Y moves this way; x/z/rotateY stay fixed per card, so nothing shakes,
// twists, or drifts sideways — the motion is strictly vertical.
//
// WAVE_PHASE_STEP is the wave's spatial frequency: it's the phase (in
// radians) between one card and the next. A full sine cycle spans
// 2*PI / WAVE_PHASE_STEP cards, so this is picked so ~6 cards — roughly a
// screen's worth at the gallery's card spacing — show one complete cycle.
const WAVE_PHASE_STEP = (2 * Math.PI) / 6
// The wave's height at waveIntensity = 1 (the component's default). Every
// card shares the same wavePhase/waveEnvelope, so raising this just makes
// the one shared sine curve taller; it never moves any single card on its
// own.
const WAVE_MAX_Y_PX = 36

export default function ScrollVelocityGallery({
    items,
    className = "",
    // 0 = flat, no wave at all. 1 = the tuned default (WAVE_MAX_Y_PX
    // as-is). Values above 1 exaggerate it. This only scales the shared
    // vertical ripple amplitude below — it never changes the scroll/drag/
    // spring behavior that drives the group's position.
    waveIntensity = 2.5,
}: ScrollVelocityGalleryProps) {
    const n = items.length

    // Total input, in px, from wheel + drag combined — this is the single
    // source of truth for "how far through the list are we". It is now
    // intentionally UNBOUNDED: nothing clamps it, so the user can scroll or
    // drag forever in either direction. What used to keep this safe (the
    // min/max clamp) is replaced by `centerLoop` below, which keeps the
    // *rendered* window bounded instead of the input itself.
    const inputPx = useMotionValue(0)

    // Direction convention: scrolling/dragging DOWN or LEFT moves forward
    // (the slider goes "down"); scrolling/dragging UP or RIGHT moves
    // backward (the slider goes "up"). Both wheel and drag combine their
    // vertical and horizontal components into one signed forward amount.
    const handleWheel = (e: WheelEvent) => {
        inputPx.set(inputPx.get() + (e.deltaY - e.deltaX) * SCROLL_SPEED_MULTIPLIER)
    }
    const handlePan = (_: unknown, info: PanInfo) => {
        inputPx.set(inputPx.get() + (info.delta.y - info.delta.x) * SCROLL_SPEED_MULTIPLIER)
    }

    const sTarget = useTransform(inputPx, (px) => px / PX_PER_STEP)
    // The wave lives here: a single underdamped spring for the whole
    // group, not one per card — see the constants above.
    const smoothS = useSpring(sTarget, {
        stiffness: POSITION_STIFFNESS,
        damping: POSITION_DAMPING,
        mass: 1,
    })

    // Which "loop" of the product list is currently centered under the
    // camera, e.g. 0 while browsing the first pass through the list, 1
    // once the user has scrolled a full extra cycle forward, -1 a full
    // cycle backward, etc. `slots` below only ever mounts LOOPS copies on
    // either side of this value, so however far centerLoop drifts over a
    // long session, the mounted <Plane> count never grows past
    // (2*LOOPS+1)*n. This is a React state update — not a per-frame motion
    // value — so it only re-renders roughly once per full cycle scrolled
    // (once every n index-steps), not on every scroll tick.
    const [centerLoop, setCenterLoop] = useState(0)
    useMotionValueEvent(smoothS, "change", (latest) => {
        if (n === 0) return
        const nearest = Math.round(latest / n)
        if (nearest !== centerLoop) setCenterLoop(nearest)
    })

    // True velocity of the input itself (px/s), independent of whether the
    // page scrolls — this is what makes the wave's intensity track how
    // fast/forcefully the user is actually scrolling or dragging.
    const velocityFactor = useScrollVelocityFactor(smoothS)
    const targetEnvelope = useTransform(velocityFactor, (v) => Math.min(Math.abs(v), 1))

    // Group-level position: every card's own transform is static (see
    // Plane below); only this shared container moves.
    const groupX = useTransform(smoothS, (v) => -v * STEP.x)
    const groupY = useTransform(smoothS, (v) => -v * STEP.y + BASE_Y)
    const groupZ = useTransform(smoothS, (v) => -v * STEP.z)

    // A gentle envelope (0..1) tracking how fast the user is currently
    // scrolling/dragging — each card scales its own ripple by this, so the
    // whole wave grows with a fast input and settles back to flat as
    // velocity dies down.
    const waveEnvelope = useSpring(targetEnvelope, {
        stiffness: 80,
        damping: 25,
        mass: 0.8,
    })
    // LOOPS copies of the product list on each side of centerLoop, each
    // slot carrying a globalIndex used for its 3D position. As centerLoop
    // drifts with continued scrolling, this window slides along with it —
    // old, now-far-away copies are dropped and new ones are mounted in
    // their place — which is what makes the strip infinite instead of a
    // fixed-length strip that dead-stops at either end.
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
            <SectionHeading />

            <div
                className="relative flex h-full w-full items-center justify-center"
                style={{ perspective: 2000, perspectiveOrigin: "10% 10%" }}
            >
                <motion.div
                    className="relative flex cursor-grab items-center justify-center"
                    style={{
                        x: groupX,
                        y: groupY,
                        z: groupZ,
                        transformStyle: "preserve-3d",
                    }}
                    onPan={handlePan}
                    role="list"
                >
                    {slots.map(({ item, globalIndex }, key) => (
                        <Plane
                            key={`${item.id}-${key}`}
                            item={item}
                            globalIndex={globalIndex}
                            wavePhase={smoothS}
                            waveEnvelope={waveEnvelope}
                            waveIntensity={waveIntensity}
                        />
                    ))}
                </motion.div>
            </div>

            <ScrollHint />
        </section>
    )
}

function SectionHeading() {
    return (
        <div
            dir="ltr"
            className="absolute top-10 left-30 hidden select-none lg:block"
        >
            <StarboyLogo className="w-64 text-primary" />
        </div>
    )
}

function ScrollHint() {
    return (
        <div
            aria-hidden="true"
            className="colored pointer-events-none absolute right-[3vw] bottom-[3vw] z-20 flex items-center gap-2 text-[10px] tracking-wider uppercase lg:hidden"
        >
            اسکرول کنید
        </div>
    )
}

interface PlaneProps {
    item: ProductListItem
    globalIndex: number
    wavePhase: MotionValue<number>
    waveEnvelope: MotionValue<number>
    waveIntensity: number
}

function Plane({ item, globalIndex, wavePhase, waveEnvelope, waveIntensity }: PlaneProps) {
    const [hovered, setHovered] = useState(false)
    const Wrapper = motion.div

    // This card's own point on the shared wave — offset from every other
    // card's by globalIndex * WAVE_PHASE_STEP, so at any instant different
    // cards sit at different points in the sine cycle (some rising, some
    // falling) instead of all moving together or all shaking in place.
    // This is the only motion a card gets beyond its static base position:
    // vertical only, no rotation, no horizontal drift.
    //
    // Base position, wave ripple, and hover offset are combined into one
    // useTransform instead of three chained ones (rippleY -> y -> finalY).
    // Motion values recompute their whole dependency chain on every frame
    // for every mounted card, so with (2*LOOPS+1)*n cards on screen,
    // collapsing 3 transforms into 1 removes two full subscription/update
    // passes per card per frame — same visual result, a third of the work.
    const hoverY = useMotionValue(0)
    const finalY = useTransform(
        [wavePhase, waveEnvelope, hoverY],
        ([phase, envelope, hoverOffset]: number[]) =>
            globalIndex * STEP.y +
            Math.sin(phase - globalIndex * WAVE_PHASE_STEP) *
                envelope *
                WAVE_MAX_Y_PX *
                waveIntensity +
            hoverOffset
    )

    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <Wrapper
            // {...(item.slug && hasStock ? { href: `/p/${item.slug}` } : { href: `/#` })}
            role="listitem"
            className="absolute"
            style={{
                width: PLANE_W,
                height: PLANE_H,
                // x/z and rotateY stay static per card; only y carries the
                // continuously-varying sine offset. That's the whole wave —
                // no rotation, no horizontal movement, so nothing "shakes";
                // it's a single clean vertical sine curve across the row.
                // The clip/rasterization note that used to live here still
                // applies to x/z/rotateY — see the inner clipping div below
                // for why that split matters.
                x: globalIndex * STEP.x,
                y: finalY,
                z: globalIndex * STEP.z,
                rotateY: ROTATE_Y,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
            }}
            onHoverStart={() => {
                animate(hoverY, -40, {
                    type: "spring",
                    stiffness: 450,
                    damping: 22,
                })

                setHovered(true)
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onHoverEnd={() => {
                animate(hoverY, 0, {
                    type: "spring",
                    stiffness: 450,
                    damping: 22,
                })

                setHovered(false)
            }}
        >
            {/*
              Clipping/rounding lives on this inner, non-rotating-relative-
              to-itself layer rather than on the transformed root above —
              combining overflow-hidden with a live 3D transform on the
              *same* element is what produces jagged, aliased edges in
              Chromium. Splitting them keeps the clipped rectangle crisp.
            */}
            <div
                className="absolute inset-0 overflow-hidden rounded-3xl"
                style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
            >
                <Link href={`p/${item.slug}`} className="relative block h-full w-full">
                    <Image
                        src={item.images[0]?.image}
                        alt={item.title}
                        fill
                        sizes="320px"
                        draggable={false}
                        className={cn(
                            "border border-neutral-400/30 object-cover transition duration-150 select-none",
                            !hasStock && hovered && "blur-sm grayscale",
                            hovered ? "brightness-100" : "brightness-80"
                        )}
                        loading="lazy"
                    />
                </Link>

                {!hasStock && hovered && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition duration-150" />
                )}
            </div>

            {/*
              Hover label: sits outside the card to its right (not inside/
              on top of the image), counter-rotated so it reads flat and
              legible instead of inheriting the card's 3D tilt.
            */}
            <AnimatePresence>
                {hovered && (
                    <>
                        {!hasStock ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center xl:flex"
                            >
                                <div
                                    className="flex flex-col items-center gap-2 text-neutral-50"
                                    style={{
                                        textShadow: `
                    0 1px 2px rgba(0,0,0,.9),
                    0 0 8px rgba(0,0,0,.8),
                    0 0 16px rgba(0,0,0,.5)
                `,
                                    }}
                                >
                                    <Lock className="h-12 w-12" strokeWidth={1.8} />
                                    <p className="text-lg font-medium tracking-wide">ناموجود</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                className="pointer-events-none absolute z-0 hidden w-full rounded-t-2xl px-5 py-1.5 font-bold whitespace-nowrap text-neutral-50 xl:block"
                                style={{
                                    textShadow: `
										0 3px 6px rgba(0,0,0,.95),
										0 0 12px rgba(0,0,0,.9),
										0 0 24px rgba(0,0,0,.8),
										0 0 32px rgba(0,0,0,.7)
									`,
                                    transition: "text-shadow 0.3s ease-in-out",
                                }}
                            >
                                <p className="text-lg">{item.title}</p>

                                {item.variants?.[0] && (
                                    <p className="text-md mt-0.5">
                                        <span>{formatPrice(item.variants[0].price)}</span> تومان
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </Wrapper>
    )
}
