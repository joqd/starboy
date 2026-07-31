import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { HeroImage } from "@/components/hero-image"
import localFont from "next/font/local"

const YekanBakh = localFont({
    src: "./assets/fonts/YekanBakh-Regular.woff2",
    variable: "--font-yekanbakh",
    display: "swap",
})

type RootLayoutProps = {
    children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn("antialiased", "font-sans", YekanBakh.className)}
        >
            <body className="relative h-screen w-screen overflow-hidden">
                <ThemeProvider attribute="class">
                    <div>{children}</div>

                    <div className="absolute bottom-0 left-0 hidden xl:block">
                        <HeroImage />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
