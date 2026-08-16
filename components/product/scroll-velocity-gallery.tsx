"use client"

import Image from "next/image"
import { Link } from "next-view-transitions"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import type { WheelEvent } from "react"
import StarboyLogo from "../common/starboy-logo"
import {
    motion,
    AnimatePresence,
    useTransform,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    useReducedMotion,
    animate,
} from "motion/react"
import { Lock } from "lucide-react"
import type { MotionValue, PanInfo } from "motion/react"
import { useScrollVelocityFactor } from "@/hooks/use-scroll-velocity"
import type { ScrollVelocityGalleryProps } from "@/types/gallery"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Responsive geometry
// ---------------------------------------------------------------------------
// Card size and per-step 3D translation differ between desktop and mobile:
// mobile gets a smaller card, a shorter step, and — the main ask — a much
// gentler rotateY so the row reads as a soft, easy-to-scan tilt instead of a
// steep desktop-style perspective on a small screen.
type GalleryMetrics = {
    planeW: number
    planeH: number
    step: { x: number; y: number; z: number }
    rotateY: number
    baseY: number
    waveMaxYPx: number
}

const DESKTOP_METRICS: GalleryMetrics = {
    planeW: 320,
    planeH: 384,
    step: { x: 260, y: -90, z: -288 },
    rotateY: -50,
    baseY: 100,
    waveMaxYPx: 36,
}

const MOBILE_METRICS: GalleryMetrics = {
    planeW: 190,
    planeH: 230,
    step: { x: 148, y: -46, z: -150 },
    // Gentle angle: roughly half the desktop tilt so cards face the viewer
    // much more directly and stay legible on a small screen.
    rotateY: -20,
    baseY: 60,
    waveMaxYPx: 20,
}

const MOBILE_BREAKPOINT = 768 // px, matches Tailwind's `md`

// Persists the raw, unbounded `inputPx` value (not the derived index) across
// route changes, so leaving for a product page and coming back restores the
// exact same spot instead of resetting to the start. sessionStorage (not a
// module-level variable) so it survives both SPA transitions and a hard
// reload/back-navigation within the same tab, and read/write only happen
// once per mount/unmount — never per animation frame.
const GALLERY_SCROLL_STORAGE_KEY = "gallery-scroll-position"

function readStoredScrollPosition(): number {
    if (typeof window === "undefined") return 0
    try {
        const saved = window.sessionStorage.getItem(GALLERY_SCROLL_STORAGE_KEY)
        const parsed = saved ? Number(saved) : 0
        return Number.isFinite(parsed) ? parsed : 0
    } catch {
        return 0
    }
}

// How many px of wheel/drag input correspond to one product-index step.
// Kept close to 1:1 with the card's own step so physical input and on-screen
// travel feel matched, on both desktop and mobile geometry.

// Small multiplier applied to raw wheel/drag input before it reaches the
// spring. The wave's depth is driven by input velocity (see waveEnvelope
// below), so nudging this up makes the same physical scroll/swipe register
// as slightly faster, more forceful input — which reads as a deeper wave —
// without touching the wave math itself. Kept close to 1 on purpose; this
// is a feel adjustment, not a redesign.
const SCROLL_SPEED_MULTIPLIER = 1.5

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

// ---------------------------------------------------------------------------
// Render window (this replaces the old "LOOPS" full-catalog mounting)
// ---------------------------------------------------------------------------
// How many cards to mount on EACH side of the centered index. This is a
// fixed, small constant — completely independent of how many products are
// in `items`. Only ~(2*RADIUS+1) <Plane> nodes are ever mounted, no matter
// whether the catalog has 10 products or 500. This is what makes the strip
// "infinite" cheaply: instead of tripling the whole list (the old
// `(2*LOOPS+1)*n` approach, which scaled with catalog size and was the
// actual source of the lag on weak devices), we keep a tiny sliding window
// of cards around the current position and re-map each slot's item via
// `index % n` as the window slides.
// Radius is a balance: big enough that a card's image has time to finish
// downloading before it scrolls into view (cards mount `radius` steps
// before they're centered), small enough to stay cheap. Since the total
// mounted count no longer scales with catalog size, this can comfortably be
// larger than the bare minimum needed for the visible frustum.
const DESKTOP_RADIUS = 12 // -> up to 25 mounted cards
const MOBILE_RADIUS = 5 // -> up to 11 mounted cards, lighter for weak phones

