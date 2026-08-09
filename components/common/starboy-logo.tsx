"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import type { ComponentProps } from "react"

type StarboyLogoProps = Omit<ComponentProps<typeof Image>, "src" | "alt"> & {
    width?: number
    height?: number
}

const StarboyLogo = ({ className, width = 225, height = 50, ...props }: StarboyLogoProps) => {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), [])

    const src = mounted && resolvedTheme === "dark" ? "/brand/text/golden.svg" : "/brand/text/red.svg"

    return (
        <Image
            src={src}
            alt="Starboy"
            width={width}
            height={height}
            priority
            className={className}
            {...props}
        />
    )
}

export default StarboyLogo