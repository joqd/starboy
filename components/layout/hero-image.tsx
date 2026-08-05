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
                className="w-130 object-contain select-none dark:hidden"
            />

            <div className="relative hidden aspect-657/841 w-130 dark:block">
                <Image
                    src="/images/baby-blue-movie.png"
                    alt="Starboy"
                    fill
                    loading="eager"
                    draggable={false}
                    className="object-contain grayscale select-none"
                />
                {/* <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: "linear-gradient(160deg, #062987 0%, #0548c6 100%)",
                        mixBlendMode: "color",
                        WebkitMaskImage: "url(/images/baby-blue-movie.png)",
                        WebkitMaskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskImage: "url(/images/baby-blue-movie.png)",
                        maskSize: "contain",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                    }}
                /> */}
            </div>
        </>
    )
}
