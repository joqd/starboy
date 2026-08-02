"use client"

import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "./ui/button"
import { ShoppingBag } from "lucide-react"
import { LoginDialog } from "./login-dialog"
import { usePathname } from "next/navigation"
import StarboyLogo from "./starboyLogo"

function MenuItems() {
    return (
        <div className="flex space-x-2">
            <LoginDialog />
            <Button className="ghost" variant="ghost" size="icon">
                <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <ModeToggle />
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
                    <div>
                        <MenuItems />
                    </div>

                    <StarboyLogo className="w-30 fill-primary" />
                </div>
            </div>
        </div>
    )
}
