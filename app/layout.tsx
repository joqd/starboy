import Image from "next/image"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type RootLayoutProps = {
    children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("antialiased", "font-sans")}>
            <body className="relative h-screen w-screen overflow-hidden">
                <ThemeProvider>
                    {children}
                    <div className="absolute bottom-0 left-0">
                        <Image
                            src="/images/baby-blue-movie.jpg"
                            alt="Starboy"
                            width={657}
                            height={841}
                            loading="eager"
                            draggable={false}
                            className="hidden w-64 object-contain select-none md:w-100 lg:w-120 dark:block"
                        />

                        <Image
                            src="/images/baby-blue-movie-light.jpg"
                            alt="Starboy"
                            width={657}
                            height={841}
                            loading="eager"
                            draggable={false}
                            className="w-64 object-contain select-none md:w-100 lg:w-120 dark:hidden"
                        />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
