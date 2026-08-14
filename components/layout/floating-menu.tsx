"use client"

import { Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { LoginDialog } from "@/components/user/login-dialog"
import { Rss } from "lucide-react"
import Cart from "@/components/cart/cart"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/hooks/use-audio"
import { cn } from "@/lib/utils"
import Link from "next/link"

function Space() {
    return <div className="w-1"></div>
}

function PlayRandomButton() {
    const { currentAudio, random, setPlaying } = useAudio()

    const handleClick = async () => {
        const audio = await random()
        if (audio) setPlaying(true)
    }

    const isVisible = !currentAudio

    return (
        <div>
            <div
                className={cn(
                    "flex transition-all duration-300",
                    isVisible
                        ? "w-9 scale-100 opacity-100"
                        : "pointer-events-none w-0 scale-75 opacity-0"
                )}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClick}
                    aria-label="پخش موزیک تصادفی"
                >
                    <Music className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </div>
        </div>
    )
}

function BlogButton() {
    return (
        <Link href={"/blog"}>
            <Button variant={"ghost"} className={"cursor-pointer"}>
                <Rss className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </Link>
    )
}

export default function FloatingMenu() {
    return (
        <div>
            <div className="fixed right-0 bottom-6 z-9999 hidden px-8 lg:block">
                <div className="flex items-center">
                    <div className="flex items-center gap-1 rounded-xl bg-accent px-2 py-1">
                        {/* <PlayRandomButton />  */}
                        <Cart />
                        <BlogButton />
                        <ModeToggle />
                        <LoginDialog />
                    </div>
                </div>
            </div>

            <div dir="rtl" className="fixed top-0 left-0 z-9999 w-full lg:hidden">
                <div className="mx-3 my-2 flex items-center justify-between rounded-2xl border border-background/40 bg-accent/80 px-2 py-1 backdrop-blur-xl dark:border-none">
                    <div className="flex items-center">
                        <Cart />
                        <BlogButton />
                        <ModeToggle />
                    </div>
                    <div className="flex items-center">
                        <LoginDialog />
                    </div>
                </div>
            </div>
        </div>
    )
}
