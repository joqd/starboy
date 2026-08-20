"use client"

import Image from "next/image"
import type { ComponentProps } from "react"

type StarboyLogoProps = Omit<ComponentProps<typeof Image>, "src" | "alt"> & {
    width?: number
    height?: number
}

const StarboyLogo = ({ className, width = 225, height = 50, ...props }: StarboyLogoProps) => {
    return (
        <>
            {/* Light */}
            <Image
                src="/brand/text/red.svg"
                alt="Starboy"
                width={width}
                height={height}
                priority
                className={`block dark:hidden h-auto ${className ?? ""}`}
                {...props}
            />

            {/* Dark */}
            <Image
                src="/brand/text/golden.svg"
                alt="Starboy"
                width={width}
                height={height}
                priority
                className={`hidden dark:block ${className ?? ""}`}
                {...props}
            />
        </>
    )
}

export default StarboyLogo
