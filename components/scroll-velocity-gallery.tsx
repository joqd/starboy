"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import type { WheelEvent } from "react"
import {
    motion,
    AnimatePresence,
    useTransform,
    useMotionValue,
    useSpring,
    animate,
} from "motion/react"
import type { MotionValue, PanInfo } from "motion/react"
import { useScrollVelocityFactor } from "@/lib/use-scroll-velocity"
import type { ScrollVelocityGalleryProps, ScrollVelocityItem } from "@/types/gallery"

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
// "real" one, so input can push past a loop boundary with no visible gap.
const LOOPS = 1

// How many px of wheel/drag input correspond to one product-index step.
// Using STEP.x keeps a roughly 1:1 feel between physical input and the
// resulting on-screen travel.
const PX_PER_STEP = STEP.x

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

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export default function ScrollVelocityGallery({
    items,
    heading = "HERITAGE",
    subheading = "FW25/26 COLLECTION",
    className = "",
    // 0 = flat, no wave at all. 1 = the tuned default (WAVE_MAX_Y_PX
    // as-is). Values above 1 exaggerate it. This only scales the shared
    // vertical ripple amplitude below — it never changes the scroll/drag/
    // spring behavior that drives the group's position.
    waveIntensity = 2.5,
}: ScrollVelocityGalleryProps) {
    const n = items.length

    // Total input, in px, from wheel + drag combined — this is the single
    // source of truth for "how far through the list are we", and it's
    // clamped at the source so it can never wander outside what the
    // buffered loop copies can cover.
    const inputPx = useMotionValue(0)
    const minPx = (-LOOPS * n + 1) * PX_PER_STEP
    const maxPx = ((LOOPS + 1) * n - 2) * PX_PER_STEP

    // Direction convention: scrolling/dragging DOWN or LEFT moves forward
    // (the slider goes "down"); scrolling/dragging UP or RIGHT moves
    // backward (the slider goes "up"). Both wheel and drag combine their
    // vertical and horizontal components into one signed forward amount.
    const handleWheel = (e: WheelEvent) => {
        const forward = e.deltaY - e.deltaX
        inputPx.set(clamp(inputPx.get() + forward, minPx, maxPx))
    }
    const handlePan = (_: unknown, info: PanInfo) => {
        const forward = info.delta.y - info.delta.x
        inputPx.set(clamp(inputPx.get() + forward, minPx, maxPx))
    }

    const sTarget = useTransform(inputPx, (px) => px / PX_PER_STEP)
    // The wave lives here: a single underdamped spring for the whole
    // group, not one per card — see the constants above.
    const smoothS = useSpring(sTarget, {
        stiffness: POSITION_STIFFNESS,
        damping: POSITION_DAMPING,
        mass: 1,
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
    // LOOPS copies of the product list on each side of the "real" one, each
    // slot carrying a globalIndex used both for its 3D position and its
    // ever-increasing index badge — this is what makes the strip read as
    // infinite rather than as a list that repeats and resets.
    const slots = useMemo(() => {
        const out: { item: ScrollVelocityItem; globalIndex: number; label: number }[] = []
        for (let loop = -LOOPS; loop <= LOOPS; loop++) {
            for (let i = 0; i < n; i++) {
                out.push({
                    item: items[i],
                    globalIndex: loop * n + i,
                    label: (loop + LOOPS) * n + i,
                })
            }
        }
        return out
    }, [items, n])

    if (n === 0) return null

    return (
        <section
            className={`relative h-screen w-full overflow-hidden ${className}`}
            onWheel={handleWheel}
        >
            <SectionHeading heading={heading} subheading={subheading} count={n} />

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
                    aria-label={`${heading} ${subheading}`}
                >
                    {slots.map(({ item, globalIndex, label }, key) => (
                        <Plane
                            key={`${item.id}-${key}`}
                            item={item}
                            globalIndex={globalIndex}
                            label={label}
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

function SectionHeading({
    heading,
    subheading,
    count,
}: {
    heading: string
    subheading: string
    count: number
}) {
    return (
        <div
            dir="rtl"
            className="pointer-events-none absolute top-[max(90px,3vw)] left-[3vw] z-20 hidden space-y-5 select-none lg:block"
        >
            <div className="ml-[4vw] text-[clamp(32px,5vw,64px)] leading-[0.9] font-bold tracking-[-0.02em] colored">
                {heading}
            </div>
            <div className="text-[clamp(24px,4vw,48px)] leading-[0.9] font-normal tracking-[-0.02em] colored">
                {subheading}
                <sup className="tracking-normal/70 relative top-[0.65em] ml-1 hidden align-top text-[clamp(10px,0.4em,0.4em)] leading-none font-semibold">
                    ({count})
                </sup>
            </div>
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
    item: ScrollVelocityItem
    globalIndex: number
    label: number
    wavePhase: MotionValue<number>
    waveEnvelope: MotionValue<number>
    waveIntensity: number
}

function Plane({ item, globalIndex, label, wavePhase, waveEnvelope, waveIntensity }: PlaneProps) {
    const [hovered, setHovered] = useState(false)
    const Wrapper = item.href ? motion.a : motion.div

    // This card's own point on the shared wave — offset from every other
    // card's by globalIndex * WAVE_PHASE_STEP, so at any instant different
    // cards sit at different points in the sine cycle (some rising, some
    // falling) instead of all moving together or all shaking in place.
    // This is the only motion a card gets beyond its static base position:
    // vertical only, no rotation, no horizontal drift.
    const rippleY = useTransform(
        [wavePhase, waveEnvelope],
        ([phase, envelope]: number[]) =>
            Math.sin(phase - globalIndex * WAVE_PHASE_STEP) *
            envelope *
            WAVE_MAX_Y_PX *
            waveIntensity
    )
    const y = useTransform(rippleY, (offset) => globalIndex * STEP.y + offset)

    const hoverY = useMotionValue(0)
    const finalY = useTransform(
        [y, hoverY],
        ([baseY, hoverOffset]) => Number(baseY) + Number(hoverOffset)
    )

    return (
        <Wrapper
            {...(item.href ? { href: item.href } : {})}
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
                animate(hoverY, -30, {
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
                className="absolute inset-0 overflow-hidden"
                style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
            >
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="320px"
                    draggable={false}
                    className="object-cover select-none rounded-sm"
                    loading="lazy"
                />
            </div>

            <span className="absolute -top-6 left-0 font-mono text-[10px] tracking-wider">
                {String(label).padStart(2, "0")}
            </span>

            {/*
              Hover label: sits outside the card to its right (not inside/
              on top of the image), counter-rotated so it reads flat and
              legible instead of inheriting the card's 3D tilt.
            */}
            <AnimatePresence>
                {hovered && (
                    <div className="text-ne mx-4 my-2 text-lg text-neutral-50">
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            className="pointer-events-none absolute hidden whitespace-nowrap xl:block"
                            style={{
                                textShadow: `
									0 1px 2px rgba(0,0,0,.9),
									0 0 8px rgba(0,0,0,.8),
									0 0 16px rgba(0,0,0,.5)
								`,
                            }}
                        >
                            <p className="font-medium tracking-wide">{item.name}</p>
                            {item.meta && <p className="mt-0.5 text-xs">{item.meta}</p>}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Wrapper>
    )
}
