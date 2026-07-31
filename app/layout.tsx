import { Geist } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { HeroImage } from "@/components/hero-image"

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
                <ThemeProvider attribute="class">
                    <div className={geist.className}>{children}</div>

                    <div className="absolute bottom-0 left-0 hidden xl:block">
                        <HeroImage />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
