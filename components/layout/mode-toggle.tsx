"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <div>
            <Button
                variant={"ghost"}
                className="hidden cursor-pointer dark:flex"
                onClick={() => setTheme("light")}
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <Button
                variant={"ghost"}
                className="cursor-pointer dark:hidden"
                onClick={() => setTheme("dark")}
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        </div>
    )
}