// Only cards within this distance of centerIndex are eager-loaded; the rest
// of the mobile render window is lazy. On mobile the render window (11
// cards) is wider than what's actually near the viewport, so eager-loading
// every mounted card means competing for bandwidth with the LCP image on
// slow connections. Desktop keeps everything eager (smaller relative cost,
// and desktop bandwidth/CPU isn't the bottleneck per the Lighthouse report).
const MOBILE_EAGER_RADIUS = 2

// Multiplier applied to `waveIntensity` on mobile. The wave is driven by a
// per-card useTransform recomputed every animation frame for every mounted
// card — on mobile's weaker CPUs (per the "Minimize main-thread work: 3.5s"
// / "5 long tasks" findings) that's real, measurable frame cost for an
// effect that reads as a much smaller visual detail on a small screen.
// Scaled down rather than zeroed so the row still feels alive.
const MOBILE_WAVE_SCALE = 0.4

function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
    // Deliberately NOT reading window.innerWidth in the initializer. Doing so
    // makes the client's first (hydration) render disagree with the server
    // (which always sees `desktop`, since window doesn't exist there) —
    // that's a hydration mismatch on every geometry value derived from this
    // flag. Starting both at `false` keeps hydration honest; the real value
    // is applied a moment later, after mount.
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
        const update = () => setIsMobile(mql.matches)
        update()
        mql.addEventListener("change", update)
        return () => mql.removeEventListener("change", update)
    }, [breakpoint])

    return isMobile
}

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
    const isMobile = useIsMobile()
    const reduceMotion = useReducedMotion()

    const metrics = useMemo(() => (isMobile ? MOBILE_METRICS : DESKTOP_METRICS), [isMobile])
    const radius = isMobile ? MOBILE_RADIUS : DESKTOP_RADIUS
    // On mobile (and for prefers-reduced-motion users) the wave costs real
    // frame time for very little visual payoff on a small screen — turn it
    // down instead of off, so the row still feels alive but cheaper to
    // compute every frame.
    const effectiveWaveIntensity = reduceMotion
        ? 0
        : isMobile
          ? waveIntensity * MOBILE_WAVE_SCALE
          : waveIntensity

    // Total input, in px, from wheel + drag combined — this is the single
    // source of truth for "how far through the list are we". It is
    // intentionally UNBOUNDED: nothing clamps it, so the user can scroll or
    // drag forever in either direction. Safety no longer comes from
    // clamping this value — it comes from the render window below, which
    // keeps the *mounted* card count constant regardless of how far this
    // drifts.
    //
    // Always starts at 0, matching the server render exactly — the saved
    // position (see the mount effect below) is applied AFTER hydration,
    // never read synchronously here. Reading sessionStorage during the
    // initial render would make the client's first paint disagree with the
    // server's (which has no sessionStorage), which is a hydration
    // mismatch — same category of bug as `useIsMobile` above, just for a
    // different value.
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

    const sTarget = useTransform(inputPx, (px) => px / metrics.step.x)
    // The wave lives here: a single underdamped spring for the whole
    // group, not one per card — see the constants above.
    const smoothS = useSpring(sTarget, {
        stiffness: POSITION_STIFFNESS,
        damping: POSITION_DAMPING,
        mass: 1,
    })

    // Which product index is currently centered under the camera, as a
    // plain (unbounded) integer — e.g. 0 at the start, 47 after scrolling
    // 47 steps forward, -12 after scrolling 12 steps back. This is a React
    // state update — not a per-frame motion value — and it only changes
    // when the nearest integer index actually changes, so it fires once per
    // index step, not every frame. Slot recomputation triggered by it is
    // cheap: the window size is a fixed small constant (see `slots` below),
    // not something that grows with the catalog.
    const [centerIndex, setCenterIndex] = useState(0)
    const centerIndexRef = useRef(0)
    useMotionValueEvent(smoothS, "change", (latest) => {
        if (n === 0) return
        const nearest = Math.round(latest)
        if (nearest !== centerIndexRef.current) {
            centerIndexRef.current = nearest
            setCenterIndex(nearest)
        }
    })

    // Cheap per-frame ref update (no re-render, no I/O) so the latest raw
    // position is always on hand; the actual sessionStorage write only
    // happens once, on unmount (see below), not on every change.
    const rawInputPxRef = useRef(0)
    useMotionValueEvent(inputPx, "change", (latest) => {
        rawInputPxRef.current = latest
    })

    // Restore, after mount (post-hydration, client-only — see the note on
    // `inputPx` above for why this can't happen during render). Reads the
    // real viewport width directly instead of trusting `isMobile`, since
    // `isMobile`'s own post-mount correction (see useIsMobile) may not have
    // landed yet in this same effect pass — this sidesteps that race
    // entirely rather than depending on its timing.

    useEffect(() => {
        const stored = readStoredScrollPosition()
        if (stored === 0) return
        const stepX =
            window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_METRICS.step.x : DESKTOP_METRICS.step.x
        const targetIndex = Math.round(stored / stepX)
        inputPx.set(stored)
        smoothS.jump(targetIndex)
        centerIndexRef.current = targetIndex
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCenterIndex(targetIndex)
    }, [inputPx, smoothS])

    useEffect(() => {
        return () => {
            try {
                window.sessionStorage.setItem(
                    GALLERY_SCROLL_STORAGE_KEY,
                    String(rawInputPxRef.current)
                )
            } catch {
                // sessionStorage can throw in private-browsing/quota edge
                // cases — losing the saved position is harmless, so just
                // skip it rather than crash the unmount.
            }
        }
    }, [])

    // True velocity of the input itself (px/s), independent of whether the
    // page scrolls — this is what makes the wave's intensity track how
    // fast/forcefully the user is actually scrolling or dragging.
    const velocityFactor = useScrollVelocityFactor(smoothS)
    const targetEnvelope = useTransform(velocityFactor, (v) => Math.min(Math.abs(v), 1))

    // Group-level position: every card's own transform is static (see
    // Plane below); only this shared container moves.
    const groupX = useTransform(smoothS, (v) => -v * metrics.step.x)
    const groupY = useTransform(smoothS, (v) => -v * metrics.step.y + metrics.baseY)
    const groupZ = useTransform(smoothS, (v) => -v * metrics.step.z)

    // A gentle envelope (0..1) tracking how fast the user is currently
    // scrolling/dragging — each card scales its own ripple by this, so the
    // whole wave grows with a fast input and settles back to flat as
    // velocity dies down.
    const waveEnvelope = useSpring(targetEnvelope, {
        stiffness: 80,
        damping: 25,
        mass: 0.8,
    })

    // A fixed-size sliding window of `radius` cards on each side of
    // centerIndex — (2*radius+1) slots total, ALWAYS, no matter how big
    // `items` is. Each slot's `globalIndex` is the real (unbounded) index
    // used for 3D position, and `index % n` maps it back to an actual
    // product — that wraparound is the entire "infinite" effect. Because
    // `globalIndex` is used directly as the React key, cards that stay
    // inside the window as it slides keep their component identity (no
    // remount); only the one or two cards that fall off one edge unmount
    // while one or two new ones mount at the other — never a bulk
    // remount of every visible card.
    const slots = useMemo(() => {
        if (n === 0) return []
        const out: { item: ProductListItem; globalIndex: number }[] = []
        for (let idx = centerIndex - radius; idx <= centerIndex + radius; idx++) {
            const i = ((idx % n) + n) % n
            out.push({ item: items[i], globalIndex: idx })
        }
        return out
    }, [items, n, centerIndex, radius])

    if (n === 0) return null

    return (
        <section
            className={`relative h-screen w-full overflow-hidden ${className}`}
            onWheel={handleWheel}
        >
            <SectionHeading />

            <div
                className="relative flex h-full w-full items-center justify-center"
                style={{
                    perspective: isMobile ? 1200 : 2000,
                    perspectiveOrigin: isMobile ? "50% 15%" : "10% 10%",
                }}
            >
                <motion.div
                    className="relative flex cursor-grab touch-pan-y items-center justify-center"
                    style={{
                        x: groupX,
                        y: groupY,
                        z: groupZ,
                        transformStyle: "preserve-3d",
                        willChange: "transform",
                    }}
                    onPan={handlePan}
                    role="list"
                >
                    {slots.map(({ item, globalIndex }) => (
                        <Plane
                            key={globalIndex}
                            item={item}
                            globalIndex={globalIndex}
                            wavePhase={smoothS}
                            waveEnvelope={waveEnvelope}
                            waveIntensity={effectiveWaveIntensity}
                            metrics={metrics}
                            isMobile={isMobile}
                            isNearCenter={
                                Math.abs(globalIndex - centerIndex) <= MOBILE_EAGER_RADIUS
                            }
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
        <Link href={"/"} dir="ltr" className="absolute top-20 left-20 hidden select-none lg:block">
            <StarboyLogo className="w-120 text-primary" />
        </Link>
    )
}

function ScrollHint() {
    return (
        <div
            aria-hidden="true"
            className="colored pointer-events-none absolute right-[3vw] bottom-[3vw] z-20 flex items-center gap-2 text-[10px] tracking-wider uppercase lg:hidden"
        >
            برای مرور بکشید
        </div>
    )
}

interface PlaneProps {
    item: ProductListItem
    globalIndex: number
    wavePhase: MotionValue<number>
    waveEnvelope: MotionValue<number>
    waveIntensity: number
    metrics: GalleryMetrics
    isMobile: boolean
    isNearCenter: boolean
}

// Wrapped in memo(): with the fixed-size render window above, most cards
// keep the same `globalIndex` key across renders as the window slides, so
// there's no reason for them to re-render just because the parent's `slots`
// array was recomputed. Only cards whose own props actually changed (a new
// item at that slot, or a metrics/isMobile flip) re-render.
const Plane = memo(function Plane({
    item,
    globalIndex,
    wavePhase,
    waveEnvelope,
    waveIntensity,
    metrics,
    isMobile,
    isNearCenter,
}: PlaneProps) {
    const [hovered, setHovered] = useState(false)
    const Wrapper = motion.div
    const { planeW, planeH, step, rotateY, waveMaxYPx } = metrics

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
    // for every mounted card, so with a small fixed render window this is
    // already cheap — collapsing 3 transforms into 1 shaves it further.
    const hoverY = useMotionValue(0)
    const finalY = useTransform(
        [wavePhase, waveEnvelope, hoverY],
        ([phase, envelope, hoverOffset]: number[]) =>
            globalIndex * step.y +
            Math.sin(phase - globalIndex * WAVE_PHASE_STEP) *
                envelope *
                waveMaxYPx *
                waveIntensity +
            hoverOffset
    )

    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <Wrapper
            role="listitem"
            className="absolute"
            style={{
                width: planeW,
                height: planeH,
                // x/z and rotateY stay static per card; only y carries the
                // continuously-varying sine offset. That's the whole wave —
                // no rotation, no horizontal movement, so nothing "shakes";
                // it's a single clean vertical sine curve across the row.
                x: globalIndex * step.x,
                y: finalY,
                z: globalIndex * step.z,
                rotateY,
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
            onTap={() => isMobile && setHovered((prev) => !prev)}
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
                        sizes={isMobile ? "190px" : "320px"}
                        draggable={false}
                        className={cn(
                            "border border-neutral-400/30 object-cover transition duration-150 select-none",
                            !hasStock && hovered && "blur-sm grayscale",
                            hovered ? "brightness-100" : "brightness-80"
                        )}
                        // Intentionally NOT loading="lazy" for cards near the
                        // centered index: the render window keeps the mounted
                        // count small and constant, so those cards' images are
                        // close enough to view to be worth fetching right away
                        // — `loading="lazy"` was adding an extra near-viewport
                        // delay on top of that, causing pop-in after scrolling.
                        // On mobile the window (11 cards) is still wider than
                        // what's near the viewport, so cards outside
                        // MOBILE_EAGER_RADIUS fall back to lazy instead of
                        // competing with the LCP image for bandwidth on slow
                        // connections. Desktop bandwidth isn't the bottleneck,
                        // so every desktop card stays eager.
                        loading={!isMobile || isNearCenter ? "eager" : "lazy"}
                        fetchPriority={isMobile && globalIndex === 0 ? "high" : "auto"}
                    />
                </Link>

                {!hasStock && hovered && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition duration-150" />
                )}

                {/*
                  Mobile has no hover, so touch users would otherwise never
                  see the title/price at all (the desktop label below is
                  hover-gated and hidden pre-xl). A small always-on gradient
                  caption gives them the same info at a glance, without
                  needing a tap.
                */}
                {isMobile && hasStock && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-3xl bg-linear-to-t from-black/80 via-black/30 to-transparent px-3 pt-6 pb-2 text-neutral-50">
                        <p className="truncate text-xs font-medium">{item.title}</p>
                        {item.variants?.[0] && (
                            <p className="mt-0.5 text-[11px] opacity-90">
                                <span>{formatPrice(item.variants[0].price)}</span> تومان
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/*
              Hover label: sits outside the card to its right (not inside/
              on top of the image), counter-rotated so it reads flat and
              legible instead of inheriting the card's 3D tilt. Desktop only
              (xl:) — mobile gets the always-on gradient caption above
              instead, since there's no hover on touch.
            */}
            {/*
              Desktop-only hover labels (xl: gated via CSS). Gating on
              `isMobile` here as well — not just via the `hidden xl:` classes
              below — skips mounting/animating these AnimatePresence children
              on mobile entirely, instead of paying for opacity/scale
              transitions on elements CSS was already hiding.
            */}
            <AnimatePresence>
                {!isMobile && hovered && (
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
                                <p className="overflow-wrap-anywhere wrap-break-word whitespace-normal">
                                    {item.title}
                                </p>

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
})

Plane.displayName = "Plane"
