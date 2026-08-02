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
            <Button
                className="ghost hidden cursor-pointer dark:flex"
                onClick={() => setTheme("light")}
                variant="ghost"
                size="icon"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <Button
                className="ghost cursor-pointer dark:hidden"
                onClick={() => setTheme("dark")}
                variant="ghost"
                size="icon"
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </div>
    )
}
