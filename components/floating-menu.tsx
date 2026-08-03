"use client"

import { Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginDialog } from "./login-dialog"
import { usePathname } from "next/navigation"
import StarboyLogo from "./starboy-logo"
import Cart from "./cart"
import { useAudio } from "@/hooks/use-audio"

function PlayRandomButton() {
    const { isPlaying, random, setPlaying } = useAudio()

    if (isPlaying) return null

    const handleClick = async () => {
        const audio = await random()
        if (audio) setPlaying(true)
    }

    return (
        <div className="flex items-center">
            <button
                onClick={handleClick}
                aria-label="پخش موزیک تصادفی"
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 transition hover:text-foreground active:scale-90"
            >
                <Music className="h-4 w-4" />
            </button>
        </div>
    )
}

function MenuItems() {
    return (
        <div className="flex space-x-4">
            <PlayRandomButton />

            <div className="flex items-center">
                <LoginDialog />
            </div>
            <div className="flex items-center">
                <Cart />
            </div>
            <div className="flex items-center">
                <ModeToggle />
            </div>
        </div>
    )
}

export default function FloatingMenu() {
    const pathname = usePathname()

    return (
        <div>
            <div className="fixed right-6 bottom-6 z-9999 hidden lg:block">
                <div className="flex items-center">
                    <MenuItems />

                    {pathname === "/" && (
                        <>
                            <Separator className="mx-3" orientation="vertical" />
                            <div className="colored text-[10px]">اسکرول کنید</div>
                        </>
                    )}
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
