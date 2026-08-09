"use client"

import { Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { LoginDialog } from "@/components/user/login-dialog"
import Cart from "@/components/cart/cart"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/hooks/use-audio"
import { cn } from "@/lib/utils"

function PlayRandomButton() {
    const { currentAudio, random, setPlaying } = useAudio()

    const handleClick = async () => {
        const audio = await random()
        if (audio) setPlaying(true)
    }

    const isVisible = !currentAudio

    return (
        <div
            className={cn(
                "flex transition-all duration-300",
                isVisible
                    ? "w-9 scale-100 opacity-100"
                    : "pointer-events-none w-0 scale-75 opacity-0"
            )}
        >
            <Button
                variant="outline"
                size="icon"
                onClick={handleClick}
                aria-label="پخش موزیک تصادفی"
            >
                <Music className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </div>
    )
}

function MenuItems() {
    return (
        <div className="flex items-center space-x-2">
            <div className="hidden lg:block">
                <PlayRandomButton />
            </div>
            <Cart />
            <ModeToggle />

            <Separator orientation="vertical" />
            <LoginDialog />
        </div>
    )
}

export default function FloatingMenu() {
    return (
        <div>
            <div className="fixed right-0 bottom-6 z-9999 hidden px-8 lg:block">
                <div className="flex items-center">
                    <MenuItems />
                </div>
            </div>

            <div dir="rtl" className="fixed top-0 left-0 z-9999 w-full lg:hidden">
                <div className="flex items-center justify-between border-b border-white/10 bg-background/70 px-5 py-3 backdrop-blur-2xl backdrop-saturate-150">
                    <div dir="ltr">
                        <MenuItems />
                    </div>
                </div>
            </div>
        </div>
    )
}
