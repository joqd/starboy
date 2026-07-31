import Image from "next/image"
import { Geist } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({
    subsets: ["latin"],
})

type RootLayoutProps = {
    children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("antialiased", "font-sans")}>
            <body className="relative h-screen w-screen overflow-hidden">
                <ThemeProvider>
                    <div className={geist.className}>{children}</div>
                    <div className="absolute bottom-0 left-0 hidden xl:block">
                        <Image
                            src="/images/baby-blue-movie.jpg"
                            alt="Starboy"
                            width={657}
                            height={841}
                            loading="eager"
                            draggable={false}
                            className="hidden w-120 object-contain select-none dark:block"
                        />

                        <Image
                            src="/images/baby-blue-movie-light.jpg"
                            alt="Starboy"
                            width={657}
                            height={841}
                            loading="eager"
                            draggable={false}
                            className="w-120 object-contain select-none dark:hidden"
                        />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
