"use client"

import Image from "next/image"

export function HeroImage() {
    return (
        <>
            <Image
                src="/images/baby-blue-movie-light.png"
                alt="Starboy"
                width={657}
                height={841}
                loading="eager"
                draggable={false}
                className="w-120 object-contain select-none dark:hidden"
            />

            <Image
                src="/images/baby-blue-movie.png"
                alt="Starboy"
                width={657}
                height={841}
                loading="eager"
                draggable={false}
                className="hidden w-120 object-contain select-none dark:block"
            />
        </>
    )
}
