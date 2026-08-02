"use client"

import { useCallback, useRef, useState } from "react"
import { motion, useAnimation } from "motion/react"

type HoldToDeleteButtonProps = {
    label?: string
    completedLabel?: string
    holdDuration?: number
    onDelete?: () => void
    className?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ")
}

export default function HoldToDeleteButton({
    label = "نگه دارید تا حذف شود",
    completedLabel = "حذف شد",
    holdDuration = 2000,
    onDelete,
    className,
}: HoldToDeleteButtonProps) {
    const [isHolding, setIsHolding] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)

    const controls = useAnimation()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearHoldTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }

    const startHold = useCallback(() => {
        if (isCompleted) return

        setIsHolding(true)
        controls.start({
            scaleX: 1,
            transition: { duration: holdDuration / 1000, ease: "linear" },
        })

        timeoutRef.current = setTimeout(() => {
            setIsCompleted(true)
            setIsHolding(false)
            onDelete?.()
        }, holdDuration)
    }, [controls, holdDuration, isCompleted, onDelete])

    const cancelHold = useCallback(() => {
        if (isCompleted) return

        clearHoldTimeout()
        setIsHolding(false)
        controls.start({
            scaleX: 0,
            transition: { duration: 0.25, ease: "easeOut" },
        })
    }, [controls, isCompleted])

    return (
        <button
            type="button"
            disabled={isCompleted}
            aria-pressed={isHolding}
            aria-disabled={isCompleted}
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !e.repeat) startHold()
            }}
            onKeyUp={(e) => {
                if (e.key === "Enter" || e.key === " ") cancelHold()
            }}
            className={cn(
                "relative h-12 w-44 overflow-hidden rounded-xl select-none",
                "bg-white font-bold text-black",
                "touch-none [-webkit-user-select:none]",
                "transition-opacity disabled:cursor-not-allowed disabled:opacity-90",
                "focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none",
                className
            )}
        >
            <motion.div
                initial={{ scaleX: 0 }}
                animate={controls}
                style={{ originX: 1 }}
                className="absolute inset-0 bg-red-500"
            />

            <span
                className={cn(
                    "relative z-10 transition-colors duration-150",
                    isCompleted || isHolding ? "text-white" : "text-black"
                )}
            >
                {isCompleted ? completedLabel : label}
            </span>
        </button>
    )
}
