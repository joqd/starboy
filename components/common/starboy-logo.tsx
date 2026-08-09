import Image from "next/image"
import type { ComponentProps } from "react"

type StarboyLogoProps = Omit<ComponentProps<typeof Image>, "src" | "alt"> & {
    width?: number
    height?: number
}

const StarboyLogo = ({ className, width = 150, height = 150, ...props }: StarboyLogoProps) => {
    return (
        <>
            <Image
                src="/brand/red.svg"
                alt="Starboy"
                width={width}
                height={height}
                className={`${className ?? ""} dark:hidden`}
                {...props}
            />
            <Image
                src="/brand/golden.svg"
                alt="Starboy"
                width={width}
                height={height}
                className={`${className ?? ""} hidden dark:block`}
                {...props}
            />
        </>
    )
}

export default StarboyLogo
