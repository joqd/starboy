"use client"

import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "./ui/button"
import { ShoppingBag } from "lucide-react"
import { LoginDialog } from "./login-dialog"

function MenuItems() {
    return (
        <div className="flex space-x-2">
            <LoginDialog />
            <Button variant="outline" size="icon">
                <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <ModeToggle />
        </div>
    )
}

export default function FloatingMenu() {
    return (
        <>
            <div className="fixed right-6 bottom-6 z-9999 hidden lg:block">
                <div className="flex items-center">
                    <MenuItems />

                    <Separator className={"mx-3"} orientation="vertical" />

                    <div className="text-[10px] colored">اسکرول کنید</div>
                </div>
            </div>

            <div className="fixed top-0 left-0 z-9999 w-full lg:hidden">
                <div className="flex items-center justify-between px-5 py-2.5">
                    <div>
                        <MenuItems />
                    </div>

                    <div className="text-2xl font-bold colored">استاربوی</div>
                </div>
            </div>
        </>
    )
}
