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
                className="w-100 object-contain select-none dark:hidden"
            />

            <div className="relative hidden aspect-657/841 w-100 dark:block">
                <Image
                    src="/images/baby-blue-movie.png"
                    alt="Starboy"
                    fill
                    loading="eager"
                    draggable={false}
                    className="object-contain grayscale select-none"
                />
            </div>
        </>
    )
}
