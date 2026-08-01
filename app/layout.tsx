import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { HeroImage } from "@/components/hero-image"
import FloatingMenu from "@/components/floating-menu"
import { Toaster } from "@/components/ui/toast"
import { AmbientGlow } from "@/components/ambient-glow"
import localFont from "next/font/local"
import { Inter } from "next/font/google"

const YekanBakh = localFont({
    src: "./assets/fonts/YekanBakh-Regular.woff2",
    variable: "--font-yekanbakh",
    display: "swap",
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
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
            <body className={`${inter.variable} relative h-screen w-screen overflow-hidden`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <FloatingMenu />
                    <AmbientGlow />

                    {children}

                    <Toaster />

                    <div className="absolute bottom-0 left-0 hidden xl:block">
                        <HeroImage />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
