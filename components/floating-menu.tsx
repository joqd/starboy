"use client"

import { Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginDialog } from "./login-dialog"
import { usePathname } from "next/navigation"
import StarboyLogo from "./starboy-logo"
import Cart from "./cart"
import { Button } from "./ui/button"
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
        <div className="flex space-x-2">
            <PlayRandomButton />
            <Cart />
            <ModeToggle />

            <Separator className="" orientation="vertical" />
            <LoginDialog />
        </div>
    )
}

export default function FloatingMenu() {
    return (
        <div>
            <div className="fixed right-0 px-8 bottom-6 z-9999 hidden lg:block">
                <div className="flex items-center">
                    <MenuItems />
                </div>
            </div>

            <div dir="rtl" className="fixed top-0 left-0 z-9999 w-full lg:hidden">
                <div className="flex items-center justify-between px-5 py-3">
                    <div dir="ltr">
                        <MenuItems />
                    </div>

                    <StarboyLogo className="w-30 fill-primary" />
                </div>
            </div>
        </div>
    )
}
