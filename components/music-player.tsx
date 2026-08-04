"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import {
    ChevronDown,
    ChevronUp,
    Pause,
    Play,
    Repeat,
    Repeat1,
    Shuffle,
    SkipBack,
    SkipForward,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAudio } from "@/hooks/use-audio"

type RepeatMode = "off" | "all" | "one"

const SPRING = { type: "spring" as const, stiffness: 600, damping: 48 }
const SPRING_2 = { type: "spring" as const, stiffness: 500, damping: 48 }

// How long the expanded player waits with no interaction before it
// auto-minimizes itself.
const AUTO_HIDE_DELAY = 6000

function formatTime(totalSeconds: number) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00"
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function MusicPlayer() {
    const { currentAudio, isPlaying, setPlaying, setAudio, next, previous, random } = useAudio()

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const trackRef = useRef<HTMLDivElement | null>(null)

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off")
    const [shuffle, setShuffle] = useState(false)
    const [minimized, setMinimized] = useState(false)

    const handleNext = useCallback(async () => {
        if (shuffle) {
            await random()
        } else {
            await next()
        }
    }, [shuffle, next, random])

    const handlePrevious = useCallback(async () => {
        await previous()
    }, [previous])

    // Auto-minimize after a stretch of no interaction with the expanded
    // player. Any pointer interaction inside it (play/pause, seek, skip,
    // etc.) pushes the countdown back out via resetAutoHideTimer.
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearAutoHideTimer = useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }
    }, [])

    const resetAutoHideTimer = useCallback(() => {
        clearAutoHideTimer()
        hideTimerRef.current = setTimeout(() => setMinimized(true), AUTO_HIDE_DELAY)
    }, [clearAutoHideTimer])

    useEffect(() => {
        // Nothing to hide when the player is already minimized or closed.
        if (!currentAudio || minimized) {
            clearAutoHideTimer()
            return
        }

        resetAutoHideTimer()
        return clearAutoHideTimer
    }, [currentAudio?.id, minimized, clearAutoHideTimer, resetAutoHideTimer])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!currentAudio) setMinimized(false)
    }, [currentAudio])

    useEffect(() => {
        const audioEl = audioRef.current
        if (!audioEl || !currentAudio) return

        audioEl.src = currentAudio.url
        audioEl.load()
        setCurrentTime(0)
        setDuration(0)

        if (isPlaying) {
            audioEl.play().catch(() => setPlaying(false))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAudio?.id])

    useEffect(() => {
        const audioEl = audioRef.current
        if (!audioEl || !currentAudio) return

        if (isPlaying) {
            audioEl.play().catch(() => setPlaying(false))
        } else {
            audioEl.pause()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying])

    useEffect(() => {
        const audioEl = audioRef.current
        if (!audioEl) return

        const handleTimeUpdate = () => setCurrentTime(audioEl.currentTime)
        const handleDuration = () => {
            if (Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
                setDuration(audioEl.duration)
            }
        }
        const handleEnded = () => {
            if (repeatMode === "one") {
                audioEl.currentTime = 0
                audioEl.play()
                return
            }
            void handleNext()
        }

        audioEl.addEventListener("timeupdate", handleTimeUpdate)
        audioEl.addEventListener("loadedmetadata", handleDuration)
        audioEl.addEventListener("durationchange", handleDuration)
        audioEl.addEventListener("ended", handleEnded)

        if (Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
            setDuration(audioEl.duration)
        }

        return () => {
            audioEl.removeEventListener("timeupdate", handleTimeUpdate)
            audioEl.removeEventListener("loadedmetadata", handleDuration)
            audioEl.removeEventListener("durationchange", handleDuration)
            audioEl.removeEventListener("ended", handleEnded)
        }
    }, [repeatMode, handleNext])

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audioEl = audioRef.current
        const trackEl = trackRef.current
        if (!audioEl || !trackEl || !duration) return

        const rect = trackEl.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        const clamped = Math.min(1, Math.max(0, ratio))
        audioEl.currentTime = clamped * duration
        setCurrentTime(clamped * duration)
    }

    const cycleRepeatMode = () => {
        setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"))
    }

    const handleClose = () => {
        setPlaying(false)
        setAudio(null)
    }

    const progress = duration ? (currentTime / duration) * 100 : 0

    return (
        <main>
            {currentAudio && <audio ref={audioRef} preload="metadata" />}

            <AnimatePresence>
                {currentAudio &&
                    (minimized ? (
                        <motion.button
                            key="mini-tab"
                            initial={{ y: 56 }}
                            animate={{ y: 0 }}
                            exit={{ y: 56 }}
                            transition={SPRING_2}
                            onClick={() => setMinimized(false)}
                            aria-label="بازکردن پلیر"
                            className="fixed bottom-0 left-1/2 z-9999 flex w-20 -translate-x-1/2 justify-center rounded-t-xl border-t border-r border-l border-white/15 bg-rose-100 px-5 py-1.5 backdrop-blur-2xl backdrop-saturate-150 dark:bg-background/60"
                        >
                            <ChevronUp className="h-3.5 w-3.5 text-foreground" />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="player"
                            initial={{ y: 180 }}
                            animate={{ y: 0 }}
                            exit={{ y: 180 }}
                            transition={SPRING}
                            onPointerDownCapture={resetAutoHideTimer}
                            onMouseEnter={clearAutoHideTimer}
                            onMouseLeave={resetAutoHideTimer}
                            className="fixed bottom-2 left-1/2 z-9999 w-xs max-w-100 -translate-x-1/2 overflow-hidden rounded-3xl border border-white/15 bg-rose-100 backdrop-blur-3xl backdrop-saturate-150 lg:w-full dark:bg-background/55"
                        >
                            <div className="flex items-center gap-2.5 px-3 pt-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                                    {currentAudio.cover && (
                                        <Image
                                            src={currentAudio.cover}
                                            alt={currentAudio.title}
                                            fill
                                            sizes="36px"
                                            className={cn(
                                                "object-cover transition-transform duration-700",
                                                isPlaying && "scale-105"
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="font-inter min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold text-foreground">
                                        {currentAudio.title}
                                    </p>
                                    <p className="truncate text-[11.5px] opacity-80">
                                        {currentAudio.artist}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setMinimized(true)}
                                    aria-label="کوچک‌کردن پلیر"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground opacity-70 transition hover:opacity-100 active:scale-90"
                                >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>

                                <button
                                    onClick={handleClose}
                                    aria-label="بستن پلیر"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground opacity-70 transition hover:opacity-100 active:scale-90"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="px-3 pt-2.5">
                                <div
                                    ref={trackRef}
                                    onClick={handleSeek}
                                    className="group relative h-2.5 w-full cursor-pointer"
                                >
                                    <div className="absolute top-1/2 h-0.75 w-full -translate-y-1/2 rounded-full bg-foreground/15" />
                                    <div
                                        className="absolute top-1/2 h-0.75 -translate-y-1/2 rounded-full bg-primary"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <div
                                        className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover:opacity-100"
                                        style={{ left: `${progress}%` }}
                                    />
                                </div>
                                <div className="font-inter mt-0.5 flex items-center justify-between text-[9px] text-foreground tabular-nums">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-0.5 px-3 pt-0.5 pb-3">
                                <button
                                    onClick={() => setShuffle((s) => !s)}
                                    aria-label="پخش تصادفی"
                                    aria-pressed={shuffle}
                                    className="flex h-7 w-7 flex-col items-center justify-center gap-0.5 text-foreground transition active:scale-90"
                                >
                                    <Shuffle
                                        className={cn("h-3 w-3", shuffle && "text-foreground")}
                                        strokeWidth={shuffle ? 2.3 : 1.8}
                                    />
                                </button>

                                <button
                                    onClick={handlePrevious}
                                    aria-label="موزیک قبلی"
                                    className="flex h-7 w-7 items-center justify-center text-foreground transition active:scale-90"
                                >
                                    <SkipBack className="h-3.5 w-3.5" fill="currentColor" />
                                </button>

                                <button
                                    onClick={() => setPlaying(!isPlaying)}
                                    aria-label={isPlaying ? "توقف موزیک" : "پخش موزیک"}
                                    className="mx-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background transition active:scale-90 dark:text-white"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-3.5 w-3.5" fill="currentColor" />
                                    ) : (
                                        <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
                                    )}
                                </button>

                                <button
                                    onClick={handleNext}
                                    aria-label="موزیک بعدی"
                                    className="text-backgroun flex h-7 w-7 items-center justify-center transition active:scale-90"
                                >
                                    <SkipForward className="h-3.5 w-3.5" fill="currentColor" />
                                </button>

                                <button
                                    onClick={cycleRepeatMode}
                                    aria-label="حالت تکرار"
                                    className="flex h-7 w-7 flex-col items-center justify-center gap-0.5 text-muted-foreground transition active:scale-90"
                                >
                                    {repeatMode === "one" ? (
                                        <Repeat1
                                            className="h-3 w-3 text-foreground"
                                            strokeWidth={2.3}
                                        />
                                    ) : (
                                        <Repeat
                                            className={cn(
                                                "h-3 w-3",
                                                repeatMode === "all" && "text-foreground"
                                            )}
                                            strokeWidth={repeatMode === "all" ? 2.3 : 1.8}
                                        />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
            </AnimatePresence>
        </main>
    )
}
