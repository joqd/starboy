"use client"

import Image from "next/image"

export function HeroImage({ priority = true }: { priority?: boolean }) {
    return (
        <>
            <Image
                src="/images/baby-blue-movie-light.png"
                alt="Starboy"
                width={657}
                height={841}
                loading={priority ? "eager" : "lazy"}
                draggable={false}
                className="w-100 object-contain select-none dark:hidden"
            />

            <div className="relative hidden aspect-657/841 w-100 dark:block">
                <Image
                    src="/images/baby-blue-movie.png"
                    alt="Starboy"
                    fill
                    loading={priority ? "eager" : "lazy"}
                    draggable={false}
                    className="object-contain grayscale select-none"
                />
            </div>
        </>
    )
}
