"use client"

import { useMemo, useState } from "react"
import type { MouseEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform, useMotionValueEvent } from "motion/react"
import type { MotionValue, PanInfo } from "motion/react"
import { Lock } from "lucide-react"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

const CARD_W = 340
const CARD_H = 470
const STEP_X = 150

const LOOPS = 1

const PX_PER_STEP = STEP_X

const POSITION_STIFFNESS = 260
const POSITION_DAMPING = 30

type Props = {
    items: ProductListItem[]
    className?: string
}

export default function MobileProductSlider({ items, className = "" }: Props) {
    const n = items.length

    const inputPx = useMotionValue(0)

    const handlePan = (_: unknown, info: PanInfo) => {
        inputPx.set(inputPx.get() - info.delta.x)
    }

    const SWIPE_VELOCITY_THRESHOLD = 500

    const handlePanEnd = (_: unknown, info: PanInfo) => {
        const current = sTarget.get()
        let nearestStep = Math.round(current)

        if (Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD) {
            nearestStep = info.velocity.x < 0 ? Math.ceil(current) : Math.floor(current)
            if (nearestStep === Math.round(current) && nearestStep === current) {
                nearestStep += info.velocity.x < 0 ? 1 : -1
            }
        }

        inputPx.set(nearestStep * PX_PER_STEP)
    }

    const sTarget = useTransform(inputPx, (px) => px / PX_PER_STEP)
    const smoothS = useSpring(sTarget, {
        stiffness: POSITION_STIFFNESS,
        damping: POSITION_DAMPING,
        mass: 0.85,
    })

    const [centerLoop, setCenterLoop] = useState(0)
    useMotionValueEvent(smoothS, "change", (latest) => {
        if (n === 0) return
        const nearest = Math.round(latest / n)
        if (nearest !== centerLoop) setCenterLoop(nearest)
    })

    const groupX = useTransform(smoothS, (v) => -v * STEP_X)

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
            className={cn(
                "relative flex h-screen w-full items-center justify-center overflow-hidden",
                className
            )}
        >
            <motion.div
                dir="rtl"
                role="list"
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                className="relative flex h-full w-full cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
                style={{ x: groupX }}
            >
                {slots.map(({ item, globalIndex }, key) => (
                    <Card
                        key={`${item.id}-${key}`}
                        item={item}
                        globalIndex={globalIndex}
                        smoothS={smoothS}
                        inputPx={inputPx}
                    />
                ))}
            </motion.div>
        </section>
    )
}

function Card({
    item,
    globalIndex,
    smoothS,
    inputPx,
}: {
    item: ProductListItem
    globalIndex: number
    smoothS: MotionValue<number>
    inputPx: MotionValue<number>
}) {
    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    const distance = useTransform(smoothS, (v) => globalIndex - v)
    const absDistance = useTransform(distance, (d) => Math.abs(d))

    const scale = useTransform(absDistance, [0, 1, 2], [1, 0.8, 0.66])
    const imageBlur = useTransform(absDistance, [0, 0.6, 1, 2], [0, 2, 6, 10])
    const imageFilter = useTransform(imageBlur, (b) => `blur(${b}px)`)
    const captionOpacity = useTransform(absDistance, [0, 0.4, 0.9], [1, 0.15, 0])
    const zIndex = useTransform(absDistance, (d) => Math.round(50 - d * 5))

    const handleClick = (e: MouseEvent) => {
        if (absDistance.get() > 0.5) {
            e.preventDefault()
            inputPx.set(globalIndex * PX_PER_STEP)
        }
    }

    return (
        <motion.div
            role="listitem"
            className="absolute"
            style={{
                width: CARD_W,
                height: CARD_H,
                x: globalIndex * STEP_X,
                scale,
                zIndex,
            }}
        >
            <Link
                href={`/p/${item.slug}`}
                onClick={handleClick}
                aria-label={item.title}
                className="relative block h-full w-full"
            >
                <motion.div
                    style={{ filter: imageFilter }}
                    className="relative h-full w-full overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 shadow-black/20 ring-black/5"
                >
                    {item.images[0]?.image && (
                        <Image
                            src={item.images[0].image}
                            alt={item.title}
                            fill
                            sizes="240px"
                            draggable={false}
                            className={cn(
                                "object-cover select-none",
                                !hasStock && "blur-sm brightness-75 grayscale"
                            )}
                        />
                    )}

                    {/* Shadow for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Product info */}
                    <motion.div
                        style={{ opacity: captionOpacity }}
                        className="absolute inset-x-0 bottom-0 z-10 p-4 text-white"
                    >
                        {item.variants?.[0] && (
                            <span>
                                <p
                                    className="line-clamp-1 text-lg font-semibold"
                                    style={{
                                        textShadow:
                                            "0 1px 2px rgba(0,0,0,.9), 0 0 8px rgba(0,0,0,.8)",
                                    }}
                                >
                                    {item.title}
                                </p>
                                <p
                                    className="mt-1 text-xs font-bold tabular-nums"
                                    style={{
                                        textShadow:
                                            "0 1px 2px rgba(0,0,0,.9), 0 0 8px rgba(0,0,0,.8)",
                                    }}
                                >
                                    {formatPrice(item.variants[0].price)}
                                    <span className="mr-1 text-[10px] font-medium opacity-90">
                                        تومان
                                    </span>
                                </p>
                            </span>
                        )}
                    </motion.div>

                    {!hasStock && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/35 text-white">
                            <Lock className="h-12 w-12" strokeWidth={1.8} />
                            <p className="text-lg font-medium tracking-wide">ناموجود</p>
                        </div>
                    )}
                </motion.div>
            </Link>
        </motion.div>
    )
}
