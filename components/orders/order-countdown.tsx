"use client"

import { useEffect, useRef, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

function toPersianDigits(input: string) {
    return input.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)])
}

// Returns null if expiresAt is missing/invalid instead of NaN, so callers
// can decide to render nothing rather than a broken "NaN:NaN" countdown.
function getRemainingMs(expiresAt: string | null | undefined) {
    if (!expiresAt) return null
    const target = new Date(expiresAt).getTime()
    if (Number.isNaN(target)) return null
    return Math.max(0, target - Date.now())
}

function NumberChip({ value }: { value: string }) {
    return <span className="inline-block min-w-[1.4em] text-center tabular-nums">{value}</span>
}

function DurationText({ ms }: { ms: number }) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    const secondsText = toPersianDigits(String(seconds))

    if (minutes <= 0) {
        return (
            <>
                <NumberChip value={secondsText} /> ثانیه
            </>
        )
    }

    const minutesText = toPersianDigits(String(minutes))
    return (
        <>
            <NumberChip value={minutesText} /> دقیقه و <NumberChip value={secondsText} /> ثانیه
        </>
    )
}

export function OrderCountdown({
    expiresAt,
    onExpire,
    className,
}: {
    expiresAt: string | null | undefined
    // Called once, the instant the countdown reaches zero - lets the
    // parent refetch so is_payable/is_expired/status catch up.
    onExpire?: () => void
    className?: string
}) {
    const [remaining, setRemaining] = useState(() => getRemainingMs(expiresAt))
    const expiredFiredRef = useRef(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRemaining(getRemainingMs(expiresAt))
        expiredFiredRef.current = false

        if (!expiresAt) return

        const id = setInterval(() => {
            // Just update the value here - no side effects. Calling
            // onExpire from inside a setState updater fires it while React
            // is still rendering this component, which is what caused
            // "Cannot update a component while rendering a different
            // component". The separate effect below handles onExpire.
            setRemaining(getRemainingMs(expiresAt))
        }, 1000)

        return () => clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expiresAt])

    // Fires onExpire once, after render, the moment remaining reaches zero.
    useEffect(() => {
        if (remaining !== null && remaining <= 0 && !expiredFiredRef.current) {
            expiredFiredRef.current = true
            onExpire?.()
        }
    }, [remaining, onExpire])

    // expiresAt missing or unparsable - render nothing instead of NaN:NaN.
    if (remaining === null) return null

    if (remaining <= 0) {
        return (
            <span
                className={cn(
                    "flex items-center gap-1.5 text-xs font-medium text-destructive",
                    className
                )}
            >
                <Clock className="size-3.5" />
                مهلت پرداخت به پایان رسیده است
            </span>
        )
    }

    return (
        <span
            className={cn(
                "flex items-center gap-1.5 text-xs font-medium text-primary",
                className
            )}
        >
            <Clock className="size-3.5 shrink-0" />
            <span>
                برای پرداخت <DurationText ms={remaining} /> وقت دارید
            </span>
        </span>
    )
}
