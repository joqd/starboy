"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"

export function ModeToggle() {
    const { setTheme } = useTheme()
    const pathname = usePathname()

    return (
        <div>
            <div
                className="ghost hidden cursor-pointer dark:flex"
                onClick={() => setTheme("light")}
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </div>

            <div className="ghost cursor-pointer dark:hidden" onClick={() => setTheme("dark")}>
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </div>
        </div>
    )
}
