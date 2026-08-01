"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"

export function ModeToggle() {
    const { setTheme } = useTheme()
    const pathname = usePathname()

    if (pathname.startsWith("/p/")) {
        return null
    }

    return (
        <div>
            <Button
                className="hidden cursor-pointer dark:flex ghost"
                onClick={() => setTheme("light")}
                variant="ghost"
                size="icon"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <Button
                className="cursor-pointer dark:hidden ghost"
                onClick={() => setTheme("dark")}
                variant="ghost"
                size="icon"
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </div>
    )
}
