"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <div>
            <Button
                className="hidden cursor-pointer dark:flex"
                onClick={() => setTheme("light")}
                variant="outline"
                size="icon"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <Button
                className="cursor-pointer dark:hidden"
                onClick={() => setTheme("dark")}
                variant="outline"
                size="icon"
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </div>
    )
}
