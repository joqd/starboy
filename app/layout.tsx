import "./globals.css"
import { ThemeProvider } from "@/components/common/theme-provider"
import { cn } from "@/lib/utils"
import { AmbientGlow } from "@/components/layout/ambient-glow"
import localFont from "next/font/local"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toast"
import { MusicPlayer } from "@/components/music/music-player"
import { ViewTransitions } from "next-view-transitions"

const YekanBakh = localFont({
    src: "./assets/fonts/YekanBakh-Regular.woff2",
    variable: "--font-yekanbakh",
    display: "swap",
})

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
            <head>
                <link rel="icon" href="/favicon/red.svg" media="(prefers-color-scheme: light)" />
                <link rel="icon" href="/favicon/golden.svg" media="(prefers-color-scheme: dark)" />
            </head>
            <body className={`${inter.variable}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AmbientGlow />

                    <AuthProvider>
                        <ViewTransitions>{children}</ViewTransitions>
                    </AuthProvider>
                    <MusicPlayer />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
